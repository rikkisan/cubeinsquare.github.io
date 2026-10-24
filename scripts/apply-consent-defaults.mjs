#!/usr/bin/env node
//
// Copies the Consent Mode defaults block (scripts/consent-defaults.txt) into the <head> of every
// page that loads the AdSense tag or assets/tracking.js, right before the AdSense tag:
//
//   node scripts/apply-consent-defaults.mjs           # write the pages
//   node scripts/apply-consent-defaults.mjs --check   # list pages that would change, exit 1 if any
//
// Covers the live pages (dot-directories skipped, as in check-links.mjs) and the payloads queued in
// .drip/queue. A page that already has the block gets it replaced between its markers, so the script
// is safe to run again after editing consent-defaults.txt. A page that loads tracking.js without the
// AdSense tag gets the tag too (and the AdSense account meta), placed before /assets/styles.css,
// because Google's consent message only loads where the tag is.
// Files keep their byte order mark and line endings. Background: ANALYTICS.md, "Consent".

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const check = process.argv.includes('--check');

const ADSENSE_SRC = 'pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
const ADSENSE_TAG = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6745837623494230" crossorigin="anonymous"></script>';
const ADSENSE_META = '<meta name="google-adsense-account" content="ca-pub-6745837623494230">';
const STYLESHEET = '<link rel="stylesheet" href="/assets/styles.css">';
const START = '<!-- consent-defaults';
const END = '<!-- /consent-defaults -->';

const block = readFileSync(join(root, 'scripts', 'consent-defaults.txt'), 'utf8').replace(/\r\n/g, '\n').replace(/\n+$/, '');

function collect(dir, out) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
        const full = join(dir, entry.name);
        if (entry.isDirectory()) collect(full, out);
        else if (entry.name.endsWith('.html')) out.push(full);
    }
    return out;
}

const files = collect(root, []);
const queue = join(root, '.drip', 'queue');
if (existsSync(queue)) {
    for (const bundle of readdirSync(queue, { withFileTypes: true })) {
        const payload = join(queue, bundle.name, 'payload');
        if (bundle.isDirectory() && existsSync(payload)) collect(payload, files);
    }
}

/** The page with the block in place, or null when the page needs none. Throws when it cannot be placed. */
function withBlock(html, eol) {
    const lines = html.split(eol);
    const startLine = lines.findIndex((line) => line.trim().startsWith(START));
    const ownBlock = block.split('\n');

    if (startLine >= 0) {
        const endLine = lines.findIndex((line, index) => index > startLine && line.trim() === END);
        if (endLine < 0) throw new Error('consent-defaults start marker without an end marker');
        lines.splice(startLine, endLine - startLine + 1, ...ownBlock);
        return lines.join(eol);
    }

    const head = lines.findIndex((line) => /<\/head>/i.test(line));
    const inHead = (index) => index >= 0 && (head < 0 || index < head);
    const tag = lines.findIndex((line) => line.includes(ADSENSE_SRC));
    if (inHead(tag)) {
        lines.splice(tag, 0, ...ownBlock);
        return lines.join(eol);
    }
    if (tag >= 0) throw new Error('the AdSense tag is not inside <head>');
    if (!html.includes('/assets/tracking.js')) return null;

    const stylesheet = lines.findIndex((line) => line.trim() === STYLESHEET);
    if (!inHead(stylesheet)) throw new Error(`loads tracking.js without the AdSense tag and has no ${STYLESHEET} in <head>`);
    const indent = lines[stylesheet].match(/^\s*/)[0];
    const added = html.includes('name="google-adsense-account"') ? [] : [indent + ADSENSE_META];
    lines.splice(stylesheet, 0, ...added, ...ownBlock, indent + ADSENSE_TAG);
    return lines.join(eol);
}

const changed = [];
const failed = [];
for (const file of files) {
    const html = readFileSync(file, 'utf8');
    if (!html.includes(ADSENSE_SRC) && !html.includes('/assets/tracking.js') && !html.includes(START)) continue;
    const eol = html.includes('\r\n') ? '\r\n' : '\n';
    const name = relative(root, file).split(sep).join('/');
    let next;
    try {
        next = withBlock(html, eol);
    } catch (error) {
        failed.push(`${name}: ${error.message}`);
        continue;
    }
    if (next === null || next === html) continue;
    changed.push(name);
    if (!check) writeFileSync(file, next, 'utf8');
}

for (const line of failed) console.error(`apply-consent-defaults: ${line}`);
for (const name of changed) console.log(`${check ? 'would update' : 'updated'} ${name}`);
console.log(`${changed.length} page(s) ${check ? 'out of date' : 'updated'}, ${failed.length} failed`);
process.exit(failed.length || (check && changed.length) ? 1 : 0);
