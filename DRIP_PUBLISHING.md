# Drip Publishing for GitHub Pages

This project can publish one pre-made site update at a time on a schedule.

## What it does

- runs every week through GitHub Actions
- takes the first queued release from `.drip/queue/`
- copies its `payload/` files into the site
- optionally deletes listed files
- commits the change to `main`
- pushes it, so GitHub Pages rebuilds automatically

There is also a manual `workflow_dispatch` trigger in case you want to publish the next queued update immediately.

## Queue format

Each release is one folder inside:

`.drip/queue/`

Each release folder must contain:

- `payload/` - files to publish, mirrored to the real site structure
- `COMMIT_TITLE.txt` - commit subject

Optional:

- `COMMIT_BODY.txt` - commit body
- `DELETE.txt` - files or folders to remove, one path per line

## Example

`.drip/queue/2026-04-23-new-wiki-article/`

with:

`.drip/queue/2026-04-23-new-wiki-article/payload/wiki-new-article.html`

means that the queued release will publish:

`/wiki-new-article.html`

If you also include:

- `payload/wiki.html`
- `payload/ru/wiki.html`
- `payload/fr/wiki.html`
- `payload/de/wiki.html`

then the release updates the new page and the hub pages in one weekly drop.

## Important note

Queue folders are processed alphabetically. Use sortable names like:

- `2026-04-23-new-page`
- `2026-04-30-new-guide`
- `2026-05-07-tool-refresh`

## Workflow file

The automation lives in:

- `.github/workflows/drip-publish.yml`
- `.github/scripts/drip-publish.sh`

## Template

To prepare the next release, copy:

`.drip/template-release/`

into:

`.drip/queue/`

rename it, and fill the payload.
