# ANALYTICS.md — events, parameters and GA4 setup

What the site sends to GA4 (`G-HDJD70TN5K`), how, and what has to exist in the GA4 admin for the data to be
usable. Code: [assets/tracking.js](assets/tracking.js) (core, Consent Mode v2, cookie banner),
[assets/tracking-config.js](assets/tracking-config.js) (IDs), tool scripts (`CubeAnalytics.track(...)` calls),
[assets/constructor-nodes.js](assets/constructor-nodes.js) (node editor). Tests: [tests/analytics.test.cjs](tests/analytics.test.cjs).

## Rule for browser checks: never send local traffic to the live property

`tracking.js` sends nothing to GA4 from `localhost`, `*.localhost`, `127.x`, `::1`, private LAN addresses
(`10.x`, `192.168.x`, `172.16-31.x`), `*.local` and `file://`. It logs every event to the console instead
(`[CubeAnalytics] <event> {…}`), whatever `debug` says. Nothing to configure.

To look at real `collect?v=2` requests in DevTools → Network, open a page on a local server with
**`?analytics_test=1`**. Events then go to the fictitious property `G-TEST000000` (Google Ads is switched off). The flag is
kept for the tab in `sessionStorage`, so it survives navigation; `?analytics_test=0` clears it. On a real host the flag is
ignored, so a shared link can never divert real visitors. Filter the Network tab by `collect?v=2`, and expect the
events about 5 seconds after the action (gtag batches hits). Event parameters appear as `ep.<name>` (text) and
`epn.<name>` (number); the first event of a batch is in the URL, the rest in the request body.

Never point a browser check at `cubeinsquare.com`, and never copy the real ID into a test.

## Events

All events go through `window.CubeAnalytics.track(name, params, options)`. Parameters are cleaned by `sanitizeParams`
(empty values dropped, text cut to 300 characters) and the gtag call is deferred with `deferWork`
(`requestIdleCallback`), which keeps the click handler free for the browser to paint (the INP fix from `a3f1530`).

Common parameters, added by `track()` to every event:

| Parameter | Value |
| --- | --- |
| `page_language` | `en`, `ru`, `fr`, `de` (from `<html lang>`) |
| `page_type` | `home`, `tool`, `wiki`, `tools`, `about`, `privacy_policy`, `page`; see below |
| `page_path` | `location.pathname` |
| `tool_id` | On a tool page: the slug with `_`, e.g. `recipe_generator`. Not set elsewhere |
| `guide_for` | On the guide of a tool (`/wiki-<tool slug>/`): that tool's id. Not set on other wiki pages |
| `editor_mode` | `form` or `nodes`, on pages with the node editor, once it has loaded. Absent from `page_view` (the editor loads after it) |

`page_type` for the tool pages is `tool`, except the three oldest tools that keep what they always reported:
`resource_pack_generator`, `custom_potions`, `custom_villager_trades`. The guides of those three used to report the tool's
type by mistake and now report `wiki`, so `page_type` for those three guides changes with this release. The other tool pages
used to report `page`.

### Tool events

| Event | Parameters | Sent when |
| --- | --- | --- |
| `tool_copy` | `output_kind`, `mc_version`?, `item_format`? | the text reached the clipboard |
| `tool_download` | `file_kind`, `mc_version`?, `item_format`? | the download started |
| `tool_example_load` | — | a visitor clicked a preset or example button (never the preset a tool loads by itself) |
| `tool_mode_switch` | `editor_mode` (the new mode) | Form ⇄ Nodes switch in the node editor (never the initial setup) |
| `guide_link_click` | `link_from`, `link_to`, `click_area` | a click on a link to a tool or to the guide of a tool |

`mc_version` is only ever a real game version, as the tool's version select names it (`1.21.4`, `26.1`, …).
`item_format` is the command syntax generation of the tools that offer one: `modern` (1.21.4+ components),
`current` (1.20.5–1.21.3 components), `legacy` (before 1.20.5, NBT). Book & letter and the enchantment randomizer offer only
`modern` (1.20.5+ components) and `legacy`.

