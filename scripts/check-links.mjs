#!/usr/bin/env node
//
// Static checks for the built site. No dependencies; run from anywhere:
//
//   node scripts/check-links.mjs            # check the repository this script lives in
//   node scripts/check-links.mjs <dir>      # check another site root (used for testing)
//
// What it verifies, over every .html file (dot-directories such as .git, .drip
// and .claude/worktrees are skipped, same as generate-sitemap.sh):
//
//   1. every href="/..." points at a file that exists
//   2. every <link hreflang> points at a page of this site that exists
//   3. every indexable page has a <title>, a meta description and a canonical
//      link, and the canonical points at a page that exists. Indexable means
//      neither marked robots noindex nor disallowed in robots.txt (the legacy
//      universal_generator.html is only the latter)
//
// Resolution follows what GitHub Pages serves: "/x/" is x/index.html, "/x.html"
// is that file, and "/x" is x.html or x/index.html (Pages redirects to "/x/").
// Lookups go through a set of real file names rather than fs.existsSync, so a
// link with the wrong case fails here even on a case-insensitive Windows or
// macOS checkout, exactly as it would 404 on Pages.
//
// Exit: 0 = clean, 1 = problems found, 2 = bad usage.

import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// Keep in sync with BASE_URL in generate-sitemap.sh.
const SITE_HOST = 'cubeinsquare.com';

const root = process.argv[2]
    ? resolve(process.argv[2])
    : resolve(fileURLToPath(new URL('..', import.meta.url)));

// --- inventory -------------------------------------------------------------

const files = new Set();   // every file, as a site-relative posix path
const pages = [];          // the .html subset

(function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
            walk(full);
            continue;
        }
        const rel = relative(root, full).split(sep).join('/');
        files.add(rel);
        if (rel.endsWith('.html')) pages.push(rel);
    }
})(root);

if (!files.has('index.html')) {
    console.error(`check-links: ${root} has no index.html; is this a site root?`);
    process.exit(2);
}

// --- parsing ---------------------------------------------------------------

// Comments, scripts and styles can hold markup-looking strings (templates that
// build links at runtime); none of that is a link on the page.
function stripNonMarkup(html) {
    return html
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<script\b[\s\S]*?<\/script\s*>/gi, '')
        .replace(/<style\b[\s\S]*?<\/style\s*>/gi, '');
}

