#!/usr/bin/env bash

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "${REPO_ROOT}" ]]; then
  echo "Not inside a git repository."
  exit 1
fi

cd "${REPO_ROOT}"

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
BRANCH_REGEX="${AUTO_GIT_SYNC_BRANCH_REGEX:-^(feature|hotfix|bugfix)/}"
LOCK_FILE="${REPO_ROOT}/.git/auto-git-sync.lock"

IS_BRANCH_ALLOWED="yes"
if [[ -n "${BRANCH_REGEX}" ]] && [[ ! "${BRANCH}" =~ ${BRANCH_REGEX} ]]; then
  IS_BRANCH_ALLOWED="no"
fi

LOCK_PID=""
LOCK_PID_RUNNING="no"
if [[ -f "${LOCK_FILE}" ]]; then
  LOCK_PID="$(cat "${LOCK_FILE}" 2>/dev/null || true)"
  if [[ -n "${LOCK_PID}" ]] && ps -p "${LOCK_PID}" >/dev/null 2>&1; then
    LOCK_PID_RUNNING="yes"
  fi
fi

PROCESS_LINES="$(pgrep -af 'auto-git-sync.sh' | grep -v 'auto-git-sync-health.sh' || true)"
PROCESS_COUNT="0"
if [[ -n "${PROCESS_LINES}" ]]; then
  PROCESS_COUNT="$(printf '%s\n' "${PROCESS_LINES}" | sed '/^$/d' | wc -l | tr -d ' ')"
fi

STATUS_SUMMARY="inactive"
if [[ "${IS_BRANCH_ALLOWED}" == "yes" ]] && [[ "${LOCK_PID_RUNNING}" == "yes" || "${PROCESS_COUNT}" -gt 0 ]]; then
  STATUS_SUMMARY="active"
elif [[ "${IS_BRANCH_ALLOWED}" == "no" ]]; then
  STATUS_SUMMARY="blocked-by-branch"
fi

echo "Auto Git Sync Health"
echo "--------------------"
echo "Repo: ${REPO_ROOT}"
echo "Branch: ${BRANCH}"
echo "Branch regex: ${BRANCH_REGEX}"
echo "Branch allowed: ${IS_BRANCH_ALLOWED}"
echo "Lock file: ${LOCK_FILE}"
echo "Lock PID: ${LOCK_PID:-none}"
echo "Lock PID running: ${LOCK_PID_RUNNING}"
echo "Detected processes: ${PROCESS_COUNT}"
if [[ -n "${PROCESS_LINES}" ]]; then
  echo "Process list:"
  printf '%s\n' "${PROCESS_LINES}"
fi

echo "Working tree changes:"
git status --short || true

echo "Summary: ${STATUS_SUMMARY}"

if [[ "${STATUS_SUMMARY}" == "inactive" ]]; then
  echo "Hint: start it with: npm run git:auto-sync"
fi
if [[ "${STATUS_SUMMARY}" == "blocked-by-branch" ]]; then
  echo "Hint: switch to a branch matching ${BRANCH_REGEX}"
fi
