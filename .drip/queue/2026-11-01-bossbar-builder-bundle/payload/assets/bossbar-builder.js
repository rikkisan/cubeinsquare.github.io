(() => {
  const root = document.querySelector('[data-bossbar-builder]');
  if (!root) return;
  const $ = (id) => document.getElementById(id);
  const presets = [
    { id:'cube:ritual_charge', title:'Ritual charge', color:'purple', style:'notched_10', value:65, max:100, players:'@a' },
    { id:'cube:raid_phase', title:'Raid phase II', color:'red', style:'notched_6', value:2, max:4, players:'@a' },
    { id:'cube:evacuation', title:'Evacuation: 3 minutes', color:'yellow', style:'progress', value:180, max:300, players:'@a' },
    { id:'cube:boss_phase', title:'Phase break incoming', color:'blue', style:'notched_12', value:8, max:12, players:'@a' }
  ];
  function safeId(value) { const raw = String(value || 'cube:event').trim().toLowerCase().replace(/[^a-z0-9_:.\/-]/g, '_'); return raw.includes(':') ? raw : 'cube:' + raw; }
  function num(id, fallback) { const value = Number($(id).value); return Number.isFinite(value) && value >= 0 ? Math.round(value) : fallback; }
  function titleJson(text) { return JSON.stringify({ text: String(text || 'Event'), color: 'white' }); }
  function commands() { const id = safeId($('bb-id').value); const max = Math.max(1, num('bb-max', 100)); const value = Math.min(max, num('bb-value', 0)); const title = $('bb-title').value || 'Event'; const visible = $('bb-visible').checked ? 'true' : 'false'; return [
    '/bossbar add ' + id + ' ' + titleJson(title),
    '/bossbar set ' + id + ' color ' + $('bb-color').value,
    '/bossbar set ' + id + ' style ' + $('bb-style').value,
    '/bossbar set ' + id + ' max ' + max,
    '/bossbar set ' + id + ' value ' + value,
    '/bossbar set ' + id + ' players ' + ($('bb-players').value || '@a'),
    '/bossbar set ' + id + ' visible ' + visible
  ]; }
  function update() { const max = Math.max(1, num('bb-max', 100)); const value = Math.min(max, num('bb-value', 0)); $('bb-output').value = commands().join('\n'); $('bb-preview-title').textContent = $('bb-title').value || 'Event'; $('bb-preview-fill').style.width = Math.max(0, Math.min(100, value / max * 100)) + '%'; $('bb-preview-fill').className = 'is-' + $('bb-color').value; }
  root.addEventListener('input', update);
  root.addEventListener('change', update);
  document.querySelectorAll('[data-bb-preset]').forEach((button) => button.addEventListener('click', () => { const p = presets[Number(button.dataset.bbPreset)] || presets[0]; $('bb-id').value=p.id; $('bb-title').value=p.title; $('bb-color').value=p.color; $('bb-style').value=p.style; $('bb-value').value=p.value; $('bb-max').value=p.max; $('bb-players').value=p.players; $('bb-visible').checked=true; update(); }));
  $('bb-copy').addEventListener('click', async () => { await navigator.clipboard.writeText($('bb-output').value); const old = $('bb-copy').textContent; $('bb-copy').textContent = 'Copied'; setTimeout(() => $('bb-copy').textContent = old, 1200); });
  update();
})();
