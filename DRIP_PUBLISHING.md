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
| `BASE.txt` | if the payload overwrites a hub page | The live versions the payload was copied from (see [Stale payloads](#stale-payloads-basetxt)) |
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

## Stale payloads: BASE.txt

Every file in `payload/` replaces the live file with the same path. So a payload
copy of a page that someone else edited in the meantime silently rolls their
edit back. The 2026-10-04 publish (`3174b9e`) did this to `tools/index.html` and
`wiki/index.html` in all four locales: the bundle had been queued on 2026-09-14
with full copies of the hubs, and everything committed to them afterwards
(`2a6ee93`: `data-released` and the wiki hub cleanup, `6e9767d` and `0407fd8`:
links to three articles) was overwritten. Nothing noticed for ten days.

`BASE.txt` in the bundle closes this. It records, for every payload file, the git
blob hash of the live file the payload was copied from (`-` for a page that does
not exist live yet):

```
# Live versions this bundle's payload was prepared against.
6b7c188d4c004fac8109f99f7a70b901f1619265  tools/index.html
b9bc2a7ee22ff9aaba4456a8356da8253c3035e6  ru/wiki/index.html
-                                         enchantment-randomizer/index.html
```

`drip-validate.sh` (which the publisher runs) and the Checks workflow compare each
hash with the live file now. A bundle is **rejected** when a recorded live file has
changed since and the payload copy does not already equal it, and the message names
the commits that changed it:

```
[FAIL] wiki/index.html changed on the live site after the bundle was prepared (298bc0e -> 5410c51)
         0407fd8 2026-09-16 Add Minecraft 26.1-26.3 support and a Sulfur Cube texture guide
         6e9767d 2026-09-15 Deepen thin articles and rescue an orphaned wiki page
         2a6ee93 2026-09-15 Age out stale "new" badges, fix broken article nesting, declutter wiki hub
```

| Situation | Result |
| --- | --- |
| A recorded live file changed after the record was made | error, with the commits |
| The payload file overwrites a **hub page** and BASE.txt has no record for it | error |
| The payload file overwrites any other live file and has no record | warning |
| A new page (nothing live to overwrite) | nothing to check |
| The payload copy already equals the live file | fine, nothing would be rolled back |

Hub pages are `index.html` at the root and in `tools/` and `wiki/`, in all four
locales, plus `404.html`: the pages every release is tempted to carry a copy of and
that other work keeps editing.

### Working with it

Start a hub like this, so the record is true by construction:

```bash
bash .github/scripts/drip-base.sh --copy .drip/queue/2026-11-01-my-tool \
  tools/index.html ru/tools/index.html fr/tools/index.html de/tools/index.html \
  wiki/index.html ru/wiki/index.html fr/wiki/index.html de/wiki/index.html
```

That copies the live files into `payload/` and writes `BASE.txt`; edit the copies
afterwards. For new pages, put them in `payload/` and run
`bash .github/scripts/drip-base.sh <bundle>`, which records every payload file
that BASE.txt does not list yet and never changes an existing entry.

`drip-base.sh <bundle>` can only vouch that a copy came from the live file *as it
is now*. Running it on a hub copied weeks ago would record the current hash and
hide the staleness, so run it right after copying, or use `--copy`.

When the checks go red because a live hub moved on:

```bash
bash .github/scripts/drip-base.sh --update .drip/queue/2026-11-01-my-tool
```

For each stale file this merges your edit onto the current live file (three-way,
with the recorded version as the base), re-records it, and prints how many lines
the payload now differs from live by. For a hub that should be just your card
(`+1/-0`); a much larger number means the merge brought in something already live,
so look at the diff. If your edit and a live change touch the same or adjacent
lines the file gets `<<<<<<<` markers, and validation keeps rejecting the bundle
until you resolve them. The alternative is to delete the payload copy and start
again with `--copy`.

The live file is read from the working tree, so a hub with uncommitted changes
counts as changed too; the message says "changed in the working tree".

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
- is stale: a live file it overwrites changed after `BASE.txt` was recorded, or
  it overwrites a hub page with no `BASE.txt` record (see above)
- contains `<<<<<<<` merge conflict markers in a page
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
| Queued bundles | `drip-check-base.sh` on every folder in `.drip/queue/` | a payload copy that went stale (see [BASE.txt](#stale-payloads-basetxt)) |
| Sitemap | `bash scripts/generate-sitemap.sh --check` | stale `sitemap.xml` (advisory) |

The queued-bundles step covers every bundle, held and future-dated ones too, because
they go stale just the same. It is what turns "someone edited a hub that a bundle
carries" into a red build on that push, weeks before the release Sunday. The fix is
in the section above: `drip-base.sh --update <bundle>`.

`tests/homepage-tool-count.test.cjs` keeps the homepage's "N live browser tools"
number honest. It derives the count the way a visitor sees it (the static cards in
`tools/index.html` plus the tool registry in `assets/site.js`), checks every tool has
a page in all four locales, and compares the number with the four homepages. A tool
release that forgets the homepage now fails here.

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

## Considered and not built: hub inserts instead of full copies

`TOOL_META.js` fixed the menu by shipping an *insert* that the publisher splices into
the live `assets/site.js`. The same could be done for the hubs: a bundle would carry
only the new card for each hub (plus an anchor saying where it goes), and the
publisher would insert it into the live page at publish time. Then no hub is ever
copied, and nothing can be rolled back.

For:

- A copy cannot go stale, because there is none. No BASE.txt, no `--update`, no
  red builds when someone edits a hub.
- The card appears in the same commit as the tool. Today it does not have to: on
  2026-09-14 `237cb5a` put the randomizer cards into the live hubs three weeks
  before the release, so for three weeks the hubs linked to a tool the bundle had
  not published yet.
- The publisher could stamp `data-released` with the real publish date, so the
  "forgot the date" and "date of the day the bundle was prepared" mistakes go away.
- The bundle gets smaller and its review is a few-line diff, not eight hub files of 125 to 340 lines each.

Against:

- It is a second mechanism next to full payload files, with its own format and
  script. The hubs do not share a markup: in English the cards are one-line
  `<article>` elements, but the ru/fr/de wiki hubs use multi-line cards with a kicker
  and an `id`, grouped in sections that differ by locale. The anchor has to say
  "after the card linking to X" or "at the end of section Y" and fail loudly when it
  cannot be found. That is a small template engine, more than the splice `merge-tool-meta.sh` does (about 100 lines).
- It only covers insertion. Removing a card, rewording one, retitling a section or
  changing the homepage count are still full-file edits, so the stale-copy problem
  stays for exactly the bundles that need more than a card.
- The homepage "N live tools" number would need its own operation, or a runtime
  count in `site.js`, which should be touched as little as possible.
- Inserting into HTML as text is what produced the broken `</article>` nesting in the
  ru/fr/de wiki hubs that `2a6ee93` had to repair. A splice that is wrong still
  commits; the bundle can no longer be validated as a finished page, only checked by
  a dry run.
- The positions of cards in a hub are editorial (neighbouring guides go together).
  A splice appends or follows an anchor; it will not make that call.

Decision: not built. `BASE.txt` is about 260 lines of shell in two scripts, works for every kind of
edit to every kind of page, and keeps a bundle a plain mirror of the site. The insert
approach is worth revisiting if bundles keep needing nothing but one card per hub: then
a `HUBS.txt` listing a card file and an anchor per hub, spliced in next to `TOOL_META.js`,
would remove the need to copy hubs at all.

## Running things by hand

```bash
bash .github/scripts/drip-base.sh --copy .drip/queue/2026-08-02-my-bundle tools/index.html wiki/index.html
bash .github/scripts/drip-base.sh --update .drip/queue/2026-08-02-my-bundle
bash .github/scripts/drip-check-base.sh .drip/queue/2026-08-02-my-bundle
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
- `.github/scripts/drip-base.sh` — writes `BASE.txt` (`--copy`, default) and carries a bundle's edits onto the current live files (`--update`)
- `.github/scripts/drip-check-base.sh` — is the payload still based on the live site; used by the validator and the Checks workflow
- `.github/scripts/sitemap-refresh.sh` — regenerate, commit and push the sitemap
- `scripts/generate-sitemap.sh` — sitemap rebuild
- `scripts/check-links.mjs` — links, hreflang and page metadata checks
- `scripts/merge-tool-meta.sh` — menu entry splice
- `.drip/template-release/` — copy this to start a new bundle
