# Cube in Square release roadmap

This file tracks the scheduled drip releases that are currently present in `.drip/queue`.
It is meant to separate real queued work from ideas that were discussed but are not yet in the repository.

## Current live/local status

### Already live

- Texture painter: palette extraction from an uploaded image.
- Texture painter and skin editor: custom export file names.
- Earlier texture painter UI fixes that were already pushed before the latest canvas work.
- Expanded wiki, tools, about, mod articles, and AdSense-facing content polish already committed to `main`.

### Local only, not live yet

- Texture painter layout: tool panel moved closer to the left edge and the canvas area widened.
- Texture painter canvas centering wrapper.
- Texture painter right-click canvas panning restoration.
- Texture painter undo/redo behavior focused on pixels rather than viewport jumps.
- Resource-pack 3D preview: automatic item/block rotation removed locally.

These local changes should be reviewed before publishing because the site is currently under AdSense review.

## Queued releases

| Date | Queue folder | What launches | Status | Needs more work? |
| --- | --- | --- | --- | --- |
| 2026-05-03 | `2026-05-03-resource-pack-migration-1-21-4` | Minecraft 1.21.4 resource-pack migration guide. | Queued. | Quick QA before release. |
| 2026-05-10 | `2026-05-10-smart-potion-contents-1-21-4` | Smart potion contents article plus sphere generator bundle. | Queued, with many added bundle files. | Bundle QA: navigation, sitemap, localized pages, and tool smoke test. |
| 2026-05-17 | `2026-05-17-string-ids-custom-model-data` | String IDs / CustomModelData guide. | Queued. | Light polish and link check. |
| 2026-05-23 | `2026-05-23-texture-preview-bundle` | Texture painter preview improvements prepared as a separate reviewable bundle. | Queued. | Keep out of live until AdSense review result unless it fixes a blocking bug. |
| 2026-05-24 | `2026-05-24-rp-progression-systems` | RP progression systems article in EN / RU / FR / DE. | Payload added. | Needs final navigation QA before release. |
| 2026-05-31 | `2026-05-31-data-components-architecture` | Data Components architecture guide. | Queued. | Quick QA and sitemap consistency check. |
| 2026-06-07 | `2026-06-07-item-model-builder-bundle` | Item Model Definitions Builder, guide, and supporting article path. | Queued with local edits. | UX QA, localization check, export smoke test. |
| 2026-07-05 | `2026-07-05-custom-item-catalog-bundle` | Custom Item Catalog, guide, and supporting naming article. | Queued with local edits. | Import/export QA, duplicate-warning checks, empty states. |
| 2026-08-02 | `2026-08-02-circle-dome-planner-bundle` | Circle / ring / dome planner and supporting article. | Queued with local edits. | Presets, copy actions, mobile layout, and guide links. |
| 2026-09-06 | `2026-09-06-book-letter-builder-bundle` | Book / Letter Builder, guide, and readable books article. | Queued. | Tool smoke test, navigation merge, and localized copy check. |
| 2026-10-04 | `2026-10-04-dialogue-builder-bundle` | Dialogue Builder, guide, and readable dialogue article. | Queued. | Tool smoke test, navigation merge, and localized copy check. |
| 2026-11-01 | `2026-11-01-bossbar-builder-bundle` | Bossbar Builder, guide, and Minecraft event UI article. | Queued. | Command syntax smoke test, navigation merge, sitemap check, and mobile layout QA. |

## Discussed but not currently queued here

- Notification Builder.
- Quest Journal / Objective Tracker.

These may still be good future tools, but they are not present as `.drip/queue` release folders in this checkout.

## Operating rule while AdSense is reviewing

- Prefer documentation, queue cleanup, and future-release work.
- Avoid large live-page restructuring unless it fixes a real bug.
- Keep texture-painter live changes bundled and reviewed before publishing.
- Do not add thin placeholder pages; every new release should include a tool or article with enough context, navigation, and sitemap coverage.
