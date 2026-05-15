# Texture painter status

This file tracks which texture-painter changes are already live and which are still local.

## Already live

- Palette extraction from an uploaded image.
- Automatic palette extraction from imported PNGs and templates.
- Export file name field for texture PNGs.
- Earlier control polish that was committed before the latest canvas layout work.

## Local only

- Wider texture painter page shell.
- Narrower left tool panel.
- More horizontal room for the canvas.
- Canvas centering wrapper for small canvases.
- Restored right-click panning for the canvas.
- Better undo/redo behavior so it targets bitmap state instead of jumping the viewport.
- Static 3D preview behavior in the resource-pack preview modal.

## Before publishing local changes

- Test `16x16`, `32x32`, `64x64`, and `128x128` canvases.
- Test right-click panning horizontally and vertically at high zoom.
- Test drawing, eyedropper, undo, redo, and `Ctrl+Z`.
- Test block template export and confirm guide overlays are not exported.
- Test EN / RU / FR / DE texture painter pages.
- Decide whether to publish during AdSense review or keep it queued until after the review result.

## Related files

- `assets/texture-painter.js`
- `assets/texture-painter.css`
- `texture-painter/index.html`
- `ru/texture-painter/index.html`
- `fr/texture-painter/index.html`
- `de/texture-painter/index.html`
- `assets/app.js`
