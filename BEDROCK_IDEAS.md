# Bedrock section: ideas for later

**Status: idea only, nothing is scheduled.** The owner's plan (2026-11-20) is to open a second section of the
site with ready-to-copy commands and pack files for Bedrock Edition once the Java ideas run out. This file
keeps the research so nobody has to redo it. Nothing here goes into `.drip/queue/` before the AdSense review
is over and the owner picks it up.

The facts below were checked on 2026-11-20 against the sources listed at the end. Items marked *(verify)*
came from a single source or from memory. Bedrock changes its formats often: before building any tool, check
its format against the Microsoft Creator docs and `Mojang/bedrock-samples`, and run every output in a real
Bedrock game.

## Why a Bedrock section

- Bedrock is the edition on phones, consoles and the Windows store version. All 18 live tools write Java
  syntax, so those players get nothing from them except the edition-neutral ones (see below).
- Fewer good tools exist. The Bedrock Wiki documents the formats well, but in this research no tool built
  `rawtext` with score, selector and translate in one place. Competitors seen: the gamergeeks title generator
  (Java and Bedrock) and the minecraftmaps Bedrock trade editor.
- Bedrock has commands Java lacks (`/camera`, `/hud`, `/fog`, `/dialogue`, `/inputpermission`). Tools for
  them have no Java twin, so they are new content and not copies of our Java pages.

## What differs between the editions

| Topic | Java (what our tools write today) | Bedrock |
| --- | --- | --- |
| Item data in `/give` | Components: name, lore, enchantments, `custom_data`, `item_model`, CustomModelData | `/give <target> <item> [amount] [data] [components]`. The JSON accepts only `can_place_on`, `can_destroy`, `item_lock`, `keep_on_death`. No name, lore or enchantments. |
| Named or enchanted items | `/give` with components | A loot table with `set_name`, `set_lore`, `specific_enchants`, `set_book_contents` and similar functions, handed out by `/loot` *(check the `/loot give` syntax)* |
| Chat and titles | JSON text with colours, click and hover events | `/tellraw` and `/titleraw` with `{"rawtext":[...]}`: `text`, `selector`, `score`, `translate` + `with`. Colour only via `§` codes; no click or hover. |
| Packs | Data pack and resource pack with `pack.mcmeta` | Behavior pack and resource pack, each with a `manifest.json` (header and module UUIDs, version, `min_engine_version`, dependencies), shipped as `.mcpack` or `.mcaddon` |
| `/summon` | Entity NBT (`Offers`, `CustomName`, attributes) | `/summon <entity> [pos] [rot] [spawnEvent] [nameTag]`, no NBT |
| Bossbars | `/bossbar` | None; only boss mobs or the Script API |
| Advancements | Custom ones in data packs | None (fixed achievements) |
| Custom items | Vanilla item plus components and `item_model` | A new item defined by an add-on: BP `items/*.json` plus the texture in RP `item_texture.json` |
| Block states in commands | `oak_stairs[facing=north]` | `["state"=value]` with quoted state names that often differ from Java's *(verify per block)* |
| Functions | `data/<ns>/function/`, tick and load tags | BP `functions/*.mcfunction`, `functions/tick.json` |
| `/execute` | Full, including `store` | The same modern syntax, without `store` *(verify)* |
| Scripting | None | Script API: `@minecraft/server`, `@minecraft/server-ui` forms, Data-Driven UI |
| Brewing recipes | Not data-driven | `minecraft:recipe_brewing_mix` and `recipe_brewing_container` in a behavior pack |
| Versions | 26.x since 2026 | Also 26.x since 2026, but releases and formats are separate from Java's |

## What happens to each current tool

