#!/usr/bin/env bash
#
# Merge a drip bundle's TOOL_META.js into assets/site.js.
#
# A bundle that ships a new tool must NOT carry its own copy of
# assets/site.js: bundles prepared in parallel from the same base each
# overwrote the previous copy, so the last one published silently erased the
# menu entries of its siblings. Instead a bundle declares only its own entry
# and this script splices it into the live file, which cannot drop anything
# that is already there.
#
# TOOL_META.js format (markers on their own line):
#
#     @meta
#     "bossbarBuilder": {
#               "path": "/bossbar-builder/",
#               "guidePath": "/wiki-bossbar-builder/",
#               "sectionId": "how-to-guides"
#     }
#     @labels
#     "bossbarBuilder": {
#               "en": { "toolLabel": "...", ... },
#               "ru": { ... }, "fr": { ... }, "de": { ... }
#     }
#
# Re-running with an entry that is already present is a no-op, so a retried
# publish cannot produce duplicate keys.
#
# Usage: scripts/merge-tool-meta.sh <TOOL_META.js> [path/to/site.js]

set -euo pipefail

META_FILE="${1:-}"
SITE_JS="${2:-assets/site.js}"

if [[ -z "$META_FILE" ]]; then
  echo "usage: merge-tool-meta.sh <TOOL_META.js> [site.js]" >&2
  exit 2
fi
if [[ ! -f "$META_FILE" ]]; then
  echo "merge-tool-meta: no such file: $META_FILE" >&2
  exit 1
fi
if [[ ! -f "$SITE_JS" ]]; then
  echo "merge-tool-meta: no such file: $SITE_JS" >&2
  exit 1
fi

die() { echo "merge-tool-meta: $*" >&2; exit 1; }

# --- pull the two sections out of TOOL_META.js -----------------------------

section() {
  # Print lines between @<name> and the next @marker (or EOF).
  awk -v want="$1" '
    /^[[:space:]]*@[a-z]+[[:space:]]*$/ {
      gsub(/[[:space:]@]/, "", $0); active = ($0 == want); next
    }
    active { print }
  ' "$META_FILE"
}

meta_block="$(section meta)"
labels_block="$(section labels)"

[[ -n "${meta_block//[[:space:]]/}" ]]   || die "$META_FILE has no @meta section"
[[ -n "${labels_block//[[:space:]]/}" ]] || die "$META_FILE has no @labels section"

# Drop blank lines, then strip a trailing comma from the LAST line only if the
# author added one -- this script owns the separator between sibling entries.
# (Stripping per-line instead would eat the commas between the fields.)
strip_block() { sed -e '/^[[:space:]]*$/d' | sed -e '$ s/,[[:space:]]*$//'; }
meta_block="$(printf '%s\n' "$meta_block"     | strip_block)"
labels_block="$(printf '%s\n' "$labels_block" | strip_block)"

key_of() { printf '%s\n' "$1" | sed -n 's/^[[:space:]]*"\([A-Za-z0-9_]*\)"[[:space:]]*:.*/\1/p' | head -1; }
meta_key="$(key_of "$meta_block")"
labels_key="$(key_of "$labels_block")"

[[ -n "$meta_key" ]] || die "could not read the tool key from the @meta section"
[[ "$meta_key" == "$labels_key" ]] \
  || die "@meta key '$meta_key' does not match @labels key '$labels_key'"

balanced() {
  local o c
  o="$(printf '%s' "$1" | tr -cd '{' | wc -c)"
  c="$(printf '%s' "$1" | tr -cd '}' | wc -c)"
  [[ "$o" -eq "$c" && "$o" -gt 0 ]]
}
balanced "$meta_block"   || die "@meta section has unbalanced braces"
balanced "$labels_block" || die "@labels section has unbalanced braces"

# Every label locale the site renders must be present, otherwise the menu
# falls back to English for that language and nobody notices for weeks.
for loc in en ru fr de; do
  printf '%s\n' "$labels_block" | grep -q "\"$loc\"[[:space:]]*:" \
    || die "@labels section is missing the \"$loc\" locale"
done
for field in toolLabel catalogTitle catalogDesc catalogAction; do
  printf '%s\n' "$labels_block" | grep -q "\"$field\"[[:space:]]*:" \
    || die "@labels section is missing \"$field\""
done

# --- locate the meta/labels object literals in site.js ---------------------

meta_open="$(grep -n '^[[:space:]]*const meta = {' "$SITE_JS" | head -1 | cut -d: -f1)"
[[ -n "$meta_open" ]] || die "could not find 'const meta = {' in $SITE_JS"

# labels is the object literal immediately preceding meta.
labels_open="$(awk -v stop="$meta_open" '
  NR < stop && /^[[:space:]]*const labels = \{/ { line = NR } END { print line }
' "$SITE_JS")"
[[ -n "$labels_open" ]] || die "could not find 'const labels = {' before line $meta_open in $SITE_JS"

# Closing braces are the "};" lines at column 0 that bracket each literal.
labels_close="$(awk -v lo="$labels_open" -v stop="$meta_open" '
  NR > lo && NR < stop && /^};$/ { line = NR } END { print line }
' "$SITE_JS")"
meta_close="$(awk -v mo="$meta_open" '
  NR > mo && /^};$/ { print NR; exit }
' "$SITE_JS")"

[[ -n "$labels_close" ]] || die "could not find the closing '};' of the labels object"
[[ -n "$meta_close"   ]] || die "could not find the closing '};' of the meta object"

# --- idempotency -----------------------------------------------------------

already_in() {
  # Is "key": already declared between the two given lines?
  awk -v s="$1" -v e="$2" -v k="\"$3\"" '
    NR > s && NR < e && index($0, k ":") { found = 1 } END { exit !found }
  ' "$SITE_JS"
}

in_meta=0;   already_in "$meta_open"   "$meta_close"   "$meta_key" && in_meta=1
in_labels=0; already_in "$labels_open" "$labels_close" "$meta_key" && in_labels=1

if [[ "$in_meta" -eq 1 && "$in_labels" -eq 1 ]]; then
  echo "merge-tool-meta: '$meta_key' is already wired into $SITE_JS, nothing to do"
  exit 0
fi
if [[ "$in_meta" -ne "$in_labels" ]]; then
  die "'$meta_key' is present in only one of meta/labels in $SITE_JS -- fix by hand"
fi

# --- splice ----------------------------------------------------------------
# Insert before each closing "};", and put a comma on the entry that used to
# be last so the object literal stays valid.

tmp="$(mktemp)"; trap 'rm -f "$tmp"' EXIT

printf '%s\n' "$meta_block"   > "$tmp.meta"
printf '%s\n' "$labels_block" > "$tmp.labels"

awk -v lc="$labels_close" -v mc="$meta_close" \
    -v lf="$tmp.labels" -v mf="$tmp.meta" '
  NR == lc - 1 || NR == mc - 1 {
    # Close the previous entry with a comma before appending a sibling.
    sub(/[[:space:]]*$/, "")
    print $0 ","
    next
  }
  NR == lc { while ((getline line < lf) > 0) print line; print; next }
  NR == mc { while ((getline line < mf) > 0) print line; print; next }
  { print }
' "$SITE_JS" > "$tmp"

mv "$tmp" "$SITE_JS"
rm -f "$tmp.meta" "$tmp.labels"

echo "merge-tool-meta: added '$meta_key' to meta and labels in $SITE_JS"
