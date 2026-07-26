# Texture painter status

This file tracks which texture-painter changes are already live and which are still outstanding.

Last verified against `origin/main` on 2026-07-26 by diffing `assets/texture-painter.js`,
`assets/texture-painter.css`, `texture-painter/index.html`, and `assets/app.js` and checking
`git merge-base --is-ancestor <commit> origin/main` for the relevant commits.

## Already live

- Palette extraction from an uploaded image (`assets/texture-painter.js`, `PALETTE_TEXT` / `extractPaletteFromSource`).
- Export file name field for texture PNGs (`assets/texture-painter.js`, `FILE_NAME_TEXT`).
- Block template turned into a cube side sheet (`ed05de6`, live).
- Picker flow and shortcut polish (`0ba534a`, live).
- Right-click panning for the canvas (`00290c4`, live — see `startPan`/`updatePan`/`stopPan` in `assets/texture-painter.js`).
- Undo/redo that snapshots and restores bitmap state and preserves the stage scroll position instead of jumping the viewport (`00290c4`, live — see `restoreSnapshot`).

## Outstanding (not on main, not in the working tree)

These only exist in an old stash (`git stash list` → `stash@{1}`, "On main: autostash", based on a
commit from 2026-05-15 that predates a history rewrite and is no longer an ancestor of `origin/main`).
The working tree is otherwise clean — there is no uncommitted local work sitting ready to publish.
To revive these, the stash diff needs to be pulled out and reapplied by hand against the current
files, then tested, since ~2 months of unrelated changes have landed on top of the old base.

- Wider texture painter page shell (`.page-shell[data-texture-painter] { width: min(96vw, 1520px); }`).
- Narrower left tool panel (stash changes `.texture-layout` from `minmax(280px, 340px)` to `minmax(260px, 300px)`; current main is still `minmax(280px, 340px)`).
- More horizontal room for the canvas (follows from the two items above).
- Canvas centering wrapper for small canvases (stash adds a `.texture-stage-inner` grid wrapper with `place-items: center` and drops `margin: 0 auto` from `#textureEditorCanvas`; current main still centers the canvas directly via `margin: 0 auto` with no wrapper).
- Static 3D preview behavior in the resource-pack preview modal (stash removes the continuous rotation/bounce loop in `assets/app.js`; current main's `animate()` still runs `preCurrentObj.rotation.y += ...` and the sine-wave bounce every frame).

## Before publishing the outstanding changes

- Recover the relevant hunks from `stash@{1}` and reapply them against current `assets/texture-painter.css`, `texture-painter/index.html` (+ `ru`/`fr`/`de` variants), and `assets/app.js`.
- Test `16x16`, `32x32`, `64x64`, and `128x128` canvases with the new layout.
- Test right-click panning horizontally and vertically at high zoom (already live, but re-check after the layout change).
- Test drawing, eyedropper, undo, redo, and `Ctrl+Z`.
- Test block template export and confirm guide overlays are not exported.
- Test EN / RU / FR / DE texture painter pages.
- Confirm the resource-pack preview modal stays static outside of explicit camera-view changes.
- Decide whether to publish during AdSense review or keep it queued until after the review result.

## Related files

- `assets/texture-painter.js`
- `assets/texture-painter.css`
- `texture-painter/index.html`
- `ru/texture-painter/index.html`
- `fr/texture-painter/index.html`
- `de/texture-painter/index.html`
- `assets/app.js`
