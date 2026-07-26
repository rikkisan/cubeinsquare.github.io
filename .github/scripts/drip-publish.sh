#!/usr/bin/env bash

set -euo pipefail

QUEUE_ROOT=".drip/queue"

if [[ ! -d "$QUEUE_ROOT" ]]; then
  echo "Queue directory does not exist: $QUEUE_ROOT"
  exit 0
fi

today="$(date -u +%Y-%m-%d)"
next_release=""
while IFS= read -r dir; do
  folder="$(basename "$dir")"
  release_date="${folder:0:10}"
  if [[ ! "$release_date" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
    echo "Skipping folder without a valid date prefix: $folder"
    continue
  fi
  if [[ "$release_date" > "$today" ]]; then
    echo "Next release $folder is scheduled for $release_date, not due yet."
    break
  fi
  next_release="$dir"
  break
done < <(find "$QUEUE_ROOT" -mindepth 1 -maxdepth 1 -type d ! -name '.*' | sort)

if [[ -z "$next_release" ]]; then
  echo "No queued releases found."
  exit 0
fi

payload_dir="$next_release/payload"
commit_title_file="$next_release/COMMIT_TITLE.txt"
commit_body_file="$next_release/COMMIT_BODY.txt"
delete_file="$next_release/DELETE.txt"

if [[ ! -d "$payload_dir" ]]; then
  echo "Queued release is missing payload/: $next_release"
  exit 1
fi

commit_title="Publish queued site update"
commit_body="Published automatically from the drip queue."

if [[ -f "$commit_title_file" ]]; then
  commit_title="$(head -n 1 "$commit_title_file")"
fi

if [[ -f "$commit_body_file" ]]; then
  commit_body="$(cat "$commit_body_file")"
fi

echo "Applying queued release: $next_release"

if [[ -f "$delete_file" ]]; then
  while IFS= read -r relative_path || [[ -n "$relative_path" ]]; do
    if [[ -z "$relative_path" ]]; then
      continue
    fi

    if [[ "$relative_path" == .* ]] || [[ "$relative_path" == /* ]]; then
      echo "Refusing to delete unsafe path: $relative_path"
      exit 1
    fi

    rm -rf -- "$relative_path"
  done < "$delete_file"
fi

rsync -av --exclude '.gitkeep' "$payload_dir"/ ./
rm -rf -- "$next_release"

git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git add -A

if git diff --cached --quiet; then
  echo "Nothing changed after applying release."
  exit 0
fi

git commit -m "$commit_title" -m "$commit_body"
git push
