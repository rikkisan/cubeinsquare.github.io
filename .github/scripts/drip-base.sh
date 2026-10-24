#!/usr/bin/env bash
#
# Record, and keep current, which live files a bundle's payload was prepared
# against. The record is BASE.txt in the bundle; drip-check-base.sh compares it
# with the live site and drip-validate.sh refuses a bundle whose record is stale.
#
#   drip-base.sh --copy <bundle> <live-path>...
#       The way to start a hub page: copy each live file into the payload and
#       record its version in one step, so the record is true by construction.
#       Edit the payload copy afterwards. Paths are repo-relative, for example
#       tools/index.html ru/wiki/index.html.
#
#   drip-base.sh <bundle>
#       Record the live version of every payload file that BASE.txt does not
#       list yet ("-" for a file that does not exist live, i.e. a new page).
#       Entries that are already there are never touched, so this cannot hide
#       a stale file. It can only vouch that a copy came from the live file as
#       it is NOW, so run it right after copying and before editing, or use
#       --copy, which does both.
#
#   drip-base.sh --update <bundle>
#       For every recorded file that changed live since, carry the bundle's
#       edits onto the current live file (a three-way merge: recorded version
#       -> payload is applied to the live file) and record the new live
#       version. A conflict leaves <<<<<<< markers in the payload file, which
#       drip-validate.sh rejects until they are resolved.
#
# BASE.txt format, one file per line, sorted by path:
#
#   <git blob hash of the live file, or "-" if it did not exist>  <path>
#
# Usage: .github/scripts/drip-base.sh [--update | --copy] .drip/queue/<bundle> [live-path...]

set -uo pipefail

MODE="record"
case "${1:-}" in
  --update) MODE="update"; shift ;;
  --copy)   MODE="copy"; shift ;;
esac

BUNDLE="${1:-}"
[[ -n "$BUNDLE" ]] || { echo "usage: drip-base.sh [--update | --copy] <bundle-dir> [live-path...]" >&2; exit 2; }
BUNDLE="${BUNDLE%/}"
shift

payload="$BUNDLE/payload"
base_file="$BUNDLE/BASE.txt"

if [[ "$MODE" == "copy" ]]; then
  [[ -d "$BUNDLE" ]] || { echo "drip-base: $BUNDLE does not exist" >&2; exit 2; }
  mkdir -p "$payload"
fi
[[ -d "$payload" ]] || { echo "drip-base: $payload does not exist" >&2; exit 2; }

blob_of() {
  if [[ -f "$1" ]]; then git hash-object -- "$1"; else echo "-"; fi
}

short() { [[ "$1" == "-" ]] && echo "(absent)" || echo "${1:0:7}"; }

# The bytes git would commit for a file on disk (line-ending filters applied).
# Writing the object into .git is the only way to read the filtered form back;
# it is unreferenced and git gc removes it.
stored_blob() { git cat-file blob "$(git hash-object -w -- "$1")"; }

