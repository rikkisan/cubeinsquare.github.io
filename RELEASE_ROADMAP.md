# Cube in Square release roadmap

This file tracks what has shipped, what is queued, and what is only an idea.
Updated 2026-10-24. Sources of truth, in case this file drifts:

- **queue:** `.drip/queue/` (the folders there are the only scheduled releases)
- **drip publishes:** `PUBLISHED.md` (written by the bot; starts 2026-08-02) and `git log`
- **how the pipeline works:** `DRIP_PUBLISHING.md`

## Already live

| Went live | What launched |
| --- | --- |
| Mid-April 2026 | Resource pack generator, custom potions, custom villager trades (first commits 04-15/04-16). The drip workflow was added on 04-16. |
| 2026-04-17 / 04-19 | Skin editor; texture painter and its guide. |
| 2026-04-26 | RP server economy / `custom_data` article. |
| 2026-05-03 | Minecraft 1.21.4 resource-pack migration guide (`/wiki-resource-pack-migration-1-21-4/`). |
| 2026-05-10 | Smart potion contents article (`/wiki-smart-potion-contents-1-21-4/`); its localized pages were strengthened on 05-21. |
| 2026-05-17 | String IDs / CustomModelData guide (`/wiki-string-ids-custom-model-data/`). |
| 2026-05-31 | RP progression systems article, EN/RU/FR/DE (`/wiki-rp-progression-systems/`). |
| 2026-06-02 | Sphere generator tool and guide, plus Data Components architecture guide. |
| 2026-06-07 | Item Model Definitions Builder, guide, and supporting article. |
| 2026-06-14 | Custom Item Catalog, guide, and supporting naming article. |
| 2026-06-21 | Circle / ring / dome planner and supporting article. |
| 2026-06-28 | Book / Letter Builder, guide, and readable books article. |
| 2026-07-05 | Dialogue Builder, guide, and readable dialogue article. |
| 2026-07-12 | Bossbar Builder, guide, and Minecraft event UI article. |
| 2026-07-27 | Data pack generator and its concept guide, committed directly and localized the same day. |
| 2026-08-02 | Loot table generator and guide (drip). |
| 2026-08-23 | Recipe generator and guide (drip). |
| 2026-09-13 | Advancement builder and guide (drip). |
| 2026-10-04 | Enchantment & attribute randomizer, its guide, and the "which enchantments can't combine" article (drip). |

The texture painter preview bundle (palette extraction, export file naming,
canvas layout/pan/undo fixes, block template as a cube side sheet) and the
custom item builder tool are also live; see `git log -- assets/texture-painter.js`
for the individual commits.

### Other notable changes (direct commits and PRs, not new tools)

| Date | Change |
| --- | --- |
| 2026-08-12 | PRs #2–#4: consistent, scrollable Tools menu and readable loot-table preset buttons; homepage tool count refreshed; Wiki menu card layout. |
| 2026-09-10 | PR #5: interactive 3D voxel preview for the sphere generator, all four locales. |
| 2026-09-11 | PRs #6–#10: compact Tools dropdown, unified Wiki dropdown with category filters (Servers tab removed), armor add-button contrast, visible and keyboard-accessible texture upload targets. |
| 2026-09-15 | "New" badges age out after 45 days, thin articles deepened, an orphaned wiki page rescued, GA4 dispatch deferred for INP. |
| 2026-09-16 | Minecraft 26.1–26.3 support in the recipe, advancement and data pack tools, plus the Sulfur Cube texture guide. |
| 2026-09-30 | PR #11: Form / Nodes (Beta) workspace on 11 constructors, all four locales. PR #12: homepage "real server experience" caption. |
| 2026-10-13 | Titles and descriptions rewritten for pages with near-zero CTR at a good search position; `.tool-button` underline fix. |
| 2026-10-24 | The publisher no longer writes the bot identity into the local `.git/config`. |

### Pipeline incidents worth remembering

