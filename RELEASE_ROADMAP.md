# Cube in Square release roadmap

This file tracks what has shipped, what is queued, and what is only an idea.
Updated 2026-11-20. Sources of truth, in case this file drifts:

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
| 2026-10-25 | AdSense waves B and C: text for the 12 thin tools, version fixes across articles and tools, contact email in every footer, bylines, mod pages rewritten as documentation. |
| 2026-11-20 | `styles.css`: a `textarea.command-output` outside a `.tool-field` had no width rule, so nine live tools (advancement, book and letter, bossbar, data pack, dialogue, enchantment randomizer, item model, loot table, recipe) showed their commands in a 168 px box since launch. It now has the field look at full width; `.tool-checkline` shares the `.tool-check` chip look (`2fa3172`). |
| 2026-11-20 | Recipe generator (x4): in the modern (default) theme the slot inputs showed the raw ID over the slot caption on a dark box since the August release; the page's slot rule now outranks the theme (`42e3381`). The tool has no item library: IDs are typed. The only block and item library with pictures is the resource pack generator's (`assets/data.js`). |
| 2026-11-20 | Skin editor (x4): a left drag on the empty space around the 3D model turns it (a drag on the model still paints), Orbit renamed Rotate / Вращение / Rotation / Drehen, a line under the 3D view explains turning and zoom (`597a94f`). With Base selected the outer layer is drawn at 15% opacity, since the starter skin's opaque outer layer hid every base stroke and the base grid floated under it (`f0ba431`). |
| 2026-11-20 | Recipe generator (x4): item library with icons. All 1,657 items of 26.3 (`assets/recipe-items.js`, names in `recipe-items-ru/fr/de.js`), filtered to the selected game version, with search in the page language; click a slot then an item, or drag; icons in the slots, the result and under the ingredient list; a note when the recipe uses an item the version lacks. Icons hot-link the InventivetalentDev/minecraft-assets 26.3 mirror like the resource pack generator's library; entity-drawn items (heads, chests, banners, shield) crop one face. Data from the 26.3 client jar and PrismarineJS lists, experimental items moved to their real release; rebuild with `scripts/build-recipe-items.py`. `constructor-nodes.js` now skips anything inside `[data-nv-skip]`, so the library stays out of the node view. |
| 2026-11-20 | Recipe generator (x4): result components from 1.20.5: name (`item_name`), lore, enchantments, unbreakable, the light block's level (`block_state`), and free JSON for any other component. Text is a JSON string and enchantments sit under `levels` up to 1.21.4, a text component and a flat map from 1.21.5. Checked on headless servers: a crafter made the shaped and shapeless results with every component on 1.21.1, 1.21.2, 1.21.4, 1.21.5, 1.21.11, 26.1, 26.2 and 26.3, a furnace the smelting result on 1.20.6, 1.21.4, 1.21.5 and 26.3, and all files loaded on 1.20.4 to 26.3 (a furnace placed by `setblock` with its input never finishes before 26.x; put the input in with `item replace`). Also fixed: `.tool-form-grid` / `.tool-field` display beat the `hidden` attribute, so the cooking fields showed on crafting recipes since release. |
| 2026-11-20 | Recipe generator (x4): shapeless, cooking and stonecutting recipes take their ingredients from the slots too (the "one per line" list is gone): shapeless uses the 3×3 grid in any order, cooking and stonecutting one middle slot, and the panel title names the station. Library icons drawn as cropped spans (heads, chests, banners, shield) were blank because `styles.css` hides every `.gallery-item span`; fixed, and the shield crop now uses the wooden side of `entity/shield/shield_base` (its front is the white pattern canvas in 26.x). Resource pack generator library: animated textures (water, lava, fire, kelp, lanterns, command blocks…) showed their whole frame strip squeezed into the slot; `app.js` now shows the first frame. |

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

**Both bundles are on HOLD until Google answers the AdSense resubmission** (the owner sent it on 2026-11-19 and
wants no new tool published during the review; decided 2026-11-20). When the answer comes: the announcement builder
goes out first, on the next Sunday, and the painting generator one Sunday later, because it takes its hub copies
from the live hubs after the announcement builder has changed them. Each bundle's `HOLD` file lists its steps
(rename the folder to the real date, `data-released` on the catalog cards, `drip-check-base.sh`, delete `HOLD`).

