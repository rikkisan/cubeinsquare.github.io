#!/usr/bin/env bash
#
# Publish at most one queued release from .drip/queue/.
#
# Order of operations matters here; each step earns its place:
#
#   1. pick the oldest bundle whose date prefix has actually arrived
#      (picking alphabetically once shipped autumn releases in July)
#   2. validate it, and refuse to publish anything that fails
#   3. copy the payload over the site
#   4. splice any TOOL_META.js into assets/site.js
#      (bundles must not carry their own copy -- parallel bundles used to
#      overwrite each other's menu entries)
#   5. regenerate sitemap.xml from the filesystem
#      (same reason; a carried copy silently dropped 200+ URLs once)
#   6. record the release in PUBLISHED.md so the log cannot drift
#   7. commit and push, rebasing if main moved underneath us
#
# DRIP_DRY_RUN=1 runs everything except the commit and push, and restores the
# working tree afterwards.

set -euo pipefail

QUEUE_ROOT=".drip/queue"
DRY_RUN="${DRIP_DRY_RUN:-0}"
LOG_FILE="PUBLISHED.md"

say() { echo "==> $*"; }

# GitHub renders this in the run summary; without it a skipped week looks
# exactly like a successful one.
summary() {
  echo "$*"
  [[ -n "${GITHUB_STEP_SUMMARY:-}" ]] && echo "$*" >> "$GITHUB_STEP_SUMMARY"
  return 0
}

if [[ "$DRY_RUN" != "0" ]]; then
  say "DRY RUN: nothing will be committed or pushed."
  # The dry run restores the tree with `git checkout -- . && git clean -fd`
  # afterwards, which would destroy uncommitted local work. Refuse to start
  # unless the tree is already clean, so that reset can only undo our own edits.
  if [[ -n "$(git status --porcelain)" ]]; then
    echo "drip-publish: working tree is not clean; commit or stash first." >&2
    echo "A dry run resets the tree afterwards and would discard these changes:" >&2
    git --no-pager status --short >&2
    exit 2
  fi
fi

if [[ ! -d "$QUEUE_ROOT" ]]; then
  summary "Queue directory does not exist: $QUEUE_ROOT"
  exit 0
fi

# --- 1. pick the next due bundle -------------------------------------------

today="$(date -u +%Y-%m-%d)"
next_release=""
queued=0

while IFS= read -r dir; do
  folder="$(basename "$dir")"
  release_date="${folder:0:10}"

  if [[ ! "$release_date" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
    say "Skipping folder without a valid date prefix: $folder"
    continue
  fi

  queued=$((queued + 1))

  if [[ -n "$next_release" ]]; then
    continue   # already chose one; keep counting the rest for the summary
  fi

  if [[ -f "$dir/HOLD" ]]; then
    say "On hold, skipping: $folder ($(head -n 1 "$dir/HOLD" 2>/dev/null || echo 'no reason given'))"
    continue
  fi

  if [[ "$release_date" > "$today" ]]; then
    say "Next release $folder is scheduled for $release_date, not due yet."
    continue
  fi

  next_release="$dir"
done < <(find "$QUEUE_ROOT" -mindepth 1 -maxdepth 1 -type d ! -name '.*' | sort)

if [[ -z "$next_release" ]]; then
  summary "No release is due today. $queued bundle(s) still queued."
  [[ "$queued" -lt 2 ]] && summary "Queue is running low -- consider preparing more releases." || true
  exit 0
fi

release_name="$(basename "$next_release")"
say "Selected release: $release_name"

# --- 2. validate ------------------------------------------------------------

if ! bash .github/scripts/drip-validate.sh "$next_release"; then
  summary "REJECTED: bundle '$release_name' failed validation and was NOT published."
  summary "Fix the bundle in the queue; the next scheduled run will retry it."
  exit 1
fi

payload_dir="$next_release/payload"
commit_title="Publish queued site update"
commit_body="Published automatically from the drip queue."

[[ -f "$next_release/COMMIT_TITLE.txt" ]] && commit_title="$(head -n 1 "$next_release/COMMIT_TITLE.txt")"
[[ -f "$next_release/COMMIT_BODY.txt"  ]] && commit_body="$(cat "$next_release/COMMIT_BODY.txt")"

# --- 3. apply the payload ---------------------------------------------------

delete_file="$next_release/DELETE.txt"
if [[ -f "$delete_file" ]]; then
  while IFS= read -r relative_path || [[ -n "$relative_path" ]]; do
    [[ -n "${relative_path// /}" ]] || continue
    case "$relative_path" in
      /*|.*|*..*)
        echo "Refusing to delete unsafe path: $relative_path" >&2
        exit 1 ;;
    esac
    say "Removing $relative_path"
    rm -rf -- "$relative_path"
  done < "$delete_file"
fi

say "Copying payload over the site"
cp -a "$payload_dir/." ./

# Remove only the placeholder files this payload introduced -- never a
# .gitkeep that already belonged to the site.
while IFS= read -r keep; do
  [[ -n "$keep" ]] || continue
  rm -f -- "${keep#"$payload_dir"/}"
done < <(find "$payload_dir" -name '.gitkeep' -type f)

# --- 4. menu entry ----------------------------------------------------------

if [[ -f "$next_release/TOOL_META.js" ]]; then
  say "Merging TOOL_META.js into assets/site.js"
  bash scripts/merge-tool-meta.sh "$next_release/TOOL_META.js" assets/site.js

  # site.js is loaded by every page; a syntax error there breaks the whole
  # site's navigation, so verify before it can reach a commit.
  if command -v node >/dev/null 2>&1; then
    node --check assets/site.js
    say "assets/site.js passes node --check"
  else
    say "WARNING: node not available, skipped syntax check of assets/site.js"
  fi
fi

# --- 5. sitemap -------------------------------------------------------------

say "Regenerating sitemap.xml"
bash scripts/generate-sitemap.sh

# --- 6. release log ---------------------------------------------------------

if [[ ! -f "$LOG_FILE" ]]; then
  printf '# Published releases\n\nAppended automatically by the drip publisher.\n\n' > "$LOG_FILE"
fi
printf -- '- %s — %s (`%s`)\n' "$today" "$commit_title" "$release_name" >> "$LOG_FILE"

rm -rf -- "$next_release"

# --- 7. commit & push -------------------------------------------------------

remaining="$(find "$QUEUE_ROOT" -mindepth 1 -maxdepth 1 -type d ! -name '.*' | wc -l)"

if [[ "$DRY_RUN" != "0" ]]; then
  say "DRY RUN: changes that would be committed:"
  git --no-pager status --short
  echo
  say "DRY RUN: commit message would be:"
  echo "    $commit_title"
  echo
  say "DRY RUN: restoring the working tree"
  git checkout -- .
  git clean -fd
  summary "Dry run OK: '$release_name' would publish cleanly. $remaining bundle(s) would remain queued."
  exit 0
fi

git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git add -A

if git diff --cached --quiet; then
  summary "Nothing changed after applying release '$release_name'."
  exit 0
fi

git commit -m "$commit_title" -m "$commit_body"

# main may have moved while this job ran; rebase rather than fail the release.
if ! git push; then
  say "Push rejected, rebasing onto the latest main and retrying"
  git pull --rebase origin main
  git push
fi

summary "Published: $commit_title (\`$release_name\`)"
summary "$remaining bundle(s) remain queued."
[[ "$remaining" -lt 2 ]] && summary "Queue is running low -- consider preparing more releases." || true
exit 0
