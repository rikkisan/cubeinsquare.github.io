# Drip Publishing for GitHub Pages

This project publishes one pre-made site update at a time, on a schedule.

## What it does

Every Sunday at 09:00 UTC, GitHub Actions:

1. picks the oldest queued bundle **whose date has actually arrived**
2. validates it, and refuses to publish anything that fails
3. copies its `payload/` over the site
4. splices any `TOOL_META.js` into `assets/site.js` (menu entry)
5. regenerates `sitemap.xml` from the filesystem
6. appends a line to `PUBLISHED.md`
7. commits and pushes, so GitHub Pages rebuilds

There is also a manual **Run workflow** trigger with a **dry run** checkbox:
it does everything except the commit and push, then restores the tree. Use it
to check a bundle before its date arrives.

## Queue format

Each release is one folder inside `.drip/queue/`, named `YYYY-MM-DD-slug`.

| File | Required | Purpose |
| --- | --- | --- |
| `payload/` | yes | Files to publish, mirroring the real site structure |
| `COMMIT_TITLE.txt` | yes | Commit subject |
| `COMMIT_BODY.txt` | no | Commit body |
| `TOOL_META.js` | no | Menu entry for a new tool (see below) |
| `DELETE.txt` | no | Paths to remove, one per line |
| `HOLD` | no | Presence blocks publishing; first line is the reason |

The date prefix is a **release date, not a sort key**. A bundle dated in the
future is skipped until that date arrives. (Before this was enforced, four
autumn-dated bundles all shipped in June and July.)

## Never put shared files in a payload

**`assets/site.js` and `sitemap.xml` must not appear inside `payload/`.**
Validation rejects the bundle if they do.

This is the rule the whole pipeline is built around. Bundles used to carry
their own copies of both files. When several bundles were prepared in parallel
from the same base, each copy knew nothing about its siblings, so whichever
published last silently erased the others' menu entries and sitemap URLs. The
site ended up with four unreachable tools and a sitemap listing 16 of 229
pages.

Instead:

- **menu entry** → declare it in `TOOL_META.js`, which gets spliced into the
  live `assets/site.js` (an insert cannot drop what is already there)
- **sitemap** → nothing to do; it is regenerated from the filesystem on every
  publish

## TOOL_META.js

Only needed when a bundle introduces a new tool. Two marker sections:

```js
@meta
"lootTableGenerator": {
          "path": "/loot-table-generator/",
          "guidePath": "/wiki-loot-table-generator/",
          "sectionId": "how-to-guides"
}
@labels
"lootTableGenerator": {
          "en": {
                    "toolLabel": "Loot table generator",
                    "guideLabel": "Loot table generator guide",
                    "featureTitle": "Loot table generator",
                    "featureDesc": "...",
                    "catalogTitle": "Loot table generator",
                    "catalogDesc": "...",
                    "catalogAction": "Open generator",
                    "catalogStatus": "new",
                    "wikiKicker": "Builder guide",
                    "wikiTitle": "Loot table generator",
                    "wikiDesc": "...",
                    "wikiAction": "Read guide",
                    "sidebarLabel": "Loot table generator"
          },
          "ru": { ... }, "fr": { ... }, "de": { ... }
}
```

All four locales are required. Merging is idempotent, so a retried publish
cannot create a duplicate entry.

Note that `/tools/` (and its `ru`/`fr`/`de` copies) is a **static** page — the
JS only fills the navbar dropdown. A new tool also needs a `resource-card`
added to those four pages, which belongs in the bundle's payload.

Give that `resource-card` a `data-released="YYYY-MM-DD"` attribute (the
publish date) alongside its `new`/`новое`/`nouveau`/`neu` status pill.
`assets/site.js`'s `initResourceCardBadgeAging()` downgrades the pill to
`ready` on its own once the card is 45 days old, so the catalog doesn't fill
up with permanently-"new" tools — no manual follow-up commit needed.

## What validation checks

`.github/scripts/drip-validate.sh` rejects a bundle that:

- has no `payload/`, no files in it, or no `COMMIT_TITLE.txt`
- carries `assets/site.js` or `sitemap.xml`
- contains a page marked `noindex` that is not a redirect stub
- has HTML without a `<title>` or a meta description
- has unbalanced `<html>`, `<head>`, `<body>`, `<main>` or `<article>` tags
- has a malformed `TOOL_META.js`
- lists an unsafe or protected path in `DELETE.txt`

Missing translations are a warning, not a rejection.

## CI checks and sitemap refresh

Validation only looks at a queued bundle. Two more workflows cover the live
site itself.

### Checks (`checks.yml`)

