# ANALYTICS.md — events, parameters and GA4 setup

What the site sends to GA4 (`G-HDJD70TN5K`), how, who asks for consent, and what has to exist in the GA4 admin for the
data to be usable. Code: [assets/tracking.js](assets/tracking.js) (core, Consent Mode v2, cookie banner, Google CMP
hand-off), [scripts/consent-defaults.txt](scripts/consent-defaults.txt) (the Consent Mode defaults in every `<head>`, see
[Consent](#consent)), [assets/tracking-config.js](assets/tracking-config.js) (IDs), tool scripts (`CubeAnalytics.track(...)` calls),
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
`item_format` is the command syntax generation of the tools that offer one: `latest` (1.21.5–26.x components, text
components in SNBT), `modern` (1.21.4 components), `current` (1.20.5–1.21.3 components), `legacy` (before 1.20.5, NBT).
The custom item builder, custom potions and villager trades offer all four (`latest` since 2026-10-25; before that
`modern` meant 1.21.4+). Book & letter offers only `modern` (1.20.5+ components) and `legacy`. The enchantment
randomizer sends `latest` for its 1.21.5–26.x branch and `modern` for 1.21.2–1.21.4 and 1.21–1.21.1, with the
branch's first version as `mc_version` (`1.21.5`, `1.21.2`, `1.21`).

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

Unchanged and unpaired: `page_view`, `site_search`, `wiki_example_copy`, `resource_pack_build_*`,
`texture_slices_applied`, `resource_pack_preview_open`, `potion_effect_added`, `villager_trade_added`, `texture_painter_*` other
than export, `skin_editor_*` other than export. The old events have their own spellings (`version`, `syntax_version`);
they were not renamed.

Custom potions before 2026-10-24: the **Load example**, **+ Add effect** and **Reset** buttons ignored a click on their label
(the delegated handler compared `event.target` with the button, and the label is a `<span>` inside it), so
`potion_example_loaded`, `potion_effect_added` and `tool_example_load` for that tool under-count until that date. Delegated
click handlers match with `event.target.closest(...)`, never `event.target === button`; `===` stays only for input events
on the field itself and for deliberate "the empty canvas itself" checks in `constructor-nodes.js`.

### Consent choice: `cookie_consent_update`

| Parameter | Value |
| --- | --- |
| `consent_source` | `site` (the site's banner) or `cmp` (Google's consent message) |
| `consent_state` | `accepted`, `declined`; from the CMP also `partial` |

From the banner it is sent on the click. From the CMP it is sent when the visitor finishes a choice (TCF event
`useractioncomplete`, also after reopening the message), described by the TCF purposes that matter for ads: no
purpose 1 (storage) is `declined`, purposes 1, 3 and 4 (storage, ad profile, personalised ads) are `accepted`,
anything in between is `partial`. `consent_source` is new (2026-10-24) and has no custom dimension yet; create one if the
consent rate per source should appear in reports.

## Consent

Two tools ask, never both on one page view:

| Where | Who asks | Who updates Consent Mode | Answer kept in |
| --- | --- | --- | --- |
| EEA, UK, Switzerland | Google's consent message (Google's CMP, IAB TCF), set up in AdSense → Privacy & messaging | Google's CMP, because "consent mode for advertising / analytics purposes" is enabled in the AdSense account | Google's cookies |
| Everywhere else, and wherever the CMP does not answer | the site's banner in `tracking.js` | `tracking.js` | `localStorage` `cube_cookie_consent` (`accepted` / `declined`) |

Google requires a Google-certified TCF CMP to serve personalised AdSense ads in the EEA, the UK and Switzerland; traffic
without one gets non-personalised or limited ads at best ([AdSense 13554020](https://support.google.com/adsense/answer/13554020),
[13554116](https://support.google.com/adsense/answer/13554116)). The site's banner is not a TCF CMP, hence the split.

### How a page decides (`watchConsentPlatform` in `tracking.js`)

`tracking.js` asks Google's CMP through `googlefc.callbackQueue` (`CONSENT_API_READY`, then `__tcfapi('addEventListener')`),
the way the [Funding Choices API](https://developers.google.com/funding-choices/fc-api-docs) prescribes. The CMP is
loaded by `adsbygoogle.js`, so it only exists on pages with the AdSense tag.

| CMP says | Mode | What happens |
| --- | --- | --- |
| `gdprApplies: true` | `cmp` | No site banner (removed if it already shows); `tracking.js` sends no consent update; `cube_cookie_consent` is deleted |
| `gdprApplies: false` | `site` | The stored answer is sent as `gtag('consent', 'update')`; no answer means an explicit `denied` update and the banner |
| nothing within 5 s, or the API loads but reports nothing within 5 more seconds | `site` | as above |
| no AdSense tag on the page | `site` | at once |
| `gdprApplies: true` after the page already went `site` | `cmp` | the site banner disappears; its earlier update stays until the CMP sends its own |

The old answer is deleted in `cmp` mode because it is not a TCF consent (Google's message asks once), and because the
`<head>` block would otherwise keep asking AdSense for non-personalised ads after an old "declined", overriding a consent
given in Google's message. That affects only the first page a visitor from those regions opens after the change.

"Cookie settings" (`Настройки cookie`, `Paramètres des cookies`, `Cookie-Einstellungen`) is a `<button>` that
`tracking.js` adds to `.site-footer` next to the privacy link once the mode is known: in `cmp` mode it calls
`googlefc.showRevocationMessage()`, in `site` mode it reopens the banner. A button, not a link, so the guide-link handler and
the wiki search index never see it.

### The `<head>` block

[scripts/consent-defaults.txt](scripts/consent-defaults.txt) is copied into every page that loads the AdSense tag or
`tracking.js`, directly before the AdSense tag, by `node scripts/apply-consent-defaults.mjs` (live pages and payloads in
`.drip/queue`; it replaces the block between its markers, so it is the way to change it). A page that loads `tracking.js`
without the AdSense tag gets the tag too. `tests/analytics.test.cjs` fails when a page has no current copy, has it after
the tag or `tracking.js`, or loads `tracking.js` without the tag. The block:

1. sets `default` = `denied` for the 32 regions of the EEA (27 EU countries, Iceland, Liechtenstein, Norway), the UK and
   Switzerland;
2. sets `default` for everyone else from `cube_cookie_consent`: `accepted` → `granted`, anything else → `denied`;
3. after a stored `declined`, sets `adsbygoogle.requestNonPersonalizedAds = 1`
   ([AdSense 9042142](https://support.google.com/adsense/answer/9042142)), because AdSense does not read Consent Mode;
   it applies from the next page load after the choice;
4. sets `window.cubeConsentDefaults`. Without it (a page that lacks the block), `tracking.js` sets the old global default itself.

`wait_for_update` is 500 ms. gtag resolves `region` itself, so the page never needs to know where the visitor is for the
defaults; only the banner needs the CMP's answer.

### Why the site keeps its own EEA default although Google's CMP updates Consent Mode

Question (2026-10-24): with the AdSense consent mode settings on, does Google's CMP send `gtag('consent', 'default')` itself,
so that ours duplicates or conflicts with it? Google does not say. [AdSense 16088460](https://support.google.com/adsense/answer/16088460)
and [16053245](https://support.google.com/adsense/answer/16053245) only say that the CMP "interprets" EEA, UK and Swiss
choices for consent mode; the [consent mode guide](https://developers.google.com/tag-platform/security/guides/consent)
says that no values are set by default, that the default must come before any tag reads it, and that it must not be set
asynchronously. The CMP loader for this account could not be inspected either: until a message is published it only
reports `googlefcInactive`.

What gtag does with two commands was measured instead (headless Chrome 155, test property `G-TEST000000`, the second
command 1.5 s after `config`, one probe event before and one after):

| First | Then | Event after | Meaning |
| --- | --- | --- | --- |
| `default` denied | nothing | `G100`, `gcd` `13p3p3p3p5l1` | baseline |
| `default` denied | a second `default` granted | `G111`, `gcd` `…t…` | a later default replaces an earlier one |
| `default` denied, `update` granted | a `default` denied | `G111`, `gcd` `…r…` | a default never overrides an update |
| `default` denied for the EEA list, `default` granted for the rest | nothing | `G111` from this machine | `region` is resolved by gtag; the test machine is outside the list |

Decision: keep the site's EEA default.

- Until the CMP arrives (`adsbygoogle.js` is async, and the CMP loads after it, while GA4 may already send `page_view`),
  ours is the only default. Without it, EEA hits would go out with no consent state, that is with cookies.
- If the CMP sends a `default` later, it replaces ours (row 2). Before a choice it can only be `denied`, or the stored
  choice of a returning visitor; both are what the page should use. No conflict.
- If the CMP only sends updates, ours is the default it updates (row 3 shows the update wins).
- In `site` mode `tracking.js` sends an update rather than relying on the default, so no later `default` from any script
  can override the banner's answer (row 3).

Once the message is published, a visit from the EEA can confirm it: `page_view` should carry `gcd` with `p` (our default,
denied) and the hits after a consent `r`.

### Reading `gcs` and `gcd`

`gcs` is `G1` + `ad_storage` + `analytics_storage` (`1` granted, `0` denied): `G100`, `G111`, `G110`, `G101`. In `gcd` the
letters after each `3` are `ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization`; seen here: `p` default
denied, `q` default denied and update denied, `t` default granted, `r` default denied then update granted, `l` not set.

### Browser check, 2026-10-24

`http://127.0.0.1:8765` with `?analytics_test=1`, headless Chrome 155. Requests to AdSense, Funding Choices and DoubleClick
were blocked so no ad request for the publisher ID left the machine; Google's CMP was a stub that loads 800 ms after
`DOMContentLoaded` and on a choice sends the update the real one would.

| Scenario | Pages | Result |
| --- | --- | --- |
| No CMP (ad blocker, message not published) | `/`, `/ru/recipe-generator/`, `/fr/wiki-recipe-generator/`, `/de/tools/` | banner in the page language after the 5 s wait; `page_view` `G100` `p`; Accept → `G111` `r`, `cookie_consent_update` `site/accepted`; next page `G111` `t`; Decline (de) → `G100` `q`, next page `requestNonPersonalizedAds = 1`; "Cookie settings" reopens the banner and focuses Accept |
| CMP, `gdprApplies: true`, old `declined` stored | `/fr/recipe-generator/` | no site banner; old answer deleted; "Cookie settings" calls `showRevocationMessage`; CMP update → `G111`, `cookie_consent_update` `cmp/accepted`; next page no non-personalised flag |
| CMP, `gdprApplies: false` | `/de/recipe-generator/` | site banner after 1.4 s, without the timeout |

No page errors on any page. Banner and footer looked right in both designs (`modern`, `classic`) at 360, 768 and 1440 px in
`ru` and `de`; the privacy pages have no horizontal scroll at 360 px. The real Google message only shows on
`cubeinsquare.com` once the owner publishes it; it was not seen here.

### Performance

- The `<head>` block is inline (no request) and runs in well under a millisecond. Google's CMP comes through the
  `adsbygoogle.js` the pages already loaded, so no script was added.
- Banner clicks remove the banner first and run the consent update and the event in `deferWork` (INP).
- The banner and Google's message are fixed overlays (no layout shift). On phones in the EEA, Google's dialog can become the
  LCP element, since it is a large block of text painted late. Watch LCP for `fr`/`de` in PageSpeed Insights or CrUX about 28
  days after the message is live; a `preconnect` to `fundingchoicesmessages.google.com` is the first thing to try if it got worse.

## Custom dimensions in GA4

**Done on 2026-10-24** (property `533247043`, via the Admin API): all 10 dimensions below plus `page_type` and
`page_language` exist, `tool_copy` and `tool_download` are key events, and event data retention is 14 months. Do not
ask the owner to create them again. A new event parameter that should appear in reports still needs its own dimension.

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
- Google's consent message picks its language from the visitor's device, not from the page: a visitor on `/fr/` with an
  English browser sees it in English.
- An EEA visitor whose CMP answers only after the 5 s fallback gets the site's update first (their old banner answer, or
  `denied`); it stays until the CMP sends its own update.
- Whether Google's CMP answers `gdprApplies: false` quickly outside the EEA is not verified yet (the message is not
  published). If it does not, visitors there see the site's banner after the 5 s wait.
- The custom-item catalog's JSON import and the basic/advanced switch of the enchantment randomizer have no event.
