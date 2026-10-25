# Drafts

Material that is worth keeping but is not ready for the queue. Nothing in this folder is published or checked:

- GitHub Pages builds the site with Jekyll, which does not serve dot-directories, so nothing under `.drip/` is reachable on the site.
- `drip-publish.sh`, `drip-validate.sh`, `drip-check-base.sh` and the bundle check in `checks.yml` only look at `.drip/queue/`.
  `sitemap-refresh.yml` ignores pushes under `.drip/**`; `generate-sitemap.sh` and `check-links.mjs` skip dot-directories.

To publish a draft, start a normal bundle from `.drip/template-release/` and put the page into its `payload/`
(see [DRIP_PUBLISHING.md](../../DRIP_PUBLISHING.md) and "Add an article" in [CLAUDE.md](../../CLAUDE.md)).

## wiki-item-model-definitions/

`index.html`: "Item Model Definitions in Minecraft 1.21.4: Using minecraft:select Instead of Overrides", about 1,800 words.
English only.

- **Where it comes from.** An untracked file in `stash@{0}` ("uncommitted-state-before-switch-to-origin-main-20260726",
  stashed on 2026-07-26). The stash was taken on a local `main` based on `0d6b407` (2026-05-21), which never reached origin.
  The article was never committed anywhere before; it was saved here byte for byte (blob `187db55`) on 2026-10-24,
  before the stash was dropped.
- **Not checked for accuracy or relevance.** It shares no sentence with the live wiki, but `minecraft:select` is also
  covered by `wiki-resource-pack-migration-1-21-4/`, `wiki-item-model-builder/` and `wiki-item-model-branch-choices/`.
  Decide whether it adds enough before translating it.
- **The page chrome is from July.** Only `en` and `x-default` hreflang, a July navbar and footer, and none of the
  `<head>` changes made since. Rebuild the page around a current sibling article instead of publishing this file as is.
- **Nothing links to it.** Publishing needs a card in `wiki/index.html` (all four locales, or a written decision to keep
  it English-only), links from the related guides, and `ru/`, `fr/`, `de/` versions.
- **No `.html` redirect stub.** The address `/wiki-item-model-definitions.html` never existed, and stubs like that were
  deleted on 2026-10-24.
- **Decision (2026-10-25): not published on its own.** About 80% of it repeats
  `wiki-resource-pack-migration-1-21-4/`. What it was missing (moving numeric CustomModelData with `range_dispatch`,
  giving a prop its own definition with `item_model`, the 1.21.5 text change) was written into that article instead.
  The file stays here only as a record.

## commands-to-test.md

The list of commands added or fixed on the site during the AdSense content pass (2026-10), with the version
and the expected result, for the owner to run in game. Syntax was checked against Minecraft Wiki and the
changelogs, not in game. New and corrected commands are added here as each batch lands.
