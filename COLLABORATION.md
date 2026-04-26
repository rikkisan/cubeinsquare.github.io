# Collaboration Notes for Cube in Square

This file is the shared working agreement for multiple Codex sessions or multiple people editing the site in parallel.

The project is small, but it has a few global files and a drip queue. That means two people can accidentally overwrite each other even when they are working on different ideas.

## 1. First rule before every session

Before anyone starts editing:

1. pull the latest `main`
2. check `git status`
3. check the latest commits
4. check `.drip/queue/`

Minimum checklist:

```powershell
git pull --rebase origin main
git status --short
git log --oneline -5
Get-ChildItem .drip\queue
```

If the repo is not clean or a queued release already contains the same page you want to edit, stop and realign first.

## 2. Main collision zones

These files are touched by many features and should be treated as shared infrastructure:

- `assets/styles.css`
- `assets/site.js`
- `assets/tracking.js`
- `404.html`
- `index.html`
- `ru/index.html`
- `fr/index.html`
- `de/index.html`
- `wiki/index.html`
- `ru/wiki/index.html`
- `fr/wiki/index.html`
- `de/wiki/index.html`
- `sitemap.xml`

If someone is changing one of these, assume it can affect the whole site.

## 3. Themes and visual refreshes

Theme work is the easiest place to drift from planned content releases.

Best rule:

- put theme changes into shared CSS and shared layout logic whenever possible
- avoid hardcoding one-off colors inside individual article pages
- after a theme pass, review the queued payloads in `.drip/queue/` to make sure future releases will not reintroduce old styles

Important:

The queued releases already scheduled are:

- `2026-05-03-resource-pack-migration-1-21-4`
- `2026-05-10-smart-potion-contents-1-21-4`
- `2026-05-17-string-ids-custom-model-data`
- `2026-05-24-rp-progression-systems`
- `2026-05-31-data-components-architecture`

If someone changes:

- homepage structure
- wiki layout
- article layout
- buttons
- colors
- typography

they should also inspect those queued payloads and update them if the queued pages contain old markup or old copy.

Otherwise the Sunday drip release can visually roll part of the site backward.

## 4. Best way to split work

Try to avoid two people changing the same layer at the same time.

Good split:

- Person A: theme, layout, shared styles
- Person B: article writing, wiki content, drip payloads

or:

- Person A: tool logic
- Person B: content and navigation

Bad split:

- both people editing `assets/styles.css`
- both people editing `wiki/index.html`
- both people editing the same tool page

## 5. When a new tool or article is added

A complete change usually touches more than one file.

### New tool usually means:

- tool page
- shared nav / tool links
- wiki guide
- wiki hub
- localized links if available
- `sitemap.xml`

### New article usually means:

- article page
- wiki hub
- localized versions or explicit decision to leave them for later
- `sitemap.xml`
- optional drip payload update if article is scheduled instead of live

## 6. Working with the drip queue

The drip queue is not just a content backlog. It is also a future snapshot of files.

That means:

- a queued payload can overwrite live files later
- a theme or nav change made today might disappear next Sunday if a queued payload still contains the older version of that file

Before merging a big shared change, check whether a queued payload includes:

- `wiki/index.html`
- `ru/wiki/index.html`
- `fr/wiki/index.html`
- `de/wiki/index.html`
- `index.html`
- `ru/index.html`
- `fr/index.html`
- `de/index.html`
- `sitemap.xml`
- shared article pages

If yes, update the queued copy too.

## 7. Safe commit style

Prefer clear small commits with scope in the message.

Good examples:

- `Add wiki guide for DarkMage plugin`
- `Refine texture painter zoom controls`
- `Translate homepage into FR and DE`
- `Update queued articles after theme refresh`

Avoid giant mystery commits like:

- `fix stuff`
- `updates`

## 8. If both people work at the same time

Use a soft ownership message in chat or Discord before editing:

- `I am taking theme + shared CSS`
- `I am taking the next wiki article`
- `I am touching the villager tool and its guide`

If someone already claimed a shared file, wait or split the task.

## 9. What Codex should do every time

When a Codex session starts, it should:

1. read the latest repo state
2. check whether the working tree is clean
3. inspect the latest queued releases
4. avoid editing shared files blindly
5. mention if a planned change can conflict with queued Sunday releases

In practice, this means theme work should always be checked against `.drip/queue/`, and content work should always be checked against shared nav and wiki hub files.

## 10. Current project priorities

Right now the main tracks are:

- keep localized pages stable and UTF-8 clean
- expand useful long-form wiki content
- keep tools usable and polished
- avoid regressions from queued releases
- strengthen trust and content quality for AdSense

So if a change is flashy but risks breaking:

- localizations
- queued articles
- wiki navigation
- homepage structure

it should be done carefully and with a repo-wide check afterward.

## 11. Practical advice about themes

Yes, themes are a valid idea.

But if someone wants to add themes now:

- make the theme system global, not page-by-page
- avoid duplicating palette logic inside many individual files
- keep article text colors, link colors, and card contrast readable in every theme
- review queued article payloads after the theme system lands

Theme work is fine. It just has to be done as infrastructure, not as isolated decoration.