| Tool | On Bedrock | Notes |
| --- | --- | --- |
| Sphere generator | Works as is | Geometry is the same. Say so on the page; no new page needed. |
| Circle & dome planner | Works as is | Same. |
| Skin editor | Works as is | Bedrock imports classic 64×64 skins (wide and slim). Possible extra: skin pack export (idea 16). |
| Texture painter | Works as is | The PNG works in both editions. Pack export comes with idea 15. |
| Custom item catalog | Works as is | Just a list; could gain an "edition" field. |
| Loot table generator | New page, same idea | Idea 3. The format is close to Java's. |
| Recipe generator | New page, same idea | Idea 4. The result takes only item, count and data, so the name, lore and enchantment features don't apply. |
| Data pack generator | Becomes the pack generator | Idea 2. |
| Dialogue builder, announcement builder (queued) | Become the rawtext builder and NPC scenes | Ideas 1 and 7. |
| Custom villager trades | Becomes the trade table builder | Idea 14. No trades by command; a table changes every villager of that profession. |
| Resource pack generator | Bedrock mode or new page | Idea 15. Big: `assets/app.js` is shared and large. |
| Custom item builder, custom potions, book & letter builder | Replaced by the loot-based item builder | Idea 12. `/give` can't carry the data, but loot functions can. |
| Enchantment randomizer | Weak | `/enchant` only goes up to normal max levels, and Bedrock has no attribute modifiers. Low priority. |
| Bossbar builder, advancement builder, item model builder | No counterpart | The features don't exist on Bedrock. |
| Custom painting generator (queued) | No counterpart *(verify)* | No data-driven painting variants seen; you can only retexture existing ones. |

## Idea list

Effort: **S** is a small page or an extension of an existing one, **M** is a new UI over a known format,
**L** is new file formats, packaging or shared-file work. Slugs are suggestions (see "How the section could be built").

### Phase 0: cheap, possible before the section exists

- **"Works on Bedrock too" paragraph** on the sphere generator, circle planner, skin editor, texture painter
  and catalog pages, in all four locales. **S.** Adds search coverage without new pages.
- **Wiki article "Java vs Bedrock commands: what works where"**, built on the table above and written for
  players. **S–M.** Real substance for AdSense, and later the entry point that links into the section.

### Phase 1: launch set (one release, so the hub has several live tools on day one)

1. **Rawtext builder** (`bedrock-tellraw-generator`), **M.** Builds `/tellraw @a {"rawtext":[...]}`,
   `/titleraw @a title|subtitle|actionbar {...}` and `/titleraw @a times <in> <stay> <out>`. A colour picker
   inserts `§` codes, and there are chips for score and selector, plus translate with `with`. Reuses the
   dialogue builder and announcement builder UI. This is the clearest gap found in the research.
2. **Pack generator / manifest and UUID** (`bedrock-pack-generator`), **M.** Builds a `.mcpack` or `.mcaddon`
   with BP and RP manifests, fresh UUIDs, the BP→RP dependency, `pack_icon.png`, `texts/en_US.lang` and empty
   `functions/`, `loot_tables/`, `recipes/` and `items/` folders. Reuses the data pack generator's ZIP code.
   Every Bedrock pack needs this step, and ideas 3, 4, 12–15 output into such a pack.
3. **Loot table generator for Bedrock**, **M.** Builds BP `loot_tables/...json`: pools, rolls, weights,
   `set_count`, `set_data`, `enchant_randomly`, `enchant_with_levels`, `set_name`, `set_lore`. Reuses the
   loot table UI, with the Bedrock function list instead of Java's.
4. **Recipe generator for Bedrock**, **M.** Covers shaped and shapeless recipes, furnace (`furnace`,
   `blast_furnace`, `smoker`, `campfire` tags), smithing and **brewing**, which Java can't do in data. The
   result holds only `item`, `count` and `data`. Needs a Bedrock item list with icons:
   `assets/recipe-items.js` is built from Java data by `scripts/build-recipe-items.py`, so take a second list
   from `bedrock-samples`. Check the `unlock` field the recipe book needs *(verify)*.

### Phase 2: Bedrock-only commands (no Java twin, the most original content)