- **2026-11-22 (on HOLD) — Announcement builder** (`.drip/queue/2026-11-22-announcement-builder`): timed server announcements
  (chat, action bar or title, in order or at random) as a data pack for 1.20 – 26.3, its guide, cards on the tools,
  wiki and home hubs (home metric 19), menu entry via `TOOL_META.js`. Requested by the owner on 2026-11-19. The hubs
  were taken with `drip-base.sh --copy` that day: a push to any `index.html`, `tools/index.html` or `wiki/index.html`
  before the publish turns Checks red until `drip-base.sh --update` is run on the bundle. After the publish: add the
  slug to `constructorPath` in `site.js` and to `tests/constructor-nodes.browser.js` if it should get the node editor.
  Its narrow output boxes and bare checkbox lines were a gap in the shared `styles.css`, fixed live on 2026-11-20
  (`2fa3172`, see "Other notable changes"); the payload needed no change.
- **Date to be set (on HOLD) — Custom painting generator** (`.drip/queue/2026-11-29-custom-painting-generator`): images
  as paintings of 1 to 16 blocks a side (crop, pixels per block, palette, dithering), a resource pack plus a data pack
  for 1.21 – 26.3, or a resource pack replacing vanilla paintings on 1.20 – 26.3; guide in four locales, menu entry via
  `TOOL_META.js`, slug already in `TOOL_SLUGS`. Requested by the owner on 2026-11-20. The `HOLD` file lists what is
  left: the hubs (tools, wiki, home with the metric at 20) are taken with `drip-base.sh --copy` only after the
  announcement builder is published, since it carries the same hubs; the folder keeps its placeholder date until then.
  Server run of 2026-11-20 (vanilla 1.20.4, 1.20.6, 1.21.1, 1.21.2, 1.21.4, 1.21.5, 1.21.11, 26.1, 26.2, 26.3):
  `painting_variant` is ignored before 1.21; `title`/`author` exist from 1.21.2; the item takes `entity_data`
  1.20.5 – 1.21.4 and `painting/variant` from 1.21.5 (unknown names are rejected there); 16 × 16 hangs and stays,
  17 wide stops the world from loading; `/reload` does not register new paintings and breaks the `placeable` tag
  until a restart. The generator's own downloads loaded on 1.21.1, 1.21.4, 1.21.5 and 26.3. How the pictures look
  in game still needs the owner's check in a client. Load, same day on 26.3: 512 paintings of 16 × 16 cost 0.15 ms
  per tick (512 of 1 × 1: 0.03 ms) and under 80 KB of world save, so the page warns about the client side instead:
  video memory (4 bytes per pixel), the painting atlas against 8192 / 16384 px (26.3 client code: a failed stitch is a
  "Stitching" crash) and the pack size. The 26.3 code also showed that a plain painting takes the largest placeable
  painting that fits, which the guide now says. Every field has a "?" help bubble (hover, focus or tap).
- After that the queue is empty again. A 26.4 article fits once 26.4 is released (26.4-snapshot-10 on 2026-11-19).

## Ideas, not yet queued

- **Notification Builder.** Covered by the queued announcement builder; a separate tool only if
  one-off notifications (title, toast, sound) turn out to need more than the dialogue builder gives.
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
- **Bedrock section.** A second section with Bedrock commands and pack files, for when the Java ideas run out
  (owner, 2026-11-20). Research, tool-by-tool mapping and phases: `BEDROCK_IDEAS.md`.

## AdSense resubmission

AdSense declined the site for **low-value content** ("бесполезный контент"). The audit of 2026-10-24 found the
causes in content, not in consent or ads: 12 of 18 tool pages had 37–68 words of their own text, two bossbar pages
repeated one generated paragraph under every heading, many articles still taught 1.21.4-era syntax (or broke on
1.21.5+), and the English wiki hub listed only half of the articles. The owner decided not to resubmit until items
1–8 of the audit's top list are done. Work runs in waves; commands added or fixed along the way are listed with the
expected result in `.drip/drafts/commands-to-test.md` for an in-game run.

**Resubmitted 2026-11-19; the review is running.** Until Google answers, no new tool or article goes live (both queued
bundles carry `HOLD`, see "Queued releases"). Fixes to existing pages may still land. Record the answer and its
date here; on a refusal, read the reason before releasing anything.

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

**Wave C, done 2026-10-25**

