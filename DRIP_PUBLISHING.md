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

## Running things by hand

```bash
bash .github/scripts/drip-validate.sh .drip/queue/2026-08-02-my-bundle
DRIP_DRY_RUN=1 bash .github/scripts/drip-publish.sh
bash scripts/generate-sitemap.sh --check
```

A dry run resets the working tree afterwards, so it refuses to start unless
the tree is already clean.

## Files

- `.github/workflows/drip-publish.yml` — schedule and dry-run input
- `.github/scripts/drip-publish.sh` — the publisher
- `.github/scripts/drip-validate.sh` — preflight checks
- `scripts/generate-sitemap.sh` — sitemap rebuild
- `scripts/merge-tool-meta.sh` — menu entry splice
- `.drip/template-release/` — copy this to start a new bundle