Runs on every push and pull request to `main`, and by hand. Every step runs
even if an earlier one failed, so one run reports all the problems.

| Step | Command | Catches |
| --- | --- | --- |
| Unit tests | `node --test tests/*.test.cjs` | broken generators, wiki grids |
| Syntax | `node --check` on each `assets/*.js` | a typo that breaks a tool or the menu |
| Links and metadata | `node scripts/check-links.mjs` | see below |
| Sitemap | `bash scripts/generate-sitemap.sh --check` | stale `sitemap.xml` (advisory) |

Name a new test `tests/<name>.test.cjs` and it is picked up. The glob is
deliberate: `node --test tests/` fails on Node 24 (it treats the folder as a
module path), and `tests/constructor-nodes.browser.js` is a Playwright
scenario, not a Node test, so it must stay out of the runner.

`scripts/check-links.mjs` has no dependencies and scans every `.html` file
(dot-directories are skipped). It fails when:

- an `href="/..."` has no matching file. `/x/` needs `x/index.html`; `/x` also
  accepts `x.html` or `x/index.html`, as GitHub Pages serves them. Lookups are
  case-sensitive on every OS, so `/Wiki/` fails on a Windows checkout too
- a `<link hreflang>` has no href, points off-site, or points at a page that
  does not exist
- an indexable page lacks a `<title>`, a meta description or a canonical
  link, or its canonical points at a page that does not exist

"Indexable" means neither `noindex` in the robots meta tag nor a `Disallow` in
`robots.txt`. The redirect stubs are `noindex`, so they are exempt from the
metadata rules, but their links are still checked.

**The sitemap step only warns**, except in a manual run. `lastmod` is each
page's last commit date, so a sitemap committed together with its pages is
stale by construction, and the refresh below repairs `main` after every push.
A hard failure would turn every content push red until the bot catches up.
Use **Run workflow** on Checks for the strict version. To make it strict on
every push instead, delete the `if` block in that step.

### Sitemap refresh (`sitemap-refresh.yml`)

Regenerates `sitemap.xml` and commits it as `github-actions[bot]` when it
changed. You never need to regenerate or hand-edit it; run `git pull --rebase`
to pick up the bot's commit.

It runs when:

- a push to `main` touches an `.html` file (not under `.drip/`)
- **Drip Publish** completes. A drip release is pushed with `GITHUB_TOKEN`,
  which starts no push workflows, and the publisher regenerates the sitemap
  before its own commit exists, so every existing page it updated carries the
  previous `lastmod`. This run catches up
- you start it by hand

It cannot loop. Three independent things prevent it:

- the push filter matches `.html` files only, and the bot's commit touches
  `sitemap.xml` alone, whichever token pushed it
- `GITHUB_TOKEN` pushes do not start workflows
- it is idempotent: the commit changes no page, so no page's last-commit date
  moves and a second run finds nothing to do

It shares the `drip-publish` concurrency group with the publisher. Both commit
to `main` and both rewrite `sitemap.xml`, so a refresh landing mid-release
would make the publisher's `git pull --rebase` conflict. Runs queue and none is
cancelled mid-run. GitHub keeps only one *pending* run per group, though, so if
the Sunday release is waiting behind a refresh and a second refresh queues
after it, the release run is cancelled. If Sunday shows as cancelled, start
Drip Publish by hand.

If someone else's push moves `main` mid-run, the refresh drops its own commit,
fast-forwards and regenerates, rather than rebasing. If `main` gets branch
protection, `github-actions[bot]` needs permission to push to it.

## Running things by hand

```bash
bash .github/scripts/drip-validate.sh .drip/queue/2026-08-02-my-bundle
DRIP_DRY_RUN=1 bash .github/scripts/drip-publish.sh
bash scripts/generate-sitemap.sh --check
node --test tests/*.test.cjs
node scripts/check-links.mjs
```

A dry run resets the working tree afterwards, so it refuses to start unless
the tree is already clean.

## Files

- `.github/workflows/drip-publish.yml` — schedule and dry-run input
- `.github/workflows/checks.yml` — tests, syntax, links, sitemap on push and PR
- `.github/workflows/sitemap-refresh.yml` — keeps `sitemap.xml` current on `main`
- `.github/scripts/drip-publish.sh` — the publisher
- `.github/scripts/drip-validate.sh` — preflight checks
- `.github/scripts/sitemap-refresh.sh` — regenerate, commit and push the sitemap
- `scripts/generate-sitemap.sh` — sitemap rebuild
- `scripts/check-links.mjs` — links, hreflang and page metadata checks
- `scripts/merge-tool-meta.sh` — menu entry splice
- `.drip/template-release/` — copy this to start a new bundle
