#!/usr/bin/env bash
#
# Rebuild sitemap.xml from the filesystem.
#
# Every directory containing an index.html becomes a URL, except the service
# directories listed in SKIP_DIRS. lastmod comes from the file's last commit
# date, falling back to today for files git does not know about yet (which is
# the normal case for a page that is being published right now).
#
# This exists because drip bundles must NOT carry their own copy of
# sitemap.xml: when several bundles were prepared in parallel from the same
# base, each copy overwrote the previous one and silently dropped every URL it
# did not know about. Regenerating from the filesystem cannot drift that way.
#
# Usage:
#   scripts/generate-sitemap.sh            # rewrite sitemap.xml in place
#   scripts/generate-sitemap.sh --check    # exit 1 if sitemap.xml is stale
#   scripts/generate-sitemap.sh -o FILE    # write somewhere else

set -euo pipefail

BASE_URL="https://cubeinsquare.com"
OUTPUT="sitemap.xml"
CHECK_ONLY=0

# Non-hidden directories that never belong in a sitemap. Every dot-directory
# (.git, .github, .drip, .claude worktrees, ...) is skipped unconditionally --
# enumerating them by hand already let .claude/worktrees leak in once.
SKIP_DIRS="assets scripts node_modules"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --check) CHECK_ONLY=1; shift ;;
    -o|--output) OUTPUT="$2"; shift 2 ;;
    -h|--help) sed -n '2,20p' "$0"; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; exit 2 ;;
  esac
done

if [[ ! -f "index.html" ]]; then
  echo "generate-sitemap: must run from the repository root (no index.html here)" >&2
  exit 1
fi

# Build the prune expression for find so service directories are never entered.
# Any directory whose name starts with a dot is pruned wherever it appears.
prune_args=( -type d -name '.?*' -prune -o )
for d in $SKIP_DIRS; do
  prune_args+=( -path "./$d" -prune -o )
done

today="$(date -u +%Y-%m-%d)"
tmp="$(mktemp)"
trap 'rm -f "$tmp" "$tmp.paths"' EXIT

# Collect every directory that has an index.html, as a site-relative path.
# The repository root becomes the empty string, which renders as "/".
find . "${prune_args[@]}" -name index.html -type f -print \
  | sed 's|^\./||; s|/index\.html$||; s|^index\.html$||' \
  | LC_ALL=C sort -u > "$tmp.paths"

count=0
{
  echo '<?xml version="1.0" encoding="UTF-8"?>'
  echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'

  while IFS= read -r path; do
    if [[ -z "$path" ]]; then
      file="index.html"
      loc="$BASE_URL/"
    else
      file="$path/index.html"
      loc="$BASE_URL/$path/"
    fi

    # A file staged for this very release has no commit yet; treat it as new.
    lastmod="$(git log -1 --format=%ad --date=short -- "$file" 2>/dev/null || true)"
    [[ -z "$lastmod" ]] && lastmod="$today"

    printf '  <url>\n    <loc>%s</loc>\n    <lastmod>%s</lastmod>\n  </url>\n' \
      "$loc" "$lastmod"
    count=$((count + 1))
  done < "$tmp.paths"

  echo '</urlset>'
} > "$tmp"

if [[ "$CHECK_ONLY" -eq 1 ]]; then
  # Compare content only: a Windows checkout with core.autocrlf=true holds the
  # file as CRLF while this script writes LF, which would otherwise report
  # every single line as changed.
  if diff -q <(tr -d '\r' < "$OUTPUT") <(tr -d '\r' < "$tmp") >/dev/null 2>&1; then
    echo "generate-sitemap: $OUTPUT is up to date ($count URLs)"
    exit 0
  fi
  echo "generate-sitemap: $OUTPUT is STALE — run scripts/generate-sitemap.sh" >&2
  diff <(tr -d '\r' < "$OUTPUT") <(tr -d '\r' < "$tmp") | head -40 >&2 || true
  exit 1
fi

cat "$tmp" > "$OUTPUT"
echo "generate-sitemap: wrote $count URLs to $OUTPUT"