declare -A recorded=()
if [[ -f "$base_file" ]]; then
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%$'\r'}"
    [[ -z "${line// /}" || "$line" == \#* ]] && continue
    sha="${line%%[[:space:]]*}"
    path="${line#"$sha"}"
    path="${path#"${path%%[![:space:]]*}"}"
    [[ -n "$path" ]] && recorded["$path"]="$sha"
  done < "$base_file"
fi

write_base() {
  {
    echo "# Live versions this bundle's payload was prepared against."
    echo "# Written by .github/scripts/drip-base.sh; do not edit by hand."
    echo "# drip-validate.sh rejects the bundle when a listed file has changed live since."
    for path in "${!recorded[@]}"; do
      echo "${recorded[$path]}  $path"
    done | LC_ALL=C sort -k2
  } > "$base_file"
}

# --- copy: take live files into the payload, then record them below ----------

if [[ "$MODE" == "copy" ]]; then
  [[ "$#" -gt 0 ]] || { echo "drip-base: --copy needs at least one live path" >&2; exit 2; }
  for rel in "$@"; do
    rel="${rel#./}"
    if [[ ! -f "$rel" ]]; then
      echo "drip-base: $rel is not a live file; nothing to copy" >&2
      exit 2
    fi
    if [[ -e "$payload/$rel" ]]; then
      echo "  kept      $rel  (already in payload; use --update to refresh it)"
      continue
    fi
    mkdir -p "$(dirname "$payload/$rel")"
    cp "$rel" "$payload/$rel"
    echo "  copied    $rel"
  done
fi

# --- record files that BASE.txt does not list yet ---------------------------

added=0
while IFS= read -r -d '' file; do
  rel="${file#"$payload"/}"
  [[ "$rel" == ".gitkeep" || "$rel" == */.gitkeep ]] && continue
  [[ -n "${recorded[$rel]+x}" ]] && continue
  now="$(blob_of "$rel")"
  recorded["$rel"]="$now"
  added=$((added + 1))
  if [[ "$now" == "-" ]]; then
    echo "  recorded  $rel  (new page)"
  else
    echo "  recorded  $rel  (live $(short "$now"))"
  fi
done < <(find "$payload" -type f -print0 | sort -z)

if [[ "$added" -gt 0 && "$MODE" != "copy" ]]; then
  echo "drip-base: this assumes each overwritten file was copied from the live version above."
  echo "           If a copy was made earlier, run --update instead of trusting this record."
fi

# --- update: carry the bundle's edits onto the current live files -----------

conflicts=0
manual=0
merged=0

if [[ "$MODE" == "update" ]]; then
  tmp="$(mktemp -d)"
  trap 'rm -rf "$tmp"' EXIT

  for rel in "${!recorded[@]}"; do
    want="${recorded[$rel]}"
    now="$(blob_of "$rel")"
    pfile="$payload/$rel"
    [[ -f "$pfile" ]] || continue
    [[ "$now" == "$want" ]] && continue
    [[ "$(blob_of "$pfile")" == "$now" ]] && { recorded["$rel"]="$now"; continue; }

    if [[ "$want" == "-" || "$now" == "-" ]]; then
      echo "  MANUAL    $rel  (did not exist, or no longer exists, at one end; nothing to merge)"
      manual=$((manual + 1))
      continue
    fi
    if ! git cat-file -e "$want^{blob}" 2>/dev/null; then
      echo "  MANUAL    $rel  (recorded version $(short "$want") is not in this clone; fetch full history)"
      manual=$((manual + 1))
      continue
    fi

    # Merge all three in the form git stores them. A Windows checkout with
    # autocrlf keeps HTML as CRLF on disk and LF in the repository, and a
    # payload copied from git rather than from disk is LF, so merging the
    # on-disk bytes would see every line as changed.
    git cat-file blob "$want" > "$tmp/base"
    stored_blob "$rel"   > "$tmp/live"
    stored_blob "$pfile" > "$tmp/mine"
    cp "$tmp/live" "$tmp/live.orig"

    git merge-file -L "live now" -L "recorded base" -L "this bundle" "$tmp/live" "$tmp/base" "$tmp/mine"
    status=$?
    if [[ "$status" -lt 0 || "$status" -gt 127 ]]; then
      echo "  MANUAL    $rel  (git merge-file failed)"
      manual=$((manual + 1))
      continue
    fi

    cp "$tmp/live" "$pfile"
    recorded["$rel"]="$now"
    if [[ "$status" -eq 0 ]]; then
      # What the bundle now changes on the live page. For a hub that should be
      # exactly the edit you made; a much bigger number means the merge copied
      # something that is already live (a card added to the hub by hand, say).
      diff "$tmp/live.orig" "$tmp/live" > "$tmp/delta" || true
      plus="$(grep -c '^>' "$tmp/delta" || true)"
      minus="$(grep -c '^<' "$tmp/delta" || true)"
      echo "  merged    $rel  (live $(short "$want") -> $(short "$now"); now +$plus/-$minus lines against live)"
      merged=$((merged + 1))
    else
      echo "  CONFLICT  $rel  ($status conflict(s); resolve the <<<<<<< markers in the payload file)"
      conflicts=$((conflicts + 1))
    fi
  done
fi

write_base

echo "drip-base: wrote $base_file ($added recorded, $merged merged, $conflicts conflict(s), $manual manual)"
if [[ "$merged" -gt 0 ]]; then
  echo "           Check each merged file: its difference from the live file should be only your edit."
fi
if [[ "$conflicts" -gt 0 || "$manual" -gt 0 ]]; then
  echo "           Fix the files above, then run drip-validate.sh on the bundle."
  exit 1
fi
exit 0