- Every footer (259 pages) links About and `cubeinsquare@proton.me`. About has a contact card with the email (and
  in its JSON-LD `ContactPoint`) instead of the Discord card; the homepage no longer promises Discord either. There
  is no public Discord invite.
- The server is described as between seasons (season two over, season three in development, no date) on About and
  the homepage.
- DarkMage and Mechanism articles say they are published on our Patreon; HeadHunter says it is not distributed and
  runs only on our server. About links all three and both mod guides.
- ArmorHide and Chest Helper rewritten as documentation from their Modrinth pages only (versions, loaders, install,
  controls, settings, limits, changelog). ArmorHide is Apache-2.0, so two gallery screenshots live in
  `assets/mods/`; Chest Helper is All Rights Reserved, so its gallery is linked.
- Bylines on 162 articles: Rikki (linked to `/about/#team`, where About now says "Rikki (`rikki.san`)"), Mark on the
  DarkMage, Mechanism, ArmorHide and Chest Helper articles. JSON-LD `author` is that Person; 54 articles that had no
  JSON-LD got an Article block. The convention is in `CLAUDE.md` (article checklist, step 5).
- `styles.css`: `.article-byline`, `.article-figure`, and `.prose-table` (tables with sentences in their cells wrap
  on phones instead of scrolling).

**Homepage and locales (audit items 11 and 12), done 2026-10-25**

- Homepage (x4) rebuilt around the tools: all 18 in six groups by task, each with what it outputs and its guide;
  starter guides taken from the wiki hub cards; a practical FAQ (versions, uploads, a broken command, the contact
  email). The sections about the site itself (why it matters in 1.21.4, the workflow, what you could build) are gone.
- Localized pages that were 48–66% of the English text now carry the missing sections: resource pack generator,
  custom potions, the RP progression article, the texture size guide, and the German item model branch guide.
  Re-measured: no route has a locale under 65% of English (DarkMage in German is 64%: all sections present, just
  denser, 794 words).
- Register: ten German pages still said "ihr" and three Russian pages "ты"; all now use "du" / "вы".
- `/custom-potions/` no longer scrolls sideways on phones and tablets (the CustomModelData help popover ran past
  the right edge in every locale).

**Still open from before the resubmission** (it went in without these)

- Owner answers: who wrote the HeadHunter article (its four pages have no byline yet); who Mark is on the About
  team list, so his byline can link there; what ArmorHide's H key does (the Modrinth page only names the binding).
- The owner runs `.drip/drafts/commands-to-test.md` in game (53 checks from October, plus sections C–F added on
  2026-11-19). An attempt on 2026-11-19 to run most of them on headless vanilla servers over RCON was blocked by
  the session's permission filter (it would have downloaded a Java 25 runtime for 26.3 and started servers); the
  server jars' `version.json` did confirm data pack formats 121 (26.3) and 61 (1.21.4) for B7/B8. Two tool changes wait for that run: the
  dialogue page's message designer writes `hoverEvent`/`clickEvent` (renamed in 1.21.5, checks B2–B4), and the book
  builder's component output may not suit 1.20.5–1.21.4 (B5).

**Headless server run, done 2026-11-19**

The owner allowed running vanilla servers (26.3, 26.2, 1.21.4, 1.21.1, 1.20.6, 1.20.4; Java 25 for 26.x) over RCON.
Results are in `.drip/drafts/commands-to-test.md` ("Итоги прогона"); only checks that need a player's screen or a
resource pack are left for the owner. What the run found:

- **26.3 changed data formats silently.** Loot tables: an entry's `functions`/`function` became `modifier`/`type` and
  `conditions`/`condition` became `condition`/`type`; each version ignores the other's keys without an error. Loot
  condition objects in advancements and predicates changed the same way, and 26.2 had already renamed the entity
  predicate's `type` to `minecraft:entity_type`. On 26.3 a data pack file that fails to parse is a registry error: the
  server does not start with that pack.
- Fixed from that: the loot table generator (version list, 26.3 by default), the randomizer's loot output (26.3+
  branch), the advancement builder's kill-entity condition (per version), the data pack generator's example loot table
  (`rolls` without a type stopped 26.3 from starting), the loot and advancement guides.
- Also fixed: the message designer (writes both hover/click namings, works on 1.20 – 26.x), the book builder (three
  branches; any line break failed before 1.21.5), and the enchantment article (`/reload` is enough for a tag override).
