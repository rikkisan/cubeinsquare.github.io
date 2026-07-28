(() => {
  const root = document.querySelector('[data-advancement-builder]');
  if (!root) return;
  const $ = (id) => document.getElementById(id);

  // Only the icon shape depends on the version here: 1.20.5 renamed the
  // display icon's "item" field to "id", same rename as recipes and loot.
  const VERSIONS = [
    { id: '1.21.7', label: '1.21.7 - 1.21.8', format: 81 },
    { id: '1.21.6', label: '1.21.6',          format: 80 },
    { id: '1.21.5', label: '1.21.5',          format: 71 },
    { id: '1.21.4', label: '1.21.4',          format: 61 },
    { id: '1.21.2', label: '1.21.2 - 1.21.3', format: 57 },
    { id: '1.21',   label: '1.21 - 1.21.1',   format: 48 },
    { id: '1.20.5', label: '1.20.5 - 1.20.6', format: 41 },
    { id: '1.20',   label: '1.20 - 1.20.4',   format: 26 }
  ];

  const LOCALE = (document.documentElement.lang || 'en').slice(0, 2);
  const T = {
    en: { copied: 'Copied',
          granted: 'Granted by command — nothing in the world triggers this on its own.',
          auto: 'Triggers on its own once the condition is met.' },
    ru: { copied: 'Скопировано',
          granted: 'Выдаётся командой — сама по себе в мире не сработает.',
          auto: 'Срабатывает сама, как только условие выполнено.' },
    fr: { copied: 'Copié',
          granted: 'Attribué par commande — rien dans le monde ne le déclenche seul.',
          auto: 'Se déclenche seul dès que la condition est remplie.' },
    de: { copied: 'Kopiert',
          granted: 'Wird per Befehl vergeben — von allein löst nichts davon aus.',
          auto: 'Löst von allein aus, sobald die Bedingung erfüllt ist.' }
  };
  const t = T[LOCALE] || T.en;

  function currentFormat() {
    const v = VERSIONS.find((x) => x.id === $('ad-version').value);
    return v ? v.format : 61;
  }

  function namespaced(value, fallback) {
    const raw = String(value || '').trim().toLowerCase().replace(/\s+/g, '_');
    if (!raw) return fallback;
    return raw.includes(':') ? raw : 'minecraft:' + raw;
  }

  function safeId(value, fallback) {
    return String(value || fallback).trim().toLowerCase().replace(/[^a-z0-9_/.-]/g, '_') || fallback;
  }

  function buildAdvancement() {
    const fmt = currentFormat();
    const ns = safeId($('ad-namespace').value, 'harbor');
    const trigger = $('ad-trigger').value;

    const advancement = {};

    // A child advancement points at its parent and inherits its tab.
    const parent = String($('ad-parent').value || '').trim();
    if (parent) advancement.parent = parent.includes(':') ? parent : ns + ':' + safeId(parent, 'root');

    const display = {
      icon: fmt >= 41
        ? { id: namespaced($('ad-icon').value, 'minecraft:map') }
        : { item: namespaced($('ad-icon').value, 'minecraft:map') },
      title: $('ad-title').value || 'Untitled',
      description: $('ad-description').value || '',
      frame: $('ad-frame').value,
      show_toast: $('ad-toast').checked,
      announce_to_chat: $('ad-announce').checked,
      hidden: $('ad-hidden').checked
    };
    // Only a root advancement paints the tab background.
    if (!parent && $('ad-background').value.trim()) {
      display.background = $('ad-background').value.trim();
    }
    advancement.display = display;

    const criterion = {};
    criterion.trigger = trigger;
    if (trigger === 'minecraft:player_killed_entity') {
      criterion.conditions = { entity: { type: namespaced($('ad-entity').value, 'minecraft:zombie') } };
    }
    advancement.criteria = { [safeId($('ad-criterion').value, 'requirement')]: criterion };

    const rewards = {};
    const xp = Number($('ad-xp').value);
    if (Number.isFinite(xp) && xp > 0) rewards.experience = Math.round(xp);
    const fn = String($('ad-function').value || '').trim();
    if (fn) rewards.function = fn.includes(':') ? fn : ns + ':' + safeId(fn, 'reward');
    const recipes = String($('ad-recipes').value || '')
      .split(/[\n,]+/).map((r) => r.trim()).filter(Boolean)
      .map((r) => (r.includes(':') ? r : ns + ':' + safeId(r, 'recipe')));
    if (recipes.length) rewards.recipes = recipes;
    if (Object.keys(rewards).length) advancement.rewards = rewards;

    return advancement;
  }

  function filePath() {
    const ns = safeId($('ad-namespace').value, 'harbor');
    const file = safeId($('ad-file').value, 'root');
    // 1.21 renamed advancements/ to advancement/.
    return `data/${ns}/advancement/${file}.json`;
  }

  function grantCommand() {
    const ns = safeId($('ad-namespace').value, 'harbor');
    const file = safeId($('ad-file').value, 'root');
    return `/advancement grant @s only ${ns}:${file}`;
  }

  function syncVisibility() {
    const trigger = $('ad-trigger').value;
    $('ad-entity-field').hidden = trigger !== 'minecraft:player_killed_entity';
    $('ad-background-field').hidden = String($('ad-parent').value || '').trim() !== '';
    $('ad-trigger-note').textContent = trigger === 'minecraft:impossible' ? t.granted : t.auto;
  }

  function update() {
    syncVisibility();
    $('ad-output').value = JSON.stringify(buildAdvancement(), null, 2);
    $('ad-path').textContent = filePath();
    $('ad-grant').textContent = grantCommand();
  }

  const PRESETS = {
    quest: () => {
      $('ad-trigger').value = 'minecraft:impossible';
      $('ad-file').value = 'harbor_quest_1';
      $('ad-parent').value = '';
      $('ad-title').value = 'The harbourmaster’s letter';
      $('ad-description').value = 'Deliver the sealed letter to the pier.';
      $('ad-icon').value = 'minecraft:written_book';
      $('ad-frame').value = 'task';
      $('ad-criterion').value = 'delivered';
      $('ad-xp').value = '20';
      $('ad-background').value = 'minecraft:textures/gui/advancements/backgrounds/stone.png';
      $('ad-recipes').value = '';
      $('ad-function').value = '';
    },
    recipe: () => {
      $('ad-trigger').value = 'minecraft:impossible';
      $('ad-file').value = 'unlock_reinforced_block';
      $('ad-parent').value = '';
      $('ad-title').value = 'Reinforced block';
      $('ad-description').value = 'Unlocks the reinforced block recipe.';
      $('ad-icon').value = 'minecraft:diamond_block';
      $('ad-frame').value = 'task';
      $('ad-criterion').value = 'unlocked';
      $('ad-xp').value = '0';
      $('ad-recipes').value = 'harbor:reinforced_block';
      $('ad-function').value = '';
      $('ad-background').value = '';
      $('ad-toast').checked = false;
      $('ad-announce').checked = false;
      $('ad-hidden').checked = true;
    },
    hunt: () => {
      $('ad-trigger').value = 'minecraft:player_killed_entity';
      $('ad-file').value = 'harbor_hunt';
      $('ad-parent').value = 'harbor:harbor_quest_1';
      $('ad-title').value = 'Rid the docks';
      $('ad-description').value = 'Deal with what crawls out of the water at night.';
      $('ad-icon').value = 'minecraft:iron_sword';
      $('ad-frame').value = 'challenge';
      $('ad-criterion').value = 'killed_drowned';
      $('ad-entity').value = 'minecraft:drowned';
      $('ad-xp').value = '50';
      $('ad-background').value = '';
    }
  };

  const versionSelect = $('ad-version');
  VERSIONS.forEach((v) => {
    const option = document.createElement('option');
    option.value = v.id;
    option.textContent = v.label;
    versionSelect.appendChild(option);
  });
  versionSelect.value = '1.21.4';

  root.addEventListener('input', update);
  root.addEventListener('change', update);

  document.querySelectorAll('[data-ad-preset]').forEach((button) => {
    button.addEventListener('click', () => { (PRESETS[button.dataset.adPreset] || PRESETS.quest)(); update(); });
  });

  async function copyText(text, button) {
    try {
      await navigator.clipboard.writeText(text);
      const label = button.textContent;
      button.textContent = t.copied;
      setTimeout(() => { button.textContent = label; }, 1200);
    } catch (error) {
      /* clipboard blocked; the text stays selectable */
    }
  }

  $('ad-copy').addEventListener('click', (e) => copyText($('ad-output').value, e.currentTarget));
  $('ad-copy-grant').addEventListener('click', (e) => copyText(grantCommand(), e.currentTarget));

  $('ad-download').addEventListener('click', () => {
    const blob = new Blob([$('ad-output').value], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = safeId($('ad-file').value, 'advancement') + '.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });

  PRESETS.quest();
  update();
})();