5. **Camera and cutscene builder**, **M–L.** Covers `/camera <player> set <preset> [ease <time> <type>] [pos <xyz>] [rot|facing ...]`,
   `/camera <player> fade time <in> <hold> <out> color <r> <g> <b>` and `/camera <player> clear`. A list of
   keyframes becomes `.mcfunction` lines. Timing differs from Java's `/schedule function <ticks>`: use a
   scoreboard tick timer, or `/schedule delay` if the target version has it *(verify)*.
6. **HUD and input lock**, **S.** Covers `/hud <player> hide|reset <element>` and
   `/inputpermission set <player> <permission> enabled|disabled`. Too thin alone, so make it a "cutscene mode"
   panel inside idea 5.
7. **NPC dialogue scene builder**, **M.** Builds BP `dialogue/*.json` scenes (NPC name, rawtext text, buttons
   that run commands, on-open and on-close commands) plus `/dialogue open <npc> <player> [scene]` and
   `/dialogue change`. Builds on the dialogue builder idea, but with buttons, which Java's `tellraw` lacks.
   A Mojang bug report says selector and score don't work in rawtext inside dialogue JSON; check it first.
8. **Fog builder**, **M.** Builds an RP `fogs/*.json` definition plus `/fog <player> push|pop|remove <fog_id> <user_id>`.
9. **Block state picker for `/setblock` and `/fill`**, **M** (data-heavy). You pick a block and its states and
   get the command. It needs the Bedrock block-state data and is useful because the syntax and state names
   differ from Java's.
10. **Kit `/give` with Bedrock components**, **S.** Covers `item_lock` (`lock_in_slot`, `lock_in_inventory`),
    `keep_on_death`, `can_place_on` and `can_destroy` for adventure-map kits. It could merge into idea 12.
11. **Small commands** (`/camerashake`, `/music`, `/playanimation`). Standalone pages would be thin, so fold
    them into ideas 5 and 7.

### Phase 3: add-on builders (bigger, file-based)

12. **Item builder via loot table**, **M.** It sets name, lore, enchantments (`specific_enchants`, which can go
    past normal limits), potion (`set_potion`) and book contents (`set_book_contents`; rawtext doesn't work
    for author and title). The output is a loot table file plus the `/loot` command that gives the item. It is
    the Bedrock answer to the custom item builder, custom potions and book & letter builder, and needs the
    pack from idea 2.
13. **Custom item add-on builder**, **L.** Builds BP `items/<id>.json` (`minecraft:icon`, `display_name`,
    `max_stack_size`, durability, food, wearable, damage) plus RP `item_texture.json`, lang lines and a
    texture from the texture painter.
14. **Trade table builder**, **L.** Builds BP `trading/*.json` (tiers → groups → trades with wants and gives,
    max uses, trader XP). The page must explain how a table reaches a mob: it overrides a vanilla table at
    its vanilla path, or a custom entity uses `minecraft:trade_table` / `economy_trade_table`. Reuses the
    custom villager trades UI.
15. **Resource pack generator, Bedrock mode**, **L.** Replaces vanilla textures under `textures/items` and
    `textures/blocks`, writes `item_texture.json`, `terrain_texture.json` and `flipbook_textures.json` for
    animated textures, and outputs a `.mcpack`. Touches the shared `assets/app.js`.
16. **Skin pack export** from the skin editor, **S–M.** Builds a `.mcpack` with manifest, `skins.json` and lang
    files. It's an extension of the existing page, not a new page. Check which platforms import skin packs.
17. **Script API form builder**, **L.** Generates JS for `ActionFormData`, `ModalFormData` and
    `MessageFormData` (`@minecraft/server-ui`) plus the manifest `script` module and its dependency.
    Bedrock-only and wanted by server and Realm makers. Module versions change often, and every output needs
    an in-game test.

## How the section could be built

