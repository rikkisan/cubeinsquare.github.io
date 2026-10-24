const {test} = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync,existsSync} = require('node:fs');
const {join} = require('node:path');
const root = join(__dirname, '..');
const locales = ['', 'ru', 'fr', 'de'];
const read = (...parts) => readFileSync(join(root, ...parts), 'utf8');
// A tool is live when a visitor can reach it from the catalog: either it has a
// static card in tools/index.html, or assets/site.js adds a card for it from
// the tool registry. The "soon" cards have no link and the Patreon card is
// external, so neither is matched here.
function liveToolPaths() {
    const paths = new Set();
    for (const match of read('tools/index.html').matchAll(/class="resource-link" href="(\/[^"]+\/)"/g)) paths.add(match[1]);
    const registry = [...read('assets/site.js').matchAll(/"path":\s*"(\/[^"]+\/)"/g)];
    assert(registry.length > 0, 'no tool paths found in assets/site.js');
    for (const match of registry) paths.add(match[1]);
    return paths;
}
test('every live tool has a page in all four locales', () => {
    for (const path of liveToolPaths()) {
        for (const locale of locales) {
            assert(existsSync(join(root, locale, path, 'index.html')), `${locale}${path}`);
        }
    }
});
test('static tool cards are the same in all four locales', () => {
    const expected = [...read('tools/index.html').matchAll(/class="resource-link" href="(\/[^"]+\/)"/g)].map(m => m[1]);
    for (const locale of locales.slice(1)) {
        const found = [...read(locale, 'tools/index.html').matchAll(/class="resource-link" href="\/[a-z]{2}(\/[^"]+\/)"/g)].map(m => m[1]);
        assert.deepEqual(found, expected, `${locale}/tools/index.html`);
    }
});
test('homepage "live tools" metric matches the number of live tools', () => {
    const expected = liveToolPaths().size;
    for (const locale of locales) {
        const html = read(locale, 'index.html');
        const metric = html.match(/<div class="hero-metric"><strong>(\d+)<\/strong>/);
        assert(metric, `${locale}/index.html has no hero metric`);
        assert.equal(Number(metric[1]), expected, `${locale}/index.html says ${metric[1]}, but ${expected} tools are live`);
    }
});
