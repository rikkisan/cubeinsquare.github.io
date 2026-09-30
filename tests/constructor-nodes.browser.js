/* Browser regression check. Serve the repository on 127.0.0.1:8765, then run:
   npx --package @playwright/cli playwright-cli -s=nodes-test run-code --filename tests/constructor-nodes.browser.js
*/
async (page) => {
  const base = 'http://127.0.0.1:8765';
  const tools = ['custom-item-builder', 'item-model-builder', 'book-letter-builder', 'dialogue-builder', 'bossbar-builder', 'advancement-builder', 'custom-potions', 'custom-villager-trades', 'datapack-generator', 'recipe-generator', 'loot-table-generator'];
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/assets/**', route => route.continue());
  let pages = 0;
  for (const locale of ['', 'ru/', 'fr/', 'de/']) {
    for (const tool of tools) {
      await page.goto(base + '/' + locale + tool + '/');
      await page.locator('#nv-tab-1').waitFor();
      const before = await page.locator('main textarea[readonly]').evaluateAll(fields => fields.map(field => field.value));
      await page.locator('#nv-tab-1').click();
      const output = await page.locator('.nv-output-text').evaluateAll(fields => fields.map(field => field.value));
      if (before.some(value => !output.includes(value))) throw Error('Output changed on mode switch: ' + locale + tool);
      if (await page.locator('.nv-input').count() === 0) throw Error('No editable nodes: ' + locale + tool);
      await page.locator('#nv-tab-0').click();
      if (await page.locator('#nv-tab-0').getAttribute('aria-selected') !== 'true') throw Error('Cannot return to form');
      pages++;
    }
  }
  await page.goto(base + '/ru/bossbar-builder/');
  await page.locator('#nv-tab-1').click();
  const title = page.locator('.nv-input[data-source-id="bb-title"]');
  await title.fill('NODE_REGRESSION');
  await page.waitForFunction(() => document.querySelector('.nv-output-text').value.includes('NODE_REGRESSION'));
  if (!await title.evaluate(field => field === document.activeElement)) throw Error('Typing lost focus');
  await page.locator('#nv-tab-0').click();
  if (await page.locator('#bb-title').inputValue() !== 'NODE_REGRESSION') throw Error('Form lost node edit');
  await page.locator('#bb-title').fill('FORM_REGRESSION');
  await page.locator('#nv-tab-1').click();
  if (await title.inputValue() !== 'FORM_REGRESSION') throw Error('Node lost form edit');
  for (let i = 0; i < 12; i++) {
    await page.locator('#nv-tab-0').click();
    await page.locator('#nv-tab-1').click();
  }
  if (await page.locator('.nv-node').count() !== 2) throw Error('Nodes accumulate on mode switch');
  await page.goto(base + '/ru/item-model-builder/');
  await page.locator('#nv-tab-1').click();
  for (const mode of ['model', 'select', 'range_dispatch', 'condition']) {
    const selector = page.locator('.nv-input[data-source-id="imb-mode"]');
    await selector.focus();
    await selector.selectOption(mode);
    await page.waitForFunction(mode => JSON.parse(document.querySelector('.nv-output-text').value).model.type === 'minecraft:' + mode, mode);
    if (!await page.locator('.nv-input[data-source-id="imb-mode"]').evaluate(field => field === document.activeElement)) throw Error('Changing branch type lost focus');
  }
  await page.goto(base + '/ru/book-letter-builder/');
  await page.locator('#nv-tab-1').click();
  await page.locator('.nv-actions summary').click();
  await page.locator('.nv-action-list [data-source-action="blb-add-page"]').click();
  await page.waitForFunction(() => document.querySelectorAll('.nv-node').length === 5);
  const bookPages = page.locator('.nv-node').filter({ hasText: /Страница [12]/ });
  await bookPages.nth(0).locator('textarea').fill('FIRST_PAGE');
  await bookPages.nth(1).locator('textarea').fill('SECOND_PAGE');
  await bookPages.nth(1).locator('button[aria-label="Переместить раньше"]').evaluate(button => button.click());
  await page.waitForFunction(() => {
    const output = document.getElementById('blb-output').value;
    return output.includes('FIRST_PAGE') && output.indexOf('SECOND_PAGE') < output.indexOf('FIRST_PAGE');
  });
  if (errors.length) throw Error(errors.join('\n'));
  return { localizedPages: pages, bidirectionalEditing: true, branchModes: 4, pageOrder: true, repeatedSwitches: 12, errors };
}
