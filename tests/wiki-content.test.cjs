const {test} = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync,readdirSync,existsSync} = require('node:fs');
const {join} = require('node:path');
const root = join(__dirname, '..');
const locales = ['', 'ru', 'fr', 'de'];
const marker = String.fromCharCode(96) + 'r' + String.fromCharCode(96) + 'n';
test('published wiki grids contain no literal PowerShell newline artifacts', () => {
    for (const locale of locales) {
        const path = join(root,locale,'wiki/index.html');
        assert(!readFileSync(path,'utf8').includes(marker),path);
    }
});
test('queued releases cannot restore literal newline artifacts in wiki grids', () => {
    const queue = join(root,'.drip/queue');
    for (const release of readdirSync(queue, {withFileTypes:true}).filter(entry=>entry.isDirectory())) {
        for (const locale of locales) {
            const path = join(queue,release.name,'payload',locale,'wiki/index.html');
            if (existsSync(path)) assert(!readFileSync(path,'utf8').includes(marker),path);
        }
    }
});

