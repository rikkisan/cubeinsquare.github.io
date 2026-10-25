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
| 2026-10-04 | Enchantment & attribute randomizer, its guide, and the "which enchantments can't combine" article. The pages were already live from 2026-09-14 (committed together with the queued bundle); the drip publish added the menu entry. |

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
| 2026-10-24 | AdSense wave A: bossbar pages rewritten, four short articles merged or closed, "coming soon" removed, complete tools and wiki hubs (see "AdSense resubmission" below). |

### Pipeline incidents worth remembering

- Four tools (bossbar-builder, book-letter-builder, dialogue-builder, circle-dome-planner) published in June and July
  instead of their queued dates (2026-11-01, 2026-09-06, 2026-10-04, 2026-08-02) because of a bug in
  `.github/scripts/drip-publish.sh` that ignored the date prefix on queue folders. That script now only
  publishes a folder whose date has arrived. The same incident also dropped these four tools from the Tools
  menu and `sitemap.xml` for a few weeks; both have since been fixed.
- On 2026-07-28 a mistaken command released the loot table, recipe and advancement bundles early; they were
  un-published (`b17c493`) and went out again on their real dates above.
- The 2026-10-04 publish (`3174b9e`) carried stale hub pages and rolled back earlier fixes. The randomizer bundle
  was queued on 2026-09-14 with full copies of `tools/index.html` and `wiki/index.html` (all four locales), and
  publishing overwrote the live hubs with them, undoing `2a6ee93` (`data-released` badges, wiki hub cleanup, article
  nesting) and the links added by `6e9767d` and `0407fd8`. It went unnoticed for ten days; the symptoms were
  permanent "new" pills and three orphaned articles. Restored on 2026-10-24 (`465b592`). The same queue commit
  (`237cb5a`) had also committed the whole tool and its hub cards live, so the pages were public from 2026-09-14 and the
  publish added only the menu entry; commit a tool either live or through the queue, not both. Guarded now by
  `BASE.txt` and the stale-payload check (see `DRIP_PUBLISHING.md`).

## Queued releases

None. `.drip/queue/` contains only `.gitkeep`, and the last publish was 2026-10-04, so the Sundays since then
(and the next one, 2026-10-25) released nothing. The bot prints "Queue is running low" in the run summary
whenever fewer than two bundles remain.

## Ideas, not yet queued

- **Notification Builder.**
- **Quest Journal / Objective Tracker.** Overlaps with the Advancement builder, which already builds quest
  chains; decide what the journal adds (book or scoreboard based tracking) before starting.
- **Map art builder** and **Pixel-art palette.** Their "soon" cards were removed from `/tools/` on 2026-10-24 (AdSense
  counts unlaunched pages against the site); announce them only when they ship.
- **Texture painter polish.** `TEXTURE_PAINTER_STATUS.md` is the source of truth for what is live, what is
  outstanding, known issues and the test plan; it is not repeated here. Check `git status` and ask before
  starting, since these edits touch `assets/texture-painter.css`, `assets/app.js` and the four
  `texture-painter/index.html` pages.
- **Author's own writing** for the skin editor and texture painter pages, as laid out in
  `PIXEL_ART_AUTHOR_BRIEF.md`. It waits on the author; nothing in the repo tracks whether it has been written.

## AdSense resubmission

AdSense declined the site for **low-value content** ("бесполезный контент"). The audit of 2026-10-24 found the
causes in content, not in consent or ads: 12 of 18 tool pages had 37–68 words of their own text, two bossbar pages
repeated one generated paragraph under every heading, many articles still taught 1.21.4-era syntax (or broke on
1.21.5+), and the English wiki hub listed only half of the articles. The owner decided not to resubmit until items
1–8 of the audit's top list are done. Work runs in waves; commands added or fixed along the way are listed with the
expected result in `.drip/drafts/commands-to-test.md` for an in-game run.

**Wave A, done 2026-10-24**

- Bossbar guide and event article rewritten (x4); the countdown article folded into the event article with a
  corrected recipe (its old loop counted ticks as seconds).
- Merged into stronger siblings with noindex redirects: smart potion contents → custom potions, written books for
  quests → readable books, circle/dome arena layouts → round build shape choice. `wiki-complex-command-blocks`
  (no commands, sales pitch) redirects to the data pack guide.
