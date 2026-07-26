How to prepare one queued site release
=====================================

1. Copy this whole folder into `.drip/queue/` and rename it with the date it
   should go live, for example `2026-08-02-new-wiki-article`.

   That date is a **release date, not a sort key** — the publisher skips the
   bundle until the date arrives.

2. Put every file that should go live in `payload/`, mirroring the real site
   paths exactly:

       payload/
         wiki-new-article/index.html
         ru/wiki-new-article/index.html
         fr/wiki-new-article/index.html
         de/wiki-new-article/index.html
         wiki/index.html            <- hub page, if it needs a new link
         ru/wiki/index.html

3. Set the commit subject in `COMMIT_TITLE.txt`, and optionally a longer
   message in `COMMIT_BODY.txt`.

4. To remove files, list them one per line in `DELETE.txt`.

5. To stop this bundle from publishing without deleting it, drop a `HOLD`
   file in the folder; the first line is shown as the reason.

NEVER put these in payload/
---------------------------

    assets/site.js
    sitemap.xml

Validation will reject the bundle. These are shared files: bundles used to
carry their own copies, and when several were prepared in parallel the last
one published silently erased the others' menu entries and sitemap URLs.

- The sitemap is regenerated automatically on every publish — do nothing.
- A new tool's menu entry goes in `TOOL_META.js` (see DRIP_PUBLISHING.md),
  which is spliced into the live file instead of replacing it.

Remember that `/tools/` is a static page: a new tool also needs a
`resource-card` added to `tools/index.html` and its ru/fr/de copies, and those
belong in `payload/`.

Check before you ship
---------------------

    bash .github/scripts/drip-validate.sh .drip/queue/<your-folder>

Or run the whole thing without publishing — GitHub → Actions → Drip Publish →
Run workflow → tick "dry run".

How publishing works
--------------------

Every Sunday, GitHub Actions takes the oldest bundle whose date has arrived,
validates it, copies `payload/` over the site, merges any `TOOL_META.js` into
the menu, regenerates `sitemap.xml`, logs the release in `PUBLISHED.md`,
removes the queue folder, then commits and pushes to `main`.

A bundle that fails validation is left in the queue and retried next run.
