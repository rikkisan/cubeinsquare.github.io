#!/usr/bin/env bash
#
# Preflight checks for one drip queue bundle.
#
# Every rule here exists because the corresponding mistake already shipped to
# the live site at least once. Refusing to publish is always cheaper than
# publishing something broken and finding out weeks later from Search Console.
#
# Usage: .github/scripts/drip-validate.sh .drip/queue/<bundle>
# Exit:  0 = safe to publish, 1 = rejected

set -uo pipefail

BUNDLE="${1:-}"
[[ -n "$BUNDLE" ]] || { echo "usage: drip-validate.sh <bundle-dir>" >&2; exit 2; }

errors=0
warnings=0

fail() { echo "  [FAIL] $*"; errors=$((errors + 1)); }
warn() { echo "  [WARN] $*"; warnings=$((warnings + 1)); }
ok()   { echo "  [ ok ] $*"; }

echo "Validating bundle: $BUNDLE"

# --- structure -------------------------------------------------------------

payload="$BUNDLE/payload"

if [[ ! -d "$payload" ]]; then
  fail "missing payload/ directory"
  echo "Rejected: $errors error(s)."
  exit 1
fi

if [[ ! -f "$BUNDLE/COMMIT_TITLE.txt" ]]; then
  fail "missing COMMIT_TITLE.txt"
else
  title="$(head -n 1 "$BUNDLE/COMMIT_TITLE.txt")"
  [[ -n "${title// /}" ]] || fail "COMMIT_TITLE.txt is empty"
fi

payload_files="$(find "$payload" -type f ! -name '.gitkeep' | wc -l)"
if [[ "$payload_files" -eq 0 ]]; then
  fail "payload/ contains no publishable files"
else
  ok "payload carries $payload_files file(s)"
fi

# --- shared files must never ride along ------------------------------------
# This is the bug that started it all: bundles prepared in parallel each
# carried assets/site.js and sitemap.xml, and whichever published last
# silently erased the other bundles' menu entries and sitemap URLs.

shared_hits=0
for shared in "assets/site.js" "sitemap.xml"; do
  if [[ -e "$payload/$shared" ]]; then
    fail "payload contains the shared file '$shared' -- it would overwrite the live copy."
    echo "         Declare a menu entry via TOOL_META.js instead; the sitemap is regenerated on publish."
    shared_hits=$((shared_hits + 1))
  fi
done
[[ "$shared_hits" -eq 0 ]] && ok "no shared files in payload"

# --- HTML sanity -----------------------------------------------------------

html_files="$(find "$payload" -type f -name '*.html')"
html_count="$(printf '%s' "$html_files" | grep -c . || true)"

if [[ "$html_count" -gt 0 ]]; then
  while IFS= read -r f; do
    [[ -n "$f" ]] || continue
    rel="${f#"$payload"/}"

    # A page shipped with noindex is invisible to search. That is occasionally
    # deliberate (redirect stubs), so only shout about real content pages.
    if grep -qi 'name="robots"[^>]*noindex' "$f" && ! grep -qi 'http-equiv="refresh"' "$f"; then
      fail "$rel is marked noindex but is not a redirect stub"
    fi

    grep -qi '<title>' "$f"                 || fail "$rel has no <title>"
    grep -qi 'name="description"' "$f"      || fail "$rel has no meta description"
    grep -qi 'rel="canonical"' "$f"         || warn "$rel has no canonical link"

    # Unbalanced structural tags mean the page will render wrong somewhere.
    for tag in html head body main article; do
      o="$(grep -o "<$tag[ >]" "$f" | wc -l)"
      c="$(grep -o "</$tag>" "$f" | wc -l)"
      [[ "$o" -eq "$c" ]] || fail "$rel has unbalanced <$tag> ($o open / $c close)"
    done
  done <<< "$html_files"
  ok "checked $html_count HTML file(s)"
fi

# --- localisation parity ---------------------------------------------------
# A route that exists in English but not in ru/fr/de leaves the language
# switcher pointing at a 404.

routes="$(printf '%s\n' "$html_files" \
  | sed "s|^$payload/||" \
  | grep -v '^\(ru\|fr\|de\)/' \
  | sed 's|/index\.html$||; s|\.html$||' \
  | grep -v '^assets' | sort -u)"

if [[ -n "${routes// /}" ]]; then
  while IFS= read -r route; do
    [[ -n "$route" ]] || continue
    for loc in ru fr de; do
      if [[ ! -f "$payload/$loc/$route/index.html" && ! -f "$payload/$loc/$route.html" ]]; then
        warn "route '/$route/' has no $loc translation in this bundle"
      fi
    done
  done <<< "$routes"
fi

# --- TOOL_META.js ----------------------------------------------------------

if [[ -f "$BUNDLE/TOOL_META.js" ]]; then
  # Validate the declaration by merging into a throwaway copy of site.js:
  # whatever the real merge would reject, this rejects now.
  probe="$(mktemp)"
  cp assets/site.js "$probe"
  if out="$(bash scripts/merge-tool-meta.sh "$BUNDLE/TOOL_META.js" "$probe" 2>&1)"; then
    ok "TOOL_META.js is valid ($out)"
  else
    fail "TOOL_META.js rejected: $out"
  fi
  rm -f "$probe"
fi

# --- DELETE.txt safety -----------------------------------------------------

if [[ -f "$BUNDLE/DELETE.txt" ]]; then
  while IFS= read -r p || [[ -n "$p" ]]; do
    [[ -n "${p// /}" ]] || continue
    case "$p" in
      /*|.*|*..*) fail "DELETE.txt has an unsafe path: $p" ;;
      assets/site.js|sitemap.xml|CNAME|ads.txt|robots.txt)
        fail "DELETE.txt would remove protected file: $p" ;;
      *) [[ -e "$p" ]] || warn "DELETE.txt lists a path that does not exist: $p" ;;
    esac
  done < "$BUNDLE/DELETE.txt"
fi

# --- verdict ---------------------------------------------------------------

echo
if [[ "$errors" -gt 0 ]]; then
  echo "REJECTED: $errors error(s), $warnings warning(s)."
  exit 1
fi
echo "PASSED: 0 errors, $warnings warning(s)."
exit 0
