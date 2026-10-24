# Texture painter status

This file tracks which texture-painter changes are already live and which are still outstanding.

Last updated on 2026-10-24, when the remaining `stash@{1}` layout/preview hunks were ported by hand
onto current `main` and checked in a local browser run (see "Verification" below).

## Already live

- Palette extraction from an uploaded image (`assets/texture-painter.js`, `PALETTE_TEXT` / `extractPaletteFromSource`).
- Export file name field for texture PNGs (`assets/texture-painter.js`, `FILE_NAME_TEXT`).
- Block template turned into a cube side sheet (`ed05de6`, live).
- Picker flow and shortcut polish (`0ba534a`, live).
- Right-click panning for the canvas (`00290c4`, live — see `startPan`/`updatePan`/`stopPan` in `assets/texture-painter.js`).
- Undo/redo that snapshots and restores bitmap state and preserves the stage scroll position instead of jumping the viewport (`00290c4`, live — see `restoreSnapshot`).
- Wider texture painter page shell (`.page-shell[data-texture-painter] { width: min(96vw, 1520px); }` in `assets/texture-painter.css`).
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

## Outstanding

- Nothing from `stash@{1}` for the texture painter.
- Known, pre-existing (also on the pre-change `main`): at phone width (390px) the page scrolls horizontally by ~26px because
  the hidden `#texturePaletteFileInput` (`.texture-hidden-input`, injected by `ensurePaletteExtractor`) sticks out past the
  viewport. Not fixed in this change.

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

## Related files

- `assets/texture-painter.js`
- `assets/texture-painter.css`
- `texture-painter/index.html`
- `ru/texture-painter/index.html`
- `fr/texture-painter/index.html`
- `de/texture-painter/index.html`
- `assets/app.js`