| Tool | `tool_copy` `output_kind` | `tool_download` `file_kind` | `tool_example_load` | version parameter |
| --- | --- | --- | --- | --- |
| recipe-generator | `json` | `json` | presets | `mc_version` |
| loot-table-generator | `json` | `json` | presets | — |
| advancement-builder | `json`, `command` (grant) | `json` | presets | `mc_version` |
| enchantment-randomizer | `command`, `json` (output format) | `txt`, `json` | — | `item_format` |
| datapack-generator | `pack_mcmeta`, `file_content` | `zip` | — | `mc_version` |
| sphere-generator | `layer`, `all_layers` | — | — | — |
| circle-dome-planner | `plan`, `stack` | — | presets | — |
| item-model-builder | `json` | — | examples | — |
| custom-item-catalog | `catalog_entry` | `json`, `csv`, `md` | example | — |
| dialogue-builder | `command`, `message_command` (second panel) | — | presets (both panels) | — |
| book-letter-builder | `command` | — | presets | `item_format` |
| bossbar-builder | `command` | — | presets | — |
| custom-item-builder | `command` | — | example | `item_format` |
| custom-potions | `command`, `command_block_give` | — | example | `item_format` |
| custom-villager-trades | `command`, `command_block_give` | — | — | `item_format` |
| resource-pack-generator | — | `zip` | — | — |
| texture-painter, skin-editor | — | `png` | — | — |

In the node editor the buttons that mirror the form (copy, download, presets) call the tool's own handlers, so they report
themselves with `editor_mode: nodes`. Only the node editor's own **Copy result** button reports from
`constructor-nodes.js`; its `outputKinds` / `versionFields` tables must follow the tool scripts. Extra `output_kind`
values there: `file_tree` and `ingredients` (the read-only helper fields of the data pack and recipe pages), `other`
(unknown field).

### Link clicks: `guide_link_click`

A delegated click handler in `tracking.js` (no markup on the pages) reports a click on a link whose target is a tool
page or the guide of a tool (`TOOL_SLUGS`, any locale). It ignores links to the page itself, language switches
(`.language-switch`), `download` links, other sites and other pages (hubs, articles).

`link_from` / `link_to` name the pages with one value each: `tool:<id>`, `guide:<id>`, `article:<slug>`, `hub:tools`,
`hub:wiki`, `page:<slug>`, `home`. `link_to` is always `tool:` or `guide:`.

`click_area` is the container of the link, first match wins:

| `click_area` | Container | Typical link |
| --- | --- | --- |
| `navigation` | `.steam-navbar` (menus built by `site.js` included) | Tools / Wiki dropdown |
| `footer` | `.site-footer` | — |
| `card` | `.resource-card` | hub and home cards, search results |
| `hero` | `.page-hero` | "Open the generator" under a guide's title |
| `cta` | `.tool-button-row` | "Read the guide" on a tool page |
| `related` | `.item-builder-help`, `.tool-secondary-column` | "Related" list on a tool page |
| `article_body` | `.wiki-article`, `.article-shell` | inline links in a guide |
| `other` | anything else | — |

Delivery. A plain click that leaves the page in the same tab is **parked** in `sessionStorage`
(`cube_pending_link_click`) and sent by the page it lands on, through `track()` and `deferWork`, with the parameters
of the page the click happened on (`page_path`, `page_type`, `tool_id`/`guide_for`, `editor_mode`). It is dropped
if the visitor lands anywhere else than the link's target or more than 60 seconds later. Clicks that keep the page alive
(Ctrl/Cmd/Shift/Alt, middle button, `target="_blank"`, a prevented default) are sent at once. Because the
event is sent by the next page, a visitor who leaves that page within a few seconds can still lose it, like that page's own `page_view`.