function decodeEntities(value) {
    return value
        .replace(/&quot;/g, '"')
        .replace(/&#39;|&apos;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
}

// A tag is its name followed by quoted strings or anything that is not a
// quote or '>'; the alternatives start with different characters, so the
// match cannot backtrack catastrophically.
const TAG = /<([a-zA-Z][^\s/>]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
const ATTR = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

function* tagsOf(html) {
    for (const [, name, rawAttrs] of html.matchAll(TAG)) {
        const attrs = new Map();
        for (const [, key, dq, sq, bare] of rawAttrs.matchAll(ATTR)) {
            const k = key.toLowerCase();
            if (!attrs.has(k)) attrs.set(k, decodeEntities(dq ?? sq ?? bare ?? ''));
        }
        yield { name: name.toLowerCase(), attrs };
    }
}

// --- resolution ------------------------------------------------------------

// Returns the matching file, or null plus what was looked for.
function resolvePath(pathname) {
    let decoded;
    try {
        decoded = decodeURIComponent(pathname);
    } catch {
        return { file: null, looked: ['(malformed percent-encoding)'] };
    }
    if (decoded.split('/').includes('..')) {
        return { file: null, looked: ['(path contains "..")'] };
    }

    const rel = decoded.replace(/^\/+/, '');
    const candidates = decoded.endsWith('/')
        ? [`${rel}index.html`]
        : [rel, `${rel}.html`, `${rel}/index.html`];

    const file = candidates.find((c) => files.has(c)) ?? null;
    return { file, looked: candidates };
}

// An absolute URL is acceptable only when it stays on this site.
function resolveOnSite(href) {
    let url;
    try {
        url = new URL(href, `https://${SITE_HOST}/`);
    } catch {
        return { problem: 'is not a valid URL' };
    }
    if (url.host !== SITE_HOST) return { problem: `points off-site (${url.host})` };
    const { file, looked } = resolvePath(url.pathname);
    return file ? { file } : { problem: `has no matching file (looked for ${looked.join(', ')})` };
}

// --- checks ----------------------------------------------------------------

const problems = [];
const seen = new Set();
let hrefCount = 0;
let hreflangCount = 0;
let indexable = 0;

function report(page, message) {
    const key = `${page}\0${message}`;
    if (seen.has(key)) return;   // the same broken link repeated in one page is one problem
    seen.add(key);
    problems.push({ page, message });
}

function isNoindex(metas) {
    return metas.some((attrs) => {
        const name = (attrs.get('name') ?? '').toLowerCase();
        if (name !== 'robots') return false;
        const tokens = (attrs.get('content') ?? '').toLowerCase().split(',').map((t) => t.trim());
        return tokens.includes('noindex') || tokens.includes('none');
    });
}

// Literal Disallow prefixes that apply to every crawler. Wildcard rules are
// ignored; this site's robots.txt does not use them.
function robotsDisallowed() {
    if (!files.has('robots.txt')) return [];
    const text = readFileSync(join(root, 'robots.txt'), 'utf8').replace(/^﻿/, '');
    const prefixes = [];
    let applies = false;
    let afterAgent = false;
    for (const raw of text.split(/\r?\n/)) {
        const m = /^([a-z-]+)\s*:\s*(.*)$/i.exec(raw.replace(/#.*/, '').trim());
        if (!m) continue;
        const field = m[1].toLowerCase();
        if (field === 'user-agent') {
            // consecutive User-agent lines share one group of rules
            applies = (afterAgent && applies) || m[2] === '*';
            afterAgent = true;
            continue;
        }
        afterAgent = false;
        if (field === 'disallow' && applies && m[2] && !/[*$]/.test(m[2])) prefixes.push(m[2]);
    }
    return prefixes;
}

const disallowed = robotsDisallowed();

function isDisallowed(page) {
    const paths = ['/' + page];
    if (page.endsWith('/index.html')) paths.push('/' + page.slice(0, -'index.html'.length));
    return disallowed.some((prefix) => paths.some((p) => p.startsWith(prefix)));
}

for (const page of pages) {
    const html = stripNonMarkup(readFileSync(join(root, page), 'utf8'));
    const metas = [];
    let canonical = null;

    for (const { name, attrs } of tagsOf(html)) {
        const href = attrs.get('href');

        if (name === 'meta') metas.push(attrs);

        if (name === 'link') {
            const rel = (attrs.get('rel') ?? '').toLowerCase().split(/\s+/);
            if (rel.includes('canonical')) canonical = href ?? '';
        }

        // 1. root-relative links ("//host/x" is protocol-relative, not ours)
        if (href !== undefined && href.startsWith('/') && !href.startsWith('//')) {
            hrefCount++;
            const { file, looked } = resolvePath(href.split('#')[0].split('?')[0]);
            if (!file) report(page, `href="${href}" has no matching file (looked for ${looked.join(', ')})`);
        }

        // 2. hreflang alternates
        if (name === 'link' && attrs.has('hreflang')) {
            hreflangCount++;
            const lang = attrs.get('hreflang');
            if (!href) {
                report(page, `hreflang="${lang}" has no href`);
            } else {
                const { problem } = resolveOnSite(href);
                if (problem) report(page, `hreflang="${lang}" href="${href}" ${problem}`);
            }
        }
    }

    // 3. head essentials, for pages Google is allowed to index
    if (isNoindex(metas) || isDisallowed(page)) continue;
    indexable++;

    const title = /<title\b[^>]*>([\s\S]*?)<\/title\s*>/i.exec(html);
    if (!title || !decodeEntities(title[1]).trim()) report(page, 'has no <title>');

    const description = metas.find((a) => (a.get('name') ?? '').toLowerCase() === 'description');
    if (!description || !(description.get('content') ?? '').trim()) report(page, 'has no meta description');

    if (canonical === null) {
        report(page, 'has no canonical link');
    } else if (!canonical.trim()) {
        report(page, 'has a canonical link with an empty href');
    } else {
        const { problem } = resolveOnSite(canonical);
        if (problem) report(page, `canonical href="${canonical}" ${problem}`);
    }
}

// --- verdict ---------------------------------------------------------------

console.log(
    `check-links: ${pages.length} HTML files, ${hrefCount} root-relative hrefs, ` +
    `${hreflangCount} hreflang links, ${indexable} indexable pages`
);

if (problems.length === 0) {
    console.log('check-links: OK');
    process.exit(0);
}

problems.sort((a, b) => a.page.localeCompare(b.page) || a.message.localeCompare(b.message));
console.error(`\ncheck-links: ${problems.length} problem(s)\n`);
for (const { page, message } of problems) console.error(`  ${page}: ${message}`);
process.exit(1);
