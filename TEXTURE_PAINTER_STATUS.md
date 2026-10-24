# Texture painter status

This file tracks which texture-painter changes are already live and which are still outstanding.

Last updated on 2026-10-24, after the follow-up to `8d2ec7a`: the page-shell width rule is now desktop-only and the hidden
file inputs no longer cause horizontal scrolling (see "Phone layout and hidden file inputs" and "Verification" below).
Before that, the remaining `stash@{1}` layout/preview hunks had been ported by hand onto current `main`.

## Already live

- Palette extraction from an uploaded image (`assets/texture-painter.js`, `PALETTE_TEXT` / `extractPaletteFromSource`).
- Export file name field for texture PNGs (`assets/texture-painter.js`, `FILE_NAME_TEXT`).
- Block template turned into a cube side sheet (`ed05de6`, live).
- Picker flow and shortcut polish (`0ba534a`, live).
- Right-click panning for the canvas (`00290c4`, live — see `startPan`/`updatePan`/`stopPan` in `assets/texture-painter.js`).
- Undo/redo that snapshots and restores bitmap state and preserves the stage scroll position instead of jumping the viewport (`00290c4`, live — see `restoreSnapshot`).
- Wider texture painter page shell, desktop only: `.page-shell[data-texture-painter] { width: min(96vw, 1520px); }` inside
  `@media (min-width: 981px)` in `assets/texture-painter.css`. 980px is the width where `.texture-layout` already collapses to
  one column, so up to and including 980px the page uses the standard `.page-shell` (`width: 90%`, `max-width: 980px`),
  which gives the same side margins as every other tool (20px at 390px, 38px at 768px).
- Narrower left tool panel (`.texture-layout` is now `minmax(260px, 300px) minmax(0, 1fr)` with a 22px gap).
- More horizontal room for the canvas (follows from the two items above; the stage is ~1160px wide at a 1600px viewport).
- Canvas centering wrapper for small canvases (`.texture-stage-inner` grid wrapper with `place-items: center` in all four
  `texture-painter/index.html` locales; `#textureEditorCanvas` no longer uses `margin: 0 auto`).
- Stage stays bounded when the canvas is wider than it (`.texture-sidebar, .texture-workspace` get
  `grid-template-columns: minmax(0, 1fr)`). Before this, a canvas wider than the stage (e.g. 64x64 at 18x, 128x128 at 32x)
  stretched the implicit grid track instead of scrolling, so horizontal right-click panning did nothing. Not part of the
  stash; found while re-checking panning after the layout change.
- Static 3D preview in the resource-pack preview modal (`assets/app.js`): `animate()` only updates controls and renders;
  the item pose for first-person / front view is set once in `setCameraView()` instead of every frame. No continuous
  rotation or bounce.

`stash@{1}` has been left in place (not applied, not dropped). Everything in it that relates to the texture painter is now
on `main`; the rest of that stash is old `future-tool-bundles` payload churn.

## Phone layout and hidden file inputs

Two problems were left after `8d2ec7a`; both are fixed.

- **Side margins on phones.** The wide shell rule applied at every width and cut the side margins at 390px from 20px to 8px.
  It is now wrapped in `@media (min-width: 981px)`.
- **Horizontal page scroll.** Not a 390px-only problem: the page scrolled sideways at every width (+26px at 390, +33 at 768,
  +44 at 1280, +58 at 1600) and the same happened on the skin editor, where it was far worse (the document was 2172px wide in a
  1280px window). Cause: the palette file input is injected inside a `.tool-field`, and `.tool-field input { width: 100%;
  padding: 11px 12px; border: 1px solid ... }` in `assets/styles.css` (specificity 0,1,1) beats the clipped 1px box in
  `.texture-hidden-input` / `.skin-hidden-input` (0,1,0). With no positioned ancestor, "100%" is the viewport width, so the
  invisible input was a full-width box that started a few dozen pixels in from the left edge. Fix: both classes are now just
  `display: none`, so no other rule can give them a size. The inputs are still opened with `input.click()` from the visible
  buttons (`#texturePaletteUploadButton`, `#textureUploadButton`, and the skin editor equivalents), which works on a
  `display: none` file input and also takes the invisible input out of the Tab order.