- Four tools (bossbar-builder, book-letter-builder, dialogue-builder, circle-dome-planner) published in June and July
  instead of their queued dates (2026-11-01, 2026-09-06, 2026-10-04, 2026-08-02) because of a bug in
  `.github/scripts/drip-publish.sh` that ignored the date prefix on queue folders. That script now only
  publishes a folder whose date has arrived. The same incident also dropped these four tools from the Tools
  menu and `sitemap.xml` for a few weeks; both have since been fixed.
- On 2026-07-28 a mistaken command released the loot table, recipe and advancement bundles early; they were
  un-published (`b17c493`) and went out again on their real dates above.
- The 2026-10-04 publish carried stale hub pages and rolled back earlier fixes (see Known issues).

## Queued releases

None. `.drip/queue/` contains only `.gitkeep`, and the last publish was 2026-10-04, so the Sundays since then
(and the next one, 2026-10-25) released nothing. The bot prints "Queue is running low" in the run summary
whenever fewer than two bundles remain.

## Ideas, not yet queued

- **Notification Builder.**
- **Quest Journal / Objective Tracker.** Overlaps with the Advancement builder, which already builds quest
  chains; decide what the journal adds (book or scoreboard based tracking) before starting.
- **Map art builder** and **Pixel-art palette** are already shown as "soon" cards on `/tools/` (in all four locales).
- **Texture painter polish.** `TEXTURE_PAINTER_STATUS.md` is the source of truth for what is live, what is
  outstanding, known issues and the test plan; it is not repeated here. Check `git status` and ask before
  starting, since these edits touch `assets/texture-painter.css`, `assets/app.js` and the four
  `texture-painter/index.html` pages.
- **Author's own writing** for the skin editor and texture painter pages, as laid out in
  `PIXEL_ART_AUTHOR_BRIEF.md`. It waits on the author; nothing in the repo tracks whether it has been written.

## Known issues (need a code commit, found 2026-10-24)

1. **The 2026-10-04 publish (`3174b9e`) rolled back earlier fixes.** The enchantment bundle was queued on
   2026-09-14 with its own copies of `tools/index.html` and `wiki/index.html` (and the `ru/fr/de` versions),
   made before the 2026-09-15 and 2026-09-16 commits, and publishing overwrote the live files with them.
   Result, checked against `HEAD`:
   - `data-released` is gone from the `resource-card`s in all four `tools/index.html`, so badge aging does not run
     and every tool keeps its `new` pill (10 cards per locale had the attribute on 2026-09-15).
   - All four wiki hubs lost the links to `wiki-string-ids-custom-model-data`, `wiki-custom-item-id-naming` and
     `wiki-sulfur-cube-texture`, so those pages are orphaned again, and the Privacy Policy card is back in the hubs.
   - Fix: restore those lines from `2a6ee93`, `6e9767d` and `0407fd8` on top of the current hubs.
2. **Homepage metric is stale.** `index.html` and the `ru/fr/de` copies still say 15 live tools; there are 18.
   The number is edited by hand with every tool release.
3. **`sitemap.xml` lastmod values are stale** (`bash scripts/generate-sitemap.sh --check` fails since the
   2026-10-13 title rewrite). Regenerate and commit.

## Operating rules

AdSense declined the site and a resubmission is planned (owner, 2026-10-24), so content quality comes first:

- Prefer content depth, documentation and queue work. Avoid large live-page restructuring unless it fixes a real bug.
- Do not add thin placeholder pages; every new release should include a tool or article with enough context, navigation, and sitemap coverage.
- New drip bundles must not carry their own copy of `assets/site.js` or `sitemap.xml` in `payload/` — those are shared files and get updated in a separate commit.
- Hub pages are shared too. If a bundle must ship `tools/index.html` or `wiki/index.html` (any locale), re-copy
  them from current `main` when the release date is near and re-check the payload against `git log` for those
  files; a stale copy silently undoes everything committed since it was made.
- A bundle that adds a tool also bumps the homepage tool count and sets `data-released` on its catalog card.
