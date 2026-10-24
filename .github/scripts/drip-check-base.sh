#!/usr/bin/env bash
#
# Is a queued bundle's payload still based on the live site?
#
# A payload file is a snapshot that overwrites the live file on publish. If the
# live file changed after the snapshot was taken, publishing silently rolls
# those changes back. That is how the 2026-10-04 publish (3174b9e) undid three
# commits to the tools and wiki hubs in all four locales.
#
# BASE.txt in the bundle records the git blob hash of every live file the
# payload was prepared against (written by drip-base.sh). This script compares
# those hashes with what is live now:
#
#   - a recorded file has changed live since            -> FAIL, names the commits
#   - a hub page overwrites a live file without a record -> FAIL
#   - any other overwritten file without a record        -> WARN
#
# A payload file that already equals the live file is fine whatever its record
# says: publishing it rolls nothing back.
#
# Used by drip-validate.sh (so a stale bundle is never published) and by the
# Checks workflow, which runs it on every push for every queued bundle, so a
# stale copy shows up the day the live file changes, not on the release Sunday.
#
# Usage: .github/scripts/drip-check-base.sh .drip/queue/<bundle>
# Exit:  0 = nothing stale (warnings possible), 1 = stale or unrecorded hub

set -uo pipefail

BUNDLE="${1:-}"
[[ -n "$BUNDLE" ]] || { echo "usage: drip-check-base.sh <bundle-dir>" >&2; exit 2; }
BUNDLE="${BUNDLE%/}"

payload="$BUNDLE/payload"
base_file="$BUNDLE/BASE.txt"

errors=0

fail() { echo "  [FAIL] $*"; errors=$((errors + 1)); }
warn() { echo "  [WARN] $*"; }
ok()   { echo "  [ ok ] $*"; }

# Hub pages are the ones every release is tempted to carry a copy of, and the
# ones other people keep editing: homepage, tool catalog, wiki hub, 404.
is_hub() {
  [[ "$1" =~ ^((ru|fr|de)/)?((tools|wiki)/)?index\.html$ || "$1" == "404.html" ]]
}

# Hash of a file as git would store it (line-ending filters applied), or "-"
# when it does not exist.
blob_of() {
  if [[ -f "$1" ]]; then git hash-object -- "$1"; else echo "-"; fi
}

short() { [[ "$1" == "-" ]] && echo "(absent)" || echo "${1:0:7}"; }

[[ -d "$payload" ]] || { echo "  [WARN] $BUNDLE has no payload/; nothing to compare"; exit 0; }

# --- read BASE.txt ---------------------------------------------------------

