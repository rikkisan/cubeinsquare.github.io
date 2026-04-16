How to prepare one queued site release
=====================================

1. Copy this whole folder and rename it, for example:
   `2026-04-23-new-wiki-article`

2. Move the copied folder into:
   `.drip/queue/`

3. Put every file that should go live in:
   `payload/`

4. Inside `payload/`, mirror the real site paths exactly.

Example:

    payload/
      wiki-new-article.html
      wiki.html
      sitemap.xml
      ru/
        wiki-new-article.html
        wiki.html
      fr/
        wiki-new-article.html
      de/
        wiki-new-article.html

5. Set the commit title in `COMMIT_TITLE.txt`
6. Optionally add a longer message in `COMMIT_BODY.txt`
7. If the release should delete files, list them one-per-line in `DELETE.txt`

How publishing works
--------------------

- GitHub Actions picks the first folder from `.drip/queue/` in alphabetical order.
- It copies everything from `payload/` into the repo root.
- It applies optional deletions from `DELETE.txt`.
- It removes the processed queued folder.
- It commits and pushes to `main`.

Recommended naming
------------------

Use sortable names such as:

- `2026-04-23-wiki-privacy-update`
- `2026-04-30-new-potions-article`
- `2026-05-07-new-tool-landing`

That way the queue always publishes in the order you expect.