- Checked and fine: bossbars and both countdowns, potions, items, swords and staffs, trades, books on 26.3, recipes
  (a crafter made the recipe generator's output), `/enchant` conflicts, the hide-effects tooltip in every branch.
- Analytics: Google's consent message is published (since 2026-10-24) but AdSense counts 0 impressions, most likely
  because the site is not approved. So for every visitor, not only in the EEA, the site banner now appears after a
  5 s wait instead of at once, which most likely explains the GA4 drop below. The wait is 1.5 s since 2026-11-19
  (owner's decision); compare GA4 consented views by day before and after that date to confirm.

**Search Console pass, done 2026-11-19**

The owner reported falling views. Search Console (queries, last 28 days against the previous 28) showed Google
clicks *up*: the top 30 queries gave 433 clicks against 346. So the drop is in GA4, not in search. The likeliest
cause is measurement: on 2026-10-24 (`9f21f4b`) the EEA, UK and Switzerland moved to Google's consent message, GA4
records only consented page views, and `cmp` mode deletes the old `accepted` answer. Not yet confirmed: it needs
GA4 views by country (EEA against the rest) before and after 2026-10-24, and a check that Google's message
actually shows while AdSense has not approved the site. Changes made from the query data:

- Potion builder: "Hide effect lines in the tooltip" (`tooltip_display` 1.21.5+, `hide_additional_tooltip`
  1.20.5–1.21.4, `HideFlags:32` older) and a `#hide-effects` section in the guide (x4); searchers on 26.3 asked for it.
- Sphere generator: title and description say it counts blocks per layer (2.5k impressions, 0.44% CTR, position 8).
- Resource pack generator: builds for the chosen version, 1.20 – 26.3 (pack format, `min_format`/`max_format`
  from 1.21.9, armor in `textures/entity/equipment` from 1.21.2, CMD variants as an `items/` definition with
  `range_dispatch` from 1.21.4, matching `/give`). This closes the "biggest remaining gap" noted in October. The
  English page also had garbled emoji since April (`9beab42`), fixed; a site-wide scan found no other case.
- `wiki-enchantment-conflicts` (x4) rewritten from the 26.3 `exclusive_set` tags: it had missed Infinity vs
  Mending, wrongly grouped Loyalty with Channeling, left Impaling/Density/Breach out and called Channeling
  treasure. The randomizer carried the same two data errors; fixed.
- `wiki-minecraft-server-announcements` (x4) went from 391 words with no commands to a how-to with /say, /tellraw
  (old and 1.21.5+ hover/click fields), /title, action bar, boss bars and a scheduled broadcast.
- Privacy policy (x4) gives the email instead of the Discord nick.
- `styles.css`: `.prose-table` cells break long words on phones (12 pages had German/Russian tables wider than 360 px).
- Still open from this pass: the dialogue page's message designer writes `hoverEvent`/`clickEvent`, which 26.x
  ignores (B2–B4); the fix waits for the in-game run, as decided in October.

## Known issues

None open. The three found on 2026-10-24 are closed: the hubs rolled back by `3174b9e` were restored (`465b592`),
the homepage metric says 18 and `tests/homepage-tool-count.test.cjs` keeps it honest, and `sitemap-refresh.yml`
keeps `sitemap.xml` current.

## Operating rules

AdSense declined the site; it was resubmitted on 2026-11-19 and is under review, so content quality comes first and
nothing new is published until the answer:

- Prefer content depth, documentation and queue work. Avoid large live-page restructuring unless it fixes a real bug.
- Do not add thin placeholder pages; every new release should include a tool or article with enough context, navigation, and sitemap coverage.
- New drip bundles must not carry their own copy of `assets/site.js` or `sitemap.xml` in `payload/` — those are shared files and get updated in a separate commit.
- Hub pages are shared too. If a bundle must ship a hub (`index.html`, `tools/index.html`, `wiki/index.html` in any
  locale, `404.html`), take it with `drip-base.sh --copy` so `BASE.txt` records the live version it came from. A stale
  copy silently undoes everything committed since it was made; validation and Checks now reject it and name the
  commits, and `drip-base.sh --update` carries the bundle's edit onto the current live file.
- A bundle that adds a tool also bumps the homepage tool count (a test fails if it is wrong) and sets `data-released`
  on its catalog card.