- "Coming soon" removed: Tools menu entry, the two "soon" cards, `/tool-coming-soon/` now redirects to `/tools/`.
- `/tools/` shows all 18 tools (item model builder and custom item catalog were missing in every locale).
- Wiki hubs (x4) rebuilt: every indexable article is on its hub, in seven sections with a sidebar; runtime duplicate
  cards fixed in `site.js`; the Wiki menu lists the book, dialogue and bossbar articles again.
- Related-reading links into the least-linked articles; inline code wraps on phones (`/ru/recipe-generator/` no
  longer scrolls sideways); German cookie banner uses "du".

**Wave B, done 2026-10-25**

- The 12 thin tool pages (x4) carry 235–425 words of page-specific text each: how the page works, what the
  output cannot do for you, versions.
- Rewritten from scratch (x4): `wiki-give-command-not-working`, `wiki-components-vs-nbt`, `wiki-custom-weapon`,
  `wiki-blockbench-custom-model`, and `wiki-custom-item-no-json`, which is now the custom item builder's guide.
- Version fixes in `wiki-custom-model-data`, the enchantment, economy and trades articles, the data pack format
  table (up to 26.3, `min_format`/`max_format`), and the English migration and Data Components articles (the
  unpublished draft's useful parts went into the migration article).
- Tool output fixed: data pack generator (`pack.mcmeta` for 1.21.9+, missing 1.21.9–1.21.11), enchantment randomizer
  (three component branches, `vanishing_curse`), custom item builder, potions and trades (new 1.21.5 – 26.x branch
  with SNBT names; ru/fr/de potions also lacked the 1.21.4 branch), recipe and advancement folders before 1.21,
  item model builder `select` values, phone overflow on path notes.
- The resource pack generator page and guide now say which versions its packs serve.

**Still to do before resubmitting**

- Wave C: contact email `cubeinsquare@proton.me` on About and in every footer; remove Discord promises (there is no
  public invite); bylines (Mark for DarkMage, Mechanism, ArmorHide, Chest Helper; Rikki for the rest; HeadHunter
  author to confirm); rewrite ArmorHide and Chest Helper as documentation from their Modrinth pages; plugin pages
  say where each plugin is available; server described as between seasons (season 2 over, season 3 in
  development).
- After Wave B: homepage less about the site itself; localized pages that are 40–50% shorter than English brought
  to parity.
- The owner runs `.drip/drafts/commands-to-test.md` in game (53 checks). Two tool changes wait for that run: the
  dialogue page's message designer writes `hoverEvent`/`clickEvent` (renamed in 1.21.5, checks B2–B4), and the book
  builder's component output may not suit 1.20.5–1.21.4 (B5).
- Not part of the resubmission, but the biggest remaining gap in value: the resource pack generator still builds
  1.20-format packs with `overrides` and the pre-1.21.2 armor folder, so its CustomModelData variants and armor do not
  work on 1.21.4 and newer. Updating it is an engineering task of its own.

## Known issues

None open. The three found on 2026-10-24 are closed: the hubs rolled back by `3174b9e` were restored (`465b592`),
the homepage metric says 18 and `tests/homepage-tool-count.test.cjs` keeps it honest, and `sitemap-refresh.yml`
keeps `sitemap.xml` current.

## Operating rules

AdSense declined the site and a resubmission is planned (owner, 2026-10-24), so content quality comes first:

- Prefer content depth, documentation and queue work. Avoid large live-page restructuring unless it fixes a real bug.
- Do not add thin placeholder pages; every new release should include a tool or article with enough context, navigation, and sitemap coverage.
- New drip bundles must not carry their own copy of `assets/site.js` or `sitemap.xml` in `payload/` — those are shared files and get updated in a separate commit.
- Hub pages are shared too. If a bundle must ship a hub (`index.html`, `tools/index.html`, `wiki/index.html` in any
  locale, `404.html`), take it with `drip-base.sh --copy` so `BASE.txt` records the live version it came from. A stale
  copy silently undoes everything committed since it was made; validation and Checks now reject it and name the
  commits, and `drip-base.sh --update` carries the bundle's edit onto the current live file.
- A bundle that adds a tool also bumps the homepage tool count (a test fails if it is wrong) and sets `data-released`
  on its catalog card.
