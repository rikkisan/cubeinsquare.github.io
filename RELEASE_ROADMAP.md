# Cube in Square release roadmap

This file tracks the scheduled drip releases and their actual publish status.
Updated 2026-07-26 after confirming every previously "queued" item below has
already gone live; `.drip/queue/` is currently empty.

## Already live

| Went live | What launched |
| --- | --- |
| 2026-05-03 | Minecraft 1.21.4 resource-pack migration guide (`/wiki-resource-pack-migration-1-21-4/`). |
| 2026-05-17 | String IDs / CustomModelData guide (`/wiki-string-ids-custom-model-data/`). |
| 2026-05-21 | Smart potion contents article (`/wiki-smart-potion-contents-1-21-4/`). |
| 2026-05-31 | RP progression systems article, EN/RU/FR/DE (`/wiki-rp-progression-systems/`). |
| 2026-06-02 | Sphere generator tool and guide, plus Data Components architecture guide. |
| 2026-06-07 | Item Model Definitions Builder, guide, and supporting article. |
| 2026-06-14 | Custom Item Catalog, guide, and supporting naming article. |
| 2026-06-21 | Circle / ring / dome planner and supporting article. |
| 2026-06-28 | Book / Letter Builder, guide, and readable books article. |
| 2026-07-05 | Dialogue Builder, guide, and readable dialogue article. |
| 2026-07-12 | Bossbar Builder, guide, and Minecraft event UI article. |

The texture painter preview bundle (palette extraction, export file naming,
canvas layout/pan/undo fixes, block template as a cube side sheet) and the
custom item builder tool are also live; see `git log -- assets/texture-painter.js`
for the individual commits.

Note: bossbar-builder, book-letter-builder, dialogue-builder, and
circle-dome-planner published on the dates above instead of their originally
queued dates (2026-11-01, 2026-09-06, 2026-10-04, 2026-08-02) because of a bug
in `.github/scripts/drip-publish.sh` that ignored the date prefix on queue
folders. That script now only publishes a folder whose date has arrived. The
same incident also dropped these four tools from the Tools menu and
`sitemap.xml` for a few weeks; both have since been fixed.

## Queued releases

None. `.drip/queue/` contains only `.gitkeep`.

## Discussed but not currently queued here

- Notification Builder.
- Quest Journal / Objective Tracker.

These may still be good future tools, but they are not present as `.drip/queue` release folders in this checkout.

## Operating rule while AdSense is reviewing

- Prefer documentation, queue cleanup, and future-release work.
- Avoid large live-page restructuring unless it fixes a real bug.
- Do not add thin placeholder pages; every new release should include a tool or article with enough context, navigation, and sitemap coverage.
- New drip bundles must not carry their own copy of `assets/site.js` or `sitemap.xml` in `payload/` — those are shared files and get updated in a separate commit.
