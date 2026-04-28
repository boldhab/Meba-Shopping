#!/usr/bin/env bash

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "${REPO_ROOT}" ]]; then
  echo "This script must be run inside a git repository."
  exit 1
fi

cd "${REPO_ROOT}"

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
INTERVAL="${AUTO_GIT_SYNC_INTERVAL:-3}"
QUIET_PERIOD="${AUTO_GIT_SYNC_QUIET_PERIOD:-3}"
MESSAGE_PREFIX="${AUTO_GIT_SYNC_MESSAGE_PREFIX:-}"
BRANCH_REGEX="${AUTO_GIT_SYNC_BRANCH_REGEX:-}"
IGNORE_REGEX="${AUTO_GIT_SYNC_IGNORE_REGEX:-(^|/)(dist|build|coverage|\.next|out|tmp|temp)/|\.log$}"
KEYWORDS_CSV="${AUTO_GIT_SYNC_KEYWORDS:-auth,login,register,password,user,users,profile,customer,customers,cart,carts,checkout,order,orders,product,products,category,categories,catalog,inventory,stock,price,pricing,payment,payments,stripe,review,reviews,rating,ratings,wishlist,coupon,coupons,discount,discounts,shipping,address,analytics,dashboard,admin,report,reports,notification,notifications,webhook,webhooks,search,filter,sort}" 
REQUIRE_FLAG="${AUTO_GIT_SYNC_REQUIRE_FLAG:-0}"
ENABLE_FLAG="${AUTO_GIT_SYNC_ENABLE:-0}"
LOCK_FILE="${REPO_ROOT}/.git/auto-git-sync.lock"
AUTO_SYNC_GIT_USER_NAME="${AUTO_GIT_SYNC_GIT_USER_NAME:-Auto Sync Bot}"
AUTO_SYNC_GIT_USER_EMAIL="${AUTO_GIT_SYNC_GIT_USER_EMAIL:-auto-sync@local}"

if [[ "${REQUIRE_FLAG}" == "1" ]] && [[ "${ENABLE_FLAG}" != "1" ]]; then
  echo "AUTO_GIT_SYNC_REQUIRE_FLAG=1, but AUTO_GIT_SYNC_ENABLE is not set to 1."
  echo "Set AUTO_GIT_SYNC_ENABLE=1 to run auto-git-sync."
  exit 0
fi

if [[ -n "${BRANCH_REGEX}" ]] && [[ ! "${BRANCH}" =~ ${BRANCH_REGEX} ]]; then
  echo "Current branch '${BRANCH}' does not match AUTO_GIT_SYNC_BRANCH_REGEX='${BRANCH_REGEX}'."
  echo "auto-git-sync will not run on this branch."
  exit 0
fi

if [[ -f "${LOCK_FILE}" ]]; then
  EXISTING_PID="$(cat "${LOCK_FILE}" 2>/dev/null || true)"
  if [[ -n "${EXISTING_PID}" ]] && ps -p "${EXISTING_PID}" >/dev/null 2>&1; then
    echo "auto-git-sync is already running with PID ${EXISTING_PID}."
    exit 1
  fi
fi

# Ensure commits can be created even on fresh environments without Git identity configured.
if [[ -z "$(git config --get user.name || true)" ]]; then
  git config user.name "${AUTO_SYNC_GIT_USER_NAME}"
fi
if [[ -z "$(git config --get user.email || true)" ]]; then
  git config user.email "${AUTO_SYNC_GIT_USER_EMAIL}"
fi

echo "$$" > "${LOCK_FILE}"
cleanup() {
  rm -f "${LOCK_FILE}"
}
trap cleanup EXIT INT TERM

echo "Auto-sync active (${BRANCH} | pattern: ${BRANCH_REGEX:-any branch})"
echo "Polling every ${INTERVAL}s with ${QUIET_PERIOD}s quiet-period debounce."
echo "Ignore regex: ${IGNORE_REGEX}"
echo "Press Ctrl+C to stop."

LAST_STATUS_SNAPSHOT=""
LAST_CHANGE_EPOCH="0"

push_branch() {
  git push -u origin "${BRANCH}"
}

push_pending_commits() {
  local remote_ref="refs/remotes/origin/${BRANCH}"
  local ahead_count="0"

  if git show-ref --verify --quiet "${remote_ref}"; then
    ahead_count="$(git rev-list --count "origin/${BRANCH}..HEAD" 2>/dev/null || echo 0)"
    if (( ahead_count > 0 )); then
      if push_branch; then
        echo "Pushed pending local commits (${ahead_count}) to ${BRANCH}."
      else
        echo "Push retry failed. Will retry on next cycle."
      fi
    fi
    return
  fi

  # If this branch has no remote ref yet, attempt to publish it.
  if push_branch; then
    echo "Published branch ${BRANCH} and pushed local commits."
  else
    echo "Branch publish failed. Will retry on next cycle."
  fi
}

