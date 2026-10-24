# CLAUDE.md — Cube in Square (cubeinsquare.com)

Entry point for a new AI session or a new collaborator. It is short on purpose and points to the
detailed documents instead of copying them (see [Document map](#document-map)).

## What this is

A static site of Minecraft tools (generators and builders) plus a wiki of guides, served by GitHub
Pages from this repo (`rikkisan/cubeinsquare.github.io`, custom domain in `CNAME`). Plain
HTML/CSS/JS: no framework, no bundler, no `package.json`, no build step. Four locales: English at
the root, plus `ru/`, `fr/`, `de/`. New tools and articles are mostly published on a schedule from
`.drip/queue/` (Sundays). Pages carry AdSense and GA4 (`assets/tracking.js`). Consent: Google's consent message (TCF CMP,
set up in AdSense) in the EEA, the UK and Switzerland, the site's own banner elsewhere ([ANALYTICS.md](ANALYTICS.md#consent)).

**Start of every session** (details: [COLLABORATION.md](COLLABORATION.md) §1): `git pull --rebase origin main`,
`git status --short`, `git log --oneline -5`, `ls .drip/queue`. `main` moves under you: the Sunday
bot and parallel sessions both push to it, and a parallel session may have uncommitted work in
the same tree, so stage your own files by name rather than `git add -A`.

## Layout

| Path | What lives there |
| --- | --- |
| `<slug>/index.html` | Tool page or hub (`tools/`, `wiki/`, `about/`, `privacy-policy/`). Clean URLs: every page is `dir/index.html`, links end in `/`. |
| `wiki-<slug>/index.html` | Wiki guide or article. A tool's guide is `wiki-<tool-slug>/`. |
| `ru/`, `fr/`, `de/` | Full mirrors of the English route tree, same slugs. |
| `assets/` | Shared `styles.css`, `site.js`, `tracking*.js`, `app.js`, plus one `<tool>.js` (and sometimes `.css`) per tool. |
| `tests/`, `scripts/` | Tests; sitemap generator, link checker, `TOOL_META.js` merger, the consent `<head>` block and its copier. |
| `.drip/queue/`, `.drip/template-release/`, `.drip/drafts/` | Scheduled releases; template for a new one; unpublished drafts nothing reads (see its README). |
| `.github/` | Workflows: `drip-publish.yml` (Sunday release), `checks.yml` (tests, links, stale queued bundles on every push and PR), `sitemap-refresh.yml` (bot keeps `sitemap.xml` current). Scripts: publisher, `drip-validate.sh`, `drip-base.sh` and `drip-check-base.sh` (stale payload protection). |
| `_config.yml` | Jekyll `exclude` list: keeps `*.md`, `scripts/` and `tests/` off the site. Pages builds with Jekyll, which never publishes dot-directories. New internal files outside those go on this list. |
| Root `*.html`, `en/`, `ru/*.html` | `noindex` redirect stubs for old URLs. Never add content to them. |
| `.claude/worktrees/` | Git-excluded scratch worktrees holding stale copies of these docs. Ignore them when grepping or globbing. |

18 tool pages are live, and `tools/index.html` (×4) has a static card for each. Add the card in the HTML: the
`site.js` fallback only injects tools that have `catalogTitle` in their labels, which most do not.

## Shared files: dangerous to touch

Each of these affects the whole site, so check it against `.drip/queue/` first and run the checks below afterwards.

- `assets/site.js` is loaded by every page. It holds the tool registry (`meta` + `labels` in 4 locales),
  rebuilds the Tools/Wiki dropdowns at runtime, ages out "new" badges, and loads the Beta node
  workspace. A syntax error breaks navigation everywhere. The drip pipeline edits it through `TOOL_META.js`.
- `assets/styles.css`: all layout and both themes. `assets/app.js`: resource-pack generator logic and 3D preview.
  `assets/tracking.js`, `assets/tracking-config.js`: analytics and consent (events and parameters: [ANALYTICS.md](ANALYTICS.md)).
- The Consent Mode block in the `<head>` of every page with the AdSense tag or `tracking.js`, just before the tag. Its source
  is `scripts/consent-defaults.txt`: edit that and run `node scripts/apply-consent-defaults.mjs`, never the copies by hand.
  `tests/analytics.test.cjs` fails on a page without the current block (queued payloads included).
- Hubs, which are the pages queued payloads like to carry stale copies of: `index.html`, `tools/index.html`,
  `wiki/index.html` and their `ru/`, `fr/`, `de/` copies. `404.html` too. A bundle that carries one needs it
  recorded in `BASE.txt`, and a push that changes one fails Checks while a queued bundle still has an old copy (see Drip publishing).
- Never edit or delete: `CNAME`, `ads.txt`, `robots.txt`, `favicon.ico`, `server-icon.png`.
- Generated: `sitemap.xml` (use `scripts/generate-sitemap.sh`) and `PUBLISHED.md` (appended by the bot).
- Deleted on 2026-10-24, only in git history now (`git log --all -- <path>`): the Windows Script Host article generators
  `generate_articles*.js` and `update_wiki_index.js`, `scripts/generate-future-tool-bundles.mjs`, `scripts/migrate-clean-urls.ps1`
  and the legacy `universal_generator.html` (its `Disallow` line stays in `robots.txt`, which is not edited).
- Encoding: files are UTF-8. Do not write them through PowerShell `Set-Content` without `-Encoding utf8`,
  and never put a backtick-r-n sequence in a string (it once leaked into the wiki grids; `tests/wiki-content.test.cjs` guards it).

## Locales

- Every page is a standalone HTML file per locale. There is no i18n file or templating, so the page chrome is
  duplicated and a shared change must be made in all four copies. Menu entries are the exception: `site.js` builds them at runtime.
- Each page needs: `<html lang>`, a `canonical` (`/ru/...` for Russian), five `hreflang` alternates (en, ru, fr, de,
  `x-default`), `og:locale` with alternates, language-switch links in the navbar, and JSON-LD. Copy a sibling page and
  replace everything rather than writing the head from scratch.
- Shared scripts read `<html lang>` to pick strings. Write native copy for each language, not literal translation.
- Tools ship in all four locales together. Two articles are English-only on purpose (`wiki-data-components-architecture`,
  `wiki-resource-pack-migration-1-21-4`): their `ru/fr/de` URLs are redirect stubs and the localized hubs do not list them.

## Add a tool: file checklist

1. `<slug>/index.html` and `ru|fr|de/<slug>/index.html`, copied from a sibling tool; `assets/<slug>.js` (+ `.css`).
2. Guide: `wiki-<slug>/index.html` in all four locales.
3. Menu entry and labels (all four locales). Drip release: a `TOOL_META.js` in the bundle. Direct commit: add to `meta` and `labels` in `assets/site.js`.
4. Catalog card in `tools/index.html` × 4: pill `new` plus `data-released="YYYY-MM-DD"` (the site turns it into `ready` after 45 days).
5. Guide card in `wiki/index.html` × 4, next to the neighbouring tool guides.
6. Homepage metric ("N Live browser tools") in `index.html` × 4, edited by hand. `tests/homepage-tool-count.test.cjs` fails, locally and in Checks, unless it equals the number of live tools.
7. Form-based constructor: add the slug to the `constructorPath` list in `assets/site.js` and to `tests/constructor-nodes.browser.js`.
8. Sitemap: do nothing and do not commit `sitemap.xml`. `sitemap-refresh.yml` regenerates it after any push that changes an `.html` file, and after every drip publish; `git pull --rebase` picks up the bot's commit.
9. Analytics: add the slug to `TOOL_SLUGS` in `assets/tracking.js` (`tests/analytics.test.cjs` fails otherwise), load `tracking-config.js` and `tracking.js` on the tool page and its guide, and report copy, download and examples as described in [ANALYTICS.md](ANALYTICS.md#adding-a-tool).
   Keep the consent block and the AdSense tag from the sibling's `<head>`; `node scripts/apply-consent-defaults.mjs` adds them if missing.

## Add an article: file checklist

1. `wiki-<slug>/index.html` × 4 locales, or a written decision to leave locales for later.
2. A card in the right section of `wiki/index.html` × 4. Most non-tool articles are not in the Wiki dropdown, so the hub is how readers find them.
3. Links from related guides, then the sitemap as in tool step 8.
4. No thin pages: AdSense review needs substance. Details: [RELEASE_ROADMAP.md](RELEASE_ROADMAP.md).

## Drip publishing in brief

1. A release is a folder `.drip/queue/YYYY-MM-DD-slug/` with `payload/` (mirrors the site), `COMMIT_TITLE.txt`, `BASE.txt` (required when the payload overwrites a hub), optional `TOOL_META.js`, `DELETE.txt`, `HOLD`; start from `.drip/template-release/`.
2. Every Sunday 09:00 UTC the oldest bundle whose date has arrived is validated, copied over the site, logged in `PUBLISHED.md`, committed to `main` and removed from the queue. A failing bundle stays queued.
3. `assets/site.js` and `sitemap.xml` must never be in a payload (validation rejects it): use `TOOL_META.js`; the sitemap regenerates.
4. **Stale copies.** A payload file is a snapshot that overwrites the live file on publish, so a hub copied weeks earlier rolls back every commit made to it since (2026-10-04, see RELEASE_ROADMAP.md). `BASE.txt` records the git blob hash of the live file each payload file was copied from.
   - Start hubs with `bash .github/scripts/drip-base.sh --copy .drip/queue/<bundle> tools/index.html wiki/index.html ...`: it copies the live files and records them, and you edit the copies. Never run plain `drip-base.sh` on a hub copied earlier; it records today's hash and hides that the copy is old.
   - `drip-validate.sh` (so the publisher) rejects a bundle whose recorded live file changed since and names the commits, and a hub with no record. Other overwritten files without a record only warn.
   - Checks runs the same test (`drip-check-base.sh`) on every queued bundle at every push. If your push to a hub turns it red, run `bash .github/scripts/drip-base.sh --update .drip/queue/<bundle>` (three-way merge of the bundle's edit onto the new live file), read the `+N/-M` line it prints, and commit the bundle.
5. Check with `bash .github/scripts/drip-validate.sh .drip/queue/<bundle>`, or a dry run (below). Full rules, including why hubs are copied rather than patched in: [DRIP_PUBLISHING.md](DRIP_PUBLISHING.md).

## Tests and checks

```bash
node --test tests/*.test.cjs                        # unit tests, Node 20+ (not `node --test tests/`, which fails)
node --check assets/site.js                         # also for any tool script you changed
node scripts/check-links.mjs                        # internal links, hreflang, title/description/canonical
bash scripts/generate-sitemap.sh --check            # exit 1 if sitemap.xml is stale; only a warning in CI, the bot fixes it
node scripts/apply-consent-defaults.mjs --check     # pages whose consent <head> block is missing or out of date
bash .github/scripts/drip-check-base.sh .drip/queue/<bundle>   # is the payload still based on the live site
bash .github/scripts/drip-validate.sh .drip/queue/<bundle>
DRIP_DRY_RUN=1 bash .github/scripts/drip-publish.sh # needs a clean tree and resets it afterwards
git diff --check
```

Browser regression for the Beta node workspace (11 constructors × 4 locales): serve the repo on
`127.0.0.1:8765` (for example `python -m http.server 8765`), then run the command in the header of
`tests/constructor-nodes.browser.js`. For any UI change, also open the page in two locales, in both themes,
at 360 / 768 / 1440 px. That is what PRs #6–#10 verified.

Browser checks never reach the live GA4: local hosts and `file://` only log to the console, and `?analytics_test=1` sends to the fictitious `G-TEST000000` to inspect `collect?v=2` ([ANALYTICS.md](ANALYTICS.md#rule-for-browser-checks-never-send-local-traffic-to-the-live-property)); never test against `cubeinsquare.com`.

## Commit rules

- Small commits with a clear subject that says the outcome ("Fix armor add button contrast across all locales"), never "fix stuff" or "updates".
- Work lands directly on `main` or through a PR from an `agent/<topic>` branch (PRs #2–#12). Run `git pull --rebase origin main` before pushing.
- Before merging a shared change, look in `.drip/queue/` for payload copies of the same files and update them ([COLLABORATION.md](COLLABORATION.md) §6). For hubs, Checks now tells you: it goes red on your push if a queued bundle still carries the old copy.
- Claim a shared file in chat before editing it ([COLLABORATION.md](COLLABORATION.md) §8). Two people in `styles.css`, a hub or one tool page is the failure mode to avoid.
- AI-authored commits keep the `Co-Authored-By:` trailer.

## Document map

| File | Read it for |
| --- | --- |
| [DRIP_PUBLISHING.md](DRIP_PUBLISHING.md), `.drip/template-release/README.md` | Queue format, `TOOL_META.js`, validation rules, how to start a bundle |
| [RELEASE_ROADMAP.md](RELEASE_ROADMAP.md) | What has shipped, the current queue, ideas, known issues |
| [PUBLISHED.md](PUBLISHED.md) | Bot-written log of drip publishes (from 2026-08-02) |
| [COLLABORATION.md](COLLABORATION.md) | Working agreement for parallel sessions: collision zones, themes, ownership |
| [ANALYTICS.md](ANALYTICS.md) | GA4 events and parameters, consent (Google CMP vs site banner, the `<head>` block), custom dimensions, the test-traffic rule, how to add a tool to tracking |
| [TEXTURE_PAINTER_STATUS.md](TEXTURE_PAINTER_STATUS.md) | Live versus outstanding texture painter changes |
| [PIXEL_ART_AUTHOR_BRIEF.md](PIXEL_ART_AUTHOR_BRIEF.md) | Where the author's own writing goes on the skin editor and texture painter pages |
