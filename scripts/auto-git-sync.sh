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
MESSAGE_PREFIX="${AUTO_GIT_SYNC_MESSAGE_PREFIX:-chore: auto-sync}"
BRANCH_REGEX="${AUTO_GIT_SYNC_BRANCH_REGEX:-}"
LOCK_FILE="${REPO_ROOT}/.git/auto-git-sync.lock"

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

echo "Watching branch '${BRANCH}' every ${INTERVAL}s for changes..."
echo "Press Ctrl+C to stop."

while true; do
  sleep "${INTERVAL}"

  if [[ -n "$(git status --porcelain)" ]]; then
    git add -A

    if git diff --cached --quiet; then
      continue
    fi

    COMMIT_MESSAGE="${MESSAGE_PREFIX} $(date '+%Y-%m-%d %H:%M:%S')"

    if git commit -m "${COMMIT_MESSAGE}"; then
      if git push origin "${BRANCH}"; then
        echo "Committed and pushed: ${COMMIT_MESSAGE}"
      else
        echo "Push failed. Leaving commit local until the next successful push."
      fi
    fi
  fi
done