build_commit_message() {
  local add_count=0
  local update_count=0
  local delete_count=0
  local rename_count=0
  local -a area_preview=()
  local top_topic=""
  local primary_action="update"
  local scope_text="project"
  local keyword
  local lower_path

  declare -A area_counts=()
  declare -A topic_counts=()
  local -a topic_keywords=()
  IFS=',' read -r -a topic_keywords <<< "${KEYWORDS_CSV}"

  join_by() {
    local sep="$1"
    shift
    local out="$1"
    shift || true
    local item
    for item in "$@"; do
      out+="${sep}${item}"
    done
    echo "${out}"
  }

  while IFS=$'\t' read -r status path_old path_new; do
    [[ -z "${status}" ]] && continue

    case "${status:0:1}" in
      A) ((add_count += 1)) ;;
      M) ((update_count += 1)) ;;
      D) ((delete_count += 1)) ;;
      R) ((rename_count += 1)) ;;
    esac

    target_path="${path_new:-$path_old}"
    area="${target_path%%/*}"
    if [[ -z "${area}" ]] || [[ "${area}" == "${target_path}" ]]; then
      area="root"
    fi
    area_counts["${area}"]=$(( ${area_counts["${area}"]:-0} + 1 ))

    lower_path="${target_path,,}"
    for keyword in "${topic_keywords[@]}"; do
      keyword="$(echo "${keyword}" | xargs)"
      [[ -z "${keyword}" ]] && continue
      if [[ "${lower_path}" == *"${keyword}"* ]]; then
        topic_counts["${keyword}"]=$(( ${topic_counts["${keyword}"]:-0} + 1 ))
      fi
    done
  done < <(git diff --cached --name-status)

  if (( add_count > 0 && update_count == 0 && delete_count == 0 && rename_count == 0 )); then
    primary_action="add"
  elif (( delete_count > 0 && add_count == 0 && update_count == 0 && rename_count == 0 )); then
    primary_action="remove"
  elif (( rename_count > 0 && add_count == 0 && update_count == 0 && delete_count == 0 )); then
    primary_action="rename"
  else
    primary_action="update"
  fi

  if (( ${#topic_counts[@]} > 0 )); then
    top_topic="$(for t in "${!topic_counts[@]}"; do echo "${topic_counts[$t]} $t"; done | sort -nr | head -n1 | awk '{print $2}')"
  fi

  if (( ${#area_counts[@]} > 0 )); then
    mapfile -t area_preview < <(for a in "${!area_counts[@]}"; do echo "${area_counts[$a]} $a"; done | sort -nr | head -n2 | awk '{print $2}')
  fi

  if [[ ${#area_preview[@]} -gt 0 ]]; then
    scope_text="$(join_by ' and ' "${area_preview[@]}")"
  fi

  local base_message=""

  if [[ -n "${top_topic}" ]]; then
    base_message="${primary_action} ${top_topic} flow in ${scope_text}"
  else
    base_message="${primary_action} changes in ${scope_text}"
  fi

  if [[ -n "${MESSAGE_PREFIX}" ]]; then
    echo "${MESSAGE_PREFIX} ${base_message}"
  else
    echo "${base_message}"
  fi
}

while true; do
  sleep "${INTERVAL}"

  # Retry pushing any local commits that were created earlier but not yet synced.
  push_pending_commits

  CURRENT_STATUS="$(git status --porcelain)"

  if [[ -z "${CURRENT_STATUS}" ]]; then
    LAST_STATUS_SNAPSHOT=""
    LAST_CHANGE_EPOCH="0"
    continue
  fi

  NOW_EPOCH="$(date +%s)"
  if [[ "${CURRENT_STATUS}" != "${LAST_STATUS_SNAPSHOT}" ]]; then
    LAST_STATUS_SNAPSHOT="${CURRENT_STATUS}"
    LAST_CHANGE_EPOCH="${NOW_EPOCH}"
    continue
  fi

  if (( NOW_EPOCH - LAST_CHANGE_EPOCH < QUIET_PERIOD )); then
    continue
  fi

  git add -A

  if git diff --cached --quiet; then
    continue
  fi

  mapfile -t STAGED_FILES < <(git diff --cached --name-only)
  if [[ ${#STAGED_FILES[@]} -eq 0 ]]; then
    continue
  fi

  if [[ -n "${IGNORE_REGEX}" ]]; then
    FILES_TO_UNSTAGE=()
    for file in "${STAGED_FILES[@]}"; do
      if [[ "${file}" =~ ${IGNORE_REGEX} ]]; then
        FILES_TO_UNSTAGE+=("${file}")
      fi
    done

    if [[ ${#FILES_TO_UNSTAGE[@]} -gt 0 ]]; then
      git reset -q HEAD -- "${FILES_TO_UNSTAGE[@]}"
    fi
  fi

  if git diff --cached --quiet; then
    echo "Detected changes but all matched ignore rules. Skipping commit."
    LAST_STATUS_SNAPSHOT=""
    LAST_CHANGE_EPOCH="0"
    continue
  fi

  COMMIT_MESSAGE="$(build_commit_message)"

  if git commit -m "${COMMIT_MESSAGE}"; then
    if push_branch; then
      echo "Committed and pushed: ${COMMIT_MESSAGE}"
      LAST_STATUS_SNAPSHOT=""
      LAST_CHANGE_EPOCH="0"
    else
      echo "Push failed. Leaving commit local until the next successful push."
    fi
  fi
done