- **URLs.** Flat, like the rest of the site: hub `/bedrock/`, tools `/bedrock-<slug>/`, guides
  `/wiki-bedrock-<slug>/`, each mirrored under `ru/`, `fr/`, `de/`. It matches `wiki-<slug>/`. Check
  `scripts/generate-sitemap.sh` and `scripts/check-links.mjs` anyway. The alternative is nested
  `/bedrock/<slug>/`.
- **Copy first.** Every tool ends in a Copy button per command and a Download button per file
  (`.mcpack`, `.mcfunction`, `.json`), reported with the existing copy and download events (ANALYTICS.md).
- **Navigation.** `assets/site.js` builds the Tools and Wiki dropdowns from its registry, whose entries carry
  `path`, `guidePath` and `sectionId`. Bedrock needs a third dropdown or a group, so probably a field like
  `edition: "bedrock"` in the registry. It is a shared file, so claim it first.
- **Catalog and counter.** Bedrock cards go either in a section of `tools/index.html` or on their own hub.
  Hubs follow the `BASE.txt` rules in drip releases. `tests/homepage-tool-count.test.cjs` counts the
  `resource-link` cards in `tools/index.html`, so where the cards live decides whether "N live browser tools"
  on the homepage includes them.
- **Cross-links.** Every Java tool with a Bedrock counterpart gets an "On Bedrock? Use …" line, and the Bedrock
  page links back. Don't use `hreflang` between the editions, which is only for languages.
- **No copied pages.** Each Bedrock page needs its own text about what is different on Bedrock. A Java page
  with words swapped is the thin or duplicate content AdSense review flags.
- **Analytics.** Add the slugs to `TOOL_SLUGS` in `assets/tracking.js`. An `edition` parameter (custom
  dimension) would let GA4 compare Java and Bedrock use.
- **Launch.** One drip release with the hub and the Phase 1 tools in all four locales. No "soon" cards: they
  were removed on 2026-10-24 because AdSense counts unlaunched pages against the site.
- **Testing.** It needs a Bedrock install (Windows or a phone) to run each output in game. Java checks prove
  nothing here.

## Open questions for the owner

1. Flat `/bedrock-<slug>/` URLs or nested `/bedrock/<slug>/`?
2. Do Bedrock tools count in the homepage metric and appear in the same Tools menu, or get their own menu?
3. Target only the latest stable Bedrock, or offer a version selector like the Java tools?
4. Who tests the outputs in Bedrock, and on which device?
5. Do Phase 0 early (it is cheap and helps the Java pages too), or wait and launch everything together?

## Sources (checked 2026-11-20)

- Microsoft Creator docs: [command list](https://learn.microsoft.com/en-us/minecraft/creator/commands/commands),
  [raw message JSON](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/rawmessagejson),
  [loot and trade table functions](https://learn.microsoft.com/en-us/minecraft/creator/documents/lootandtradetablefunctions),
  [trade table component](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_trade_table),
  [Data-Driven UI](https://learn.microsoft.com/en-us/minecraft/creator/documents/scripting/intro-to-ddui)
- Bedrock Wiki: [items with components](https://wiki.bedrock.dev/commands/giving-nbt-items),
  [rawtext](https://wiki.bedrock.dev/text/rawtext), [item functions](https://wiki.bedrock.dev/loot/item-functions),
  [trade tables](https://wiki.bedrock.dev/loot/trade-tables)
- [Bedrock 26.0 changelog](https://www.minecraft.net/en-us/article/minecraft-26-0-bedrock-changelog) (26.x numbering)
- Vanilla pack files to copy formats and item lists from: [Mojang/bedrock-samples](https://github.com/Mojang/bedrock-samples)
- Competitors: [gamergeeks title generator](https://www.gamergeeks.net/apps/minecraft/title-command-generator),
  [minecraftmaps Bedrock trade editor](https://www.minecraftmaps.com/tools/bedrock-trade-editor)