declare -A recorded=()
if [[ -f "$base_file" ]]; then
  lineno=0
  while IFS= read -r line || [[ -n "$line" ]]; do
    lineno=$((lineno + 1))
    line="${line%$'\r'}"
    [[ -z "${line// /}" || "$line" == \#* ]] && continue
    sha="${line%%[[:space:]]*}"
    path="${line#"$sha"}"
    path="${path#"${path%%[![:space:]]*}"}"
    if [[ ! ( "$sha" =~ ^[0-9a-f]{40}$ || "$sha" == "-" ) || -z "$path" ]]; then
      fail "BASE.txt line $lineno is not '<40-hex blob hash or ->  <path>': $line"
      continue
    fi
    recorded["$path"]="$sha"
  done < "$base_file"
fi

# --- compare payload files with the live site ------------------------------

stale=()
unrecorded_hubs=()
unrecorded_other=()
compared=0

while IFS= read -r -d '' file; do
  rel="${file#"$payload"/}"
  [[ "$rel" == ".gitkeep" || "$rel" == */.gitkeep ]] && continue
  # Shared files in a payload are rejected by drip-validate.sh already.
  [[ "$rel" == "assets/site.js" || "$rel" == "sitemap.xml" ]] && continue

  now="$(blob_of "$rel")"

  if [[ -z "${recorded[$rel]+x}" ]]; then
    [[ "$now" == "-" ]] && continue          # a new page: nothing to overwrite
    if is_hub "$rel"; then unrecorded_hubs+=("$rel"); else unrecorded_other+=("$rel"); fi
    continue
  fi

  compared=$((compared + 1))
  want="${recorded[$rel]}"
  [[ "$now" == "$want" ]] && continue        # live file is as recorded
  [[ "$(blob_of "$file")" == "$now" ]] && continue   # payload already equals live
  stale+=("$rel")
done < <(find "$payload" -type f -print0 | sort -z)

# Commits that changed a live file after the recorded version, newest first.
# Walks the file's history until it reaches a commit that holds the recorded
# blob; everything before that came later.
print_changes() {
  local rel="$1" want="$2" c found=0 shown=0 total=0
  local -a later=()
  while IFS= read -r c; do
    if [[ "$want" != "-" && "$(git rev-parse -q --verify "$c:$rel" 2>/dev/null)" == "$want" ]]; then
      found=1
      break
    fi
    later+=("$c")
  done < <(git log --format=%h -- "$rel" 2>/dev/null)

  total=${#later[@]}
  if [[ "$total" -eq 0 ]]; then
    echo "         changed in the working tree, not committed yet"
    return
  fi
  if [[ "$want" != "-" && "$found" -eq 0 ]]; then
    echo "         (the recorded version is not in this clone's history; most recent commits:)"
    total=3
  fi
  for c in "${later[@]}"; do
    [[ "$shown" -ge 5 ]] && break
    [[ "$shown" -ge "$total" ]] && break
    echo "           $(git log -1 --format='%h %ad %s' --date=short "$c")"
    shown=$((shown + 1))
  done
  [[ "$total" -gt "$shown" ]] && echo "           ... and $((total - shown)) more"
}

for rel in "${stale[@]}"; do
  want="${recorded[$rel]}"
  now="$(blob_of "$rel")"
  if [[ "$want" == "-" ]]; then
    fail "$rel did not exist when the bundle was prepared, but is live now; publishing would overwrite it"
  elif [[ "$now" == "-" ]]; then
    fail "$rel was removed from the live site after the bundle was prepared; publishing would bring it back"
  else
    fail "$rel changed on the live site after the bundle was prepared ($(short "$want") -> $(short "$now"))"
  fi
  print_changes "$rel" "$want"
done

if [[ "${#stale[@]}" -gt 0 ]]; then
  echo "         Publishing would overwrite these changes with the bundle's older copy."
  echo "         Carry the bundle's edits onto the live files, then re-validate:"
  echo "           bash .github/scripts/drip-base.sh --update $BUNDLE"
fi

if [[ "${#unrecorded_hubs[@]}" -gt 0 ]]; then
  for rel in "${unrecorded_hubs[@]}"; do
    fail "$rel overwrites a live hub page but is not recorded in BASE.txt"
  done
  echo "         Without a record a stale copy cannot be detected. Record the live versions:"
  echo "           bash .github/scripts/drip-base.sh $BUNDLE"
fi

if [[ "${#unrecorded_other[@]}" -gt 0 ]]; then
  warn "${#unrecorded_other[@]} payload file(s) overwrite live pages with no BASE.txt record, so staleness is not checked: ${unrecorded_other[*]}"
  echo "         bash .github/scripts/drip-base.sh $BUNDLE   records them"
fi

for path in "${!recorded[@]}"; do
  [[ -f "$payload/$path" ]] || warn "BASE.txt lists $path, which is not in payload/"
done

if [[ "$errors" -eq 0 ]]; then
  if [[ "$compared" -gt 0 ]]; then
    ok "$compared payload file(s) recorded in BASE.txt are still based on the live site"
  elif [[ "${#unrecorded_other[@]}" -eq 0 ]]; then
    ok "payload overwrites no live pages, so there is nothing to go stale"
  fi
  exit 0
fi
exit 1