Why parked: see [the check below](#why-link-clicks-are-parked).

### Older events (kept)

New events are sent next to these, never instead of them. Only the old ones carry the Google Ads `conversionKey`.

| Old event | Sent together with |
| --- | --- |
| `custom_item_command_copy` | `tool_copy` (`command`) |
| `custom_item_example_load` | `tool_example_load` |
| `potion_command_copy` | `tool_copy` (`command`) |
| `potion_command_block_give_copy` | `tool_copy` (`command_block_give`) |
| `potion_example_loaded` | `tool_example_load` |
| `villager_command_copy` | `tool_copy` (`command`) |
| `villager_command_block_copy` | `tool_copy` (`command_block_give`) |
| `resource_pack_download` | `tool_download` (`zip`) |
| `texture_painter_export` | `tool_download` (`png`) |
| `skin_editor_export` | `tool_download` (`png`) |

Unchanged and unpaired: `page_view`, `site_search`, `wiki_example_copy`, `cookie_consent_update`, `resource_pack_build_*`,
`texture_slices_applied`, `resource_pack_preview_open`, `potion_effect_added`, `villager_trade_added`, `texture_painter_*` other
than export, `skin_editor_*` other than export. The old events have their own spellings (`version`, `syntax_version`);
they were not renamed.

## Custom dimensions to create in GA4

Admin → Data display → Custom definitions → Create custom dimension, scope **Event**, dimension name = event parameter.
GA4 fills a dimension only from the day it is created, with no backfill, so create them right after a deploy.

| Event parameter | Dimension name | Used by |
| --- | --- | --- |
| `tool_id` | Tool ID | every event on a tool page |
| `guide_for` | Guide for | every event on a tool guide |
| `output_kind` | Output kind | `tool_copy` |
| `file_kind` | File kind | `tool_download` |
| `mc_version` | Minecraft version | `tool_copy`, `tool_download` |
| `item_format` | Item format | `tool_copy`, `tool_download` |
| `editor_mode` | Editor mode | tool events on node editor pages |
| `link_from` | Link from | `guide_link_click` |
| `link_to` | Link to | `guide_link_click` |
| `click_area` | Click area | `guide_link_click` |

That is 10 of the 50 event-scoped dimensions a property allows. Create `page_type` and `page_language` too if they are not
there yet. Do not register `click_label`, `click_href`, `page_path` or `page_title`: they have too many values. Mark
`tool_copy` and `tool_download` as key events (Admin → Events).

Useful reports once they exist: `tool_copy` by Tool ID × Output kind; `tool_example_load` → `tool_copy` per tool;
`tool_mode_switch` by Editor mode; `guide_link_click` by Link from × Link to × Click area.

## Why link clicks are parked

A click on a link that opens another page in the same tab is not delivered from the page being left. Checked on
2026-10-24 in headless Chrome 155 against the fictitious property (`?analytics_test=1`), reading `collect?v=2` requests from the
network. The question was whether the click simply came before `gtag.js` had loaded, with the event still queued in
`dataLayer`. Three runs per row, the same tool page, the "Read the guide" link:

| Variant | `gtag.js` loaded at click | Direct event, sent by the page being left | Parked event, sent by the guide page |
| --- | --- | --- | --- |
| Late click (after `gtag.js` loaded and the first hit went out) | yes, 3/3 | **0/3 delivered** | 3/3 delivered |
| Early click (`gtag.js` held back 4 s, click 0.6 s after DOMContentLoaded) | no, 3/3 | **0/3 delivered** | 3/3 delivered |
| Control: button click, no navigation | yes | 3/3 delivered | — |

The hypothesis is wrong: the event is lost whether or not `gtag.js` had loaded. In this setup gtag sends a queued event about five seconds after
the call, and a page that is left in that time takes it along. Three alternatives on the page being left did not rescue the
event either, 0/3 each: sending inline in the click handler instead of in an idle callback, the same with
`transport_type: 'beacon'`, and flushing the deferred work on `pagehide` (that one measured with an earlier harness that
intercepted requests). Sending from the destination page was delivered every time and keeps `deferWork`, so that is what the
code does. This is one browser and one network; read 0/3 as "cannot be relied on", not as a loss rate.

## Adding a tool

1. Add its slug to `TOOL_SLUGS` in `assets/tracking.js`. `tests/analytics.test.cjs` fails when a live tool is missing there
   (that decides `tool_id`, `guide_for` and `guide_link_click`). For a tool that goes out through `.drip/queue`, do not put
   `assets/tracking.js` in the payload: a copy made weeks earlier would roll back every later edit, as the hubs did
   ([DRIP_PUBLISHING.md](DRIP_PUBLISHING.md)). Commit the slug to `main` before the Sunday publish; if it is forgotten, Checks goes red after the
   publish and the new tool's events carry no `tool_id` until the slug lands.
2. Load `tracking-config.js` and `tracking.js` on the tool page and its guide in all four locales; the same test checks it.
3. Report copy, download and examples with `track('tool_copy' | 'tool_download' | 'tool_example_load', {…})`, after the
   action succeeded and only for clicks, not for what the page does by itself. Reuse the `output_kind` / `file_kind` words above
   and add the new tool to the table. If the tool has the node editor, add its read-only fields to `outputKinds` and its version
   select to `versionFields` in `constructor-nodes.js`.
4. Nothing else: the guide links are picked up from the path.

## Known gaps

- `tool-coming-soon/` (four locales) and the `en/index.html` redirect stub load no analytics.
- Custom potions: the **Load example**, **+ Add effect** and **Reset** buttons only react to a click on the button's edge. The
  handler compares `event.target` with the button, and a click on the label lands on the `<span>` inside it. The old
  `potion_example_loaded` / `potion_effect_added` and the new `tool_example_load` under-count because of it.
- The custom-item catalog's JSON import and the basic/advanced switch of the enchantment randomizer have no event.
