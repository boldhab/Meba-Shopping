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
MESSAGE_PREFIX="${AUTO_GIT_SYNC_MESSAGE_PREFIX:-auto:}"
BRANCH_REGEX="${AUTO_GIT_SYNC_BRANCH_REGEX:-}"
IGNORE_REGEX="${AUTO_GIT_SYNC_IGNORE_REGEX:-(^|/)(dist|build|coverage|\.next|out|tmp|temp)/|\.log$}"
REQUIRE_FLAG="${AUTO_GIT_SYNC_REQUIRE_FLAG:-0}"
ENABLE_FLAG="${AUTO_GIT_SYNC_ENABLE:-0}"
LOCK_FILE="${REPO_ROOT}/.git/auto-git-sync.lock"

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

build_commit_message() {
  local add_count=0
  local update_count=0
  local delete_count=0
  local rename_count=0
  local -a areas=()
  local -a summary_parts=()
  local -a area_preview=()

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

  add_area() {
    local area="$1"
    local existing
    for existing in "${areas[@]}"; do
      if [[ "${existing}" == "${area}" ]]; then
        return
      fi
    done
    areas+=("${area}")
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
    add_area "${area}"
  done < <(git diff --cached --name-status)

  (( add_count > 0 )) && summary_parts+=("add ${add_count}")
  (( update_count > 0 )) && summary_parts+=("update ${update_count}")
  (( delete_count > 0 )) && summary_parts+=("delete ${delete_count}")
  (( rename_count > 0 )) && summary_parts+=("rename ${rename_count}")

  if [[ ${#summary_parts[@]} -eq 0 ]]; then
    summary_parts+=("sync staged changes")
  fi

  area_preview=("${areas[@]:0:3}")
  area_text=""
  if [[ ${#area_preview[@]} -gt 0 ]]; then
    area_text=" in $(join_by ', ' "${area_preview[@]}")"
  fi

  action_text="$(join_by ', ' "${summary_parts[@]}")"

  if [[ ${#areas[@]} -gt 3 ]]; then
    echo "${MESSAGE_PREFIX} ${action_text}${area_text} and others"
  else
    echo "${MESSAGE_PREFIX} ${action_text}${area_text}"
  fi
}

while true; do
  sleep "${INTERVAL}"
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
    if git push origin "${BRANCH}"; then
      echo "Committed and pushed: ${COMMIT_MESSAGE}"
      LAST_STATUS_SNAPSHOT=""
      LAST_CHANGE_EPOCH="0"
    else
      echo "Push failed. Leaving commit local until the next successful push."
    fi
  fi
done