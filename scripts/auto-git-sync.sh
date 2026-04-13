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
MESSAGE_PREFIX="${AUTO_GIT_SYNC_MESSAGE_PREFIX:-auto: sync changes}"
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

  COMMIT_MESSAGE="${MESSAGE_PREFIX} ($(date '+%Y-%m-%d %H:%M:%S'))"

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