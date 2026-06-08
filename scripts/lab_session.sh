#!/usr/bin/env bash
# scripts/lab_session.sh
# Helpers to work safely on a shared lab PC:
# - start: set local git identity and credential cache (optional gh login)
# - commit: stage & commit changes (or allow-empty)
# - push: push current HEAD to a branch (recommended non-main)
# - end: logout from gh, clear credential cache and local git identity, run cleanup

set -euo pipefail
IFS=$'\n\t'

prog_name="lab_session.sh"

usage() {
  cat <<EOF
Usage: $prog_name <command> [options]

Commands:
  start --name NAME --email EMAIL [--timeout SECONDS]   Configure local git identity and credential cache
  commit -m MESSAGE [--allow-empty]                     Stage all and create a commit
  push --branch BRANCH [--remote origin] [--force]      Push HEAD to remote branch (recommended)
  end                                                   Logout & cleanup (gh logout, unset local git config, clear cache)
  help                                                  Show this message

Examples:
  $prog_name start --name "eduardo202020" --email "jguevaral@uni.pe" --timeout 3600
  $prog_name commit -m "feat: add X"
  $prog_name push --branch my-temp-branch
  $prog_name end
EOF
}

if [ $# -lt 1 ]; then
  usage
  exit 1
fi

cmd=$1; shift

case "$cmd" in
  start)
    NAME=""; EMAIL=""; TIMEOUT=3600
    while [ $# -gt 0 ]; do
      case "$1" in
        --name) NAME="$2"; shift 2;;
        --email) EMAIL="$2"; shift 2;;
        --timeout) TIMEOUT="$2"; shift 2;;
        --help|-h) usage; exit 0;;
        *) echo "Unknown arg: $1"; usage; exit 1;;
      esac
    done
    if [ -z "$NAME" ] || [ -z "$EMAIL" ]; then
      echo "Please provide --name and --email"
      exit 1
    fi

    echo "Setting local git identity for this repository..."
    git config --local user.name "$NAME"
    git config --local user.email "$EMAIL"
    git config --local credential.helper "cache --timeout=$TIMEOUT"

    echo "Local git identity and credential cache set (timeout=${TIMEOUT}s)."

    # Offer to run gh auth login
    if command -v gh >/dev/null 2>&1; then
      read -r -p "Do you want to run 'gh auth login' now to authenticate (y/N)? " resp
      if [[ "$resp" =~ ^[Yy]$ ]]; then
        gh auth login
      fi
    else
      echo "Note: 'gh' not found. You can still authenticate via HTTPS when pushing (you'll be prompted for PAT)."
    fi

    ;;

  commit)
    MESSAGE=""; ALLOW_EMPTY=0
    while [ $# -gt 0 ]; do
      case "$1" in
        -m) MESSAGE="$2"; shift 2;;
        --message) MESSAGE="$2"; shift 2;;
        --allow-empty) ALLOW_EMPTY=1; shift;;
        --help|-h) usage; exit 0;;
        *) echo "Unknown arg: $1"; usage; exit 1;;
      esac
    done

    if [ -z "$MESSAGE" ] && [ $ALLOW_EMPTY -eq 0 ]; then
      echo "Provide a commit message with -m 'message' or use --allow-empty to create an empty commit"
      exit 1
    fi

    echo "Staging all changes..."
    git add -A

    if [ $ALLOW_EMPTY -eq 1 ]; then
      git commit --allow-empty -m "$MESSAGE"
    else
      git commit -m "$MESSAGE"
    fi
    echo "Commit created."
    ;;

  push)
    BRANCH=""; REMOTE="origin"; FORCE=""
    while [ $# -gt 0 ]; do
      case "$1" in
        --branch) BRANCH="$2"; shift 2;;
        --remote) REMOTE="$2"; shift 2;;
        --force) FORCE="--force"; shift;;
        --help|-h) usage; exit 0;;
        *) echo "Unknown arg: $1"; usage; exit 1;;
      esac
    done

    if [ -z "$BRANCH" ]; then
      echo "Provide --branch BRANCH where to push (do not push directly to 'main' on public machines)."
      exit 1
    fi

    echo "Pushing to $REMOTE/$BRANCH..."
    # Use credential helper from config (cache) if set; but allow to force prompt by uncommenting the next line.
    # force prompt version: git -c credential.helper= push "$REMOTE" HEAD:refs/heads/"$BRANCH" $FORCE
    git push "$REMOTE" HEAD:refs/heads/"$BRANCH" $FORCE
    echo "Push completed (or failed)."
    ;;

  end)
    echo "Logging out and cleaning up..."

    if command -v gh >/dev/null 2>&1; then
      if gh auth status 2>/dev/null | grep -q "Logged in"; then
        echo "Running gh auth logout..."
        gh auth logout || true
      else
        echo "No gh session detected."
      fi
    fi

    echo "Clearing git credential cache (if any) and helpers..."
    git credential-cache exit 2>/dev/null || true
    git config --local --unset credential.helper 2>/dev/null || true
    git config --global --unset credential.helper 2>/dev/null || true

    echo "Removing local git user config..."
    git config --local --unset user.name 2>/dev/null || true
    git config --local --unset user.email 2>/dev/null || true

    echo "Clearing ssh-agent keys..."
    ssh-add -D 2>/dev/null || true

    # Run repository cleanup script if present
    if [ -f "$(pwd)/scripts/cleanup_lab_session.sh" ]; then
      echo "Running repository cleanup script..."
      bash "$(pwd)/scripts/cleanup_lab_session.sh"
    fi

    echo "End of session cleanup. Close browser windows and ensure you logged out from web services." 
    ;;

  help|-h)
    usage
    ;;

  *)
    echo "Unknown command: $cmd"
    usage
    exit 1
    ;;

esac

exit 0