- `?v=` on `texture-painter.css` and `skin-editor.css` was bumped to `20261024` in all four locales of both pages so that
  returning visitors do not keep the old CSS. (`8d2ec7a` changed the CSS without bumping it.)
- Not affected, no change needed: `resource-pack-generator` upload zones (their inputs are already `display: none` in
  `.upload-zone input[type="file"]`; the `9f89108` zones stay focusable with `role="button"`) and `custom-item-catalog`
  (`hidden` import input). Neither page has horizontal scroll.

## Outstanding

- Nothing from `stash@{1}` for the texture painter.
- Nothing known for the phone layout. Note for the skin editor at 390px: `#skinEditorCanvas` is wider than the window (right
  edge at 552px) but sits in its own scrollable container, so the page itself does not scroll.

## Verification (2026-10-24, local `python -m http.server`, headless Chrome via playwright-core)

- `16x16`, `32x32`, `64x64` canvases at their default zoom are centered in the stage; `128x128` at 6x is centered
  horizontally and scrolls vertically; 16x16 at 6x is centered.
- 64x64 at 18x and 128x128 at 32x keep the stage at its normal width and scroll in both directions.
- Right-click drag pans both horizontally and vertically by exactly the drag distance at 128x128 / 32x and does not paint.
- Brush, picker (picks the colour and returns to brush), Undo/Redo buttons (both sets), `Ctrl+Z`, `Ctrl+Shift+Z`, `Ctrl+Y`.
- Undo at 128x128 / 32x keeps the scroll position.
- Block template switches to 64x64; exported PNG contains only the painted pixels (no guide overlay).
- EN / RU / FR / DE pages: wrapper present, 1520px shell, 300px sidebar, painting + `Ctrl+Z`, no page errors.
- Resource-pack preview modal (blocks and items): frames identical over 1.2s; switching to first-person changes the view
  and stays static; switching back restores the initial front pose.

### Verification of the phone-layout follow-up (2026-10-24, same setup)

- Page scroll width equals the window width for texture painter and skin editor in EN / RU / FR / DE at 390, 768, 1280 and
  1600px. Texture painter additionally at 320, 360, 700, 980, 981 and 1024px, in dark and light theme.
- Texture painter shell: left margin 20px at 390px, 38px at 768px; 1520px shell at 1600px with the stage at 1160px; 1229px shell
  and 869px stage at 1280px (unchanged from before).
- Palette upload in the texture painter extracts 3 swatches from a 3-stripe PNG, both by clicking `#texturePaletteUploadButton`
  and by Tab to the button plus Enter, in all four locales at 390 and 1600px. Import PNG switches the canvas to 16 x 16.
  Both hidden inputs compute to `display: none` with a 0 x 0 box.
- Skin editor: palette button and Import PNG open the file chooser by click, and the palette button also by Tab+Enter (4 locales,
  390 and 1600px).
- Resource-pack generator zones from `9f89108`: all 6 zones have `role="button"` and `tabindex="0"`; the first zone opens the
  file chooser by click, Tab+Enter and Tab+Space in all four locales at 390 and 1600px.
- 88 of 88 browser checks passed on the first attempt. Gotcha for anyone scripting this with Playwright: after
  `page.waitForEvent('filechooser')` wait a moment before a keyboard action, otherwise the key press can beat Playwright's
  asynchronous chooser interception and the event is never emitted, which looks like a broken keyboard handler.
- `node --test tests/*.test.cjs`, `node --check assets/*.js`, `node scripts/check-links.mjs`, `scripts/generate-sitemap.sh --check`
  and `git diff --check` pass.

## Related files

- `assets/texture-painter.js`
- `assets/texture-painter.css`
- `assets/skin-editor.css`
- `assets/styles.css` (read only: the `.tool-field input` rule that caused the overflow)
- `texture-painter/index.html`
- `ru/texture-painter/index.html`
- `fr/texture-painter/index.html`
- `de/texture-painter/index.html`
- `assets/app.js`
