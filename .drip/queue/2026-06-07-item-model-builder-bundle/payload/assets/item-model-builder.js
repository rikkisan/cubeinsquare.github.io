(function () {
  const copy = {
    en: {
      modeLabels: {
        model: 'Direct model',
        select: 'Select by property',
        range_dispatch: 'Range dispatch',
        condition: 'Condition'
      },
      modeOptions: {
        model: ['minecraft:model'],
        select: ['minecraft:custom_model_data', 'minecraft:main_hand', 'minecraft:display_context'],
        range_dispatch: ['minecraft:damage', 'minecraft:cooldown', 'minecraft:custom_model_data'],
        condition: ['minecraft:using_item', 'minecraft:damaged', 'minecraft:selected']
      },
      branchWhen: 'When',
      branchModel: 'Model path',
      branchThreshold: 'Threshold',
      branchDelete: 'Remove',
      summary: (filePath, mode, count) => `File: ${filePath}. Mode: ${mode}. Branches: ${count}.`,
      noteModel: 'Use a direct model when one clean file path is enough and the item does not branch at all.',
      noteSelect: 'Use select when a property chooses between named cases such as custom_model_data slots, display context, or the main hand.',
      noteRange: 'Use range_dispatch when a numeric property steps through thresholds like damage or cooldown.',
      noteCondition: 'Use condition for true/false states such as selected, damaged, or using_item.',
      modeMapTitle: 'Pick the branch shape first',
      modeMapSummary: 'Start with the behavior you actually need. You can swap examples later once the structure makes sense.',
      modeCards: {
        model: {
          title: 'One fixed look',
          desc: 'One clean model path, no branching.'
        },
        select: {
          title: 'Named states',
          desc: 'Switch between explicit values like CMD strings or display contexts.'
        },
        range_dispatch: {
          title: 'Stepped thresholds',
          desc: 'Move through damage, cooldown, or float breakpoints.'
        },
        condition: {
          title: 'True / false split',
          desc: 'Use two clear states such as selected vs idle.'
        }
      },
      propertyHints: {
        model: {
          title: 'No property needed',
          body: 'A direct model file only points to one model path, so the property selector stays out of the way.'
        },
        'select:minecraft:custom_model_data': {
          title: 'Best for named item states',
          body: 'Use one row per named value like novice, master, sealed, or ritual. The index decides which custom_model_data slot is read.'
        },
        'select:minecraft:main_hand': {
          title: 'Use left and right',
          body: 'Good when the same item should look different in the player’s left and right hand.'
        },
        'select:minecraft:display_context': {
          title: 'Use render contexts',
          body: 'Useful for gui, ground, fixed, firstperson_righthand, thirdperson_lefthand, and similar display situations.'
        },
        'range_dispatch:minecraft:damage': {
          title: 'Use 0 to 1 thresholds',
          body: 'Treat thresholds as steps through the durability bar. Lower values usually mean earlier visual changes.'
        },
        'range_dispatch:minecraft:cooldown': {
          title: 'Use cooldown breakpoints',
          body: 'Great for charge-up items, ritual tools, and staged feedback that moves from empty to ready.'
        },
        'range_dispatch:minecraft:custom_model_data': {
          title: 'Use numeric CMD values',
          body: 'This variant is for float-like or numeric stages. If your cases are names, use select instead.'
        },
        'condition:minecraft:using_item': {
          title: 'Two states only',
          body: 'Keep one branch for the active state and one for the idle state. This is ideal for draw, use, or channel moments.'
        },
        'condition:minecraft:damaged': {
          title: 'Healthy vs damaged',
          body: 'Use one model for the damaged state and one for the normal state when you only need a binary split.'
        },
        'condition:minecraft:selected': {
          title: 'Selected vs not selected',
          body: 'A clean fit when an item should glow, open, or change silhouette only while selected.'
        }
      },
      branchHelpers: {
        model: 'Direct model mode does not need branch rows. The fallback model becomes the whole file.',
        select: 'Add one row per named case. Good first passes are pairs like novice/master or gui/ground.',
        range_dispatch: 'Add thresholds in ascending order so the output reads like a staged ladder instead of a guess.',
        condition: 'Keep exactly two clear rows when possible: one true state and one false state.'
      },
      nextStepsTitle: 'After this file works',
      nextSteps: [
        'Place the JSON in assets/<namespace>/items/.',
        'Confirm that every referenced model path already exists in your pack.',
        'Test the hook with Custom Item Builder or a raw /give command before you branch further.'
      ],
      placeholders: {
        branchModel: 'cubeinsquare:item/example/state_1',
        selectCmd: 'novice',
        selectHand: 'left',
        selectDisplay: 'gui',
        range: '0.6',
        conditionTrue: 'true',
        conditionFalse: 'false'
      },
      examples: {
        model: { ns: 'cubeinsquare', file: 'paper/guild_pass', fallback: 'cubeinsquare:item/paper/guild_pass', branches: [] },
        select: { ns: 'cubeinsquare', file: 'book/formulary', fallback: 'minecraft:item/book', property: 'minecraft:custom_model_data', index: 0, branches: [{ when: 'novice', model: 'cubeinsquare:item/book/formulary_novice' }, { when: 'master', model: 'cubeinsquare:item/book/formulary_master' }] },
        range_dispatch: { ns: 'cubeinsquare', file: 'wand/charge', fallback: 'cubeinsquare:item/wand/charge_0', property: 'minecraft:damage', branches: [{ when: '0.25', model: 'cubeinsquare:item/wand/charge_1' }, { when: '0.6', model: 'cubeinsquare:item/wand/charge_2' }] },
        condition: { ns: 'cubeinsquare', file: 'compass/selected', fallback: 'cubeinsquare:item/compass_idle', property: 'minecraft:selected', branches: [{ when: 'true', model: 'cubeinsquare:item/compass_selected' }, { when: 'false', model: 'cubeinsquare:item/compass_idle' }] },
        singleProp: { mode: 'model', ns: 'cubeinsquare', file: 'token/archive_key', fallback: 'cubeinsquare:item/token/archive_key', branches: [] },
        stateSwitch: { mode: 'condition', ns: 'cubeinsquare', file: 'compass/selected', fallback: 'cubeinsquare:item/compass_idle', property: 'minecraft:selected', branches: [{ when: 'true', model: 'cubeinsquare:item/compass_selected' }, { when: 'false', model: 'cubeinsquare:item/compass_idle' }] },
        chargeStages: { mode: 'range_dispatch', ns: 'cubeinsquare', file: 'wand/charge', fallback: 'cubeinsquare:item/wand/charge_0', property: 'minecraft:cooldown', branches: [{ when: '0.2', model: 'cubeinsquare:item/wand/charge_1' }, { when: '0.6', model: 'cubeinsquare:item/wand/charge_2' }, { when: '0.9', model: 'cubeinsquare:item/wand/charge_3' }] },
        handContext: { mode: 'select', ns: 'cubeinsquare', file: 'lantern/hand', fallback: 'cubeinsquare:item/lantern/hand_idle', property: 'minecraft:main_hand', branches: [{ when: 'left', model: 'cubeinsquare:item/lantern/hand_left' }, { when: 'right', model: 'cubeinsquare:item/lantern/hand_right' }] }
      }
    },
    ru: {
      modeLabels: {
        model: 'Одна модель',
        select: 'Select по свойству',
        range_dispatch: 'Range dispatch',
        condition: 'Condition'
      },
      modeOptions: {
        model: ['minecraft:model'],
        select: ['minecraft:custom_model_data', 'minecraft:main_hand', 'minecraft:display_context'],
        range_dispatch: ['minecraft:damage', 'minecraft:cooldown', 'minecraft:custom_model_data'],
        condition: ['minecraft:using_item', 'minecraft:damaged', 'minecraft:selected']
      },
      branchWhen: 'Когда',
      branchModel: 'Путь модели',
      branchThreshold: 'Порог',
      branchDelete: 'Убрать',
      summary: (filePath, mode, count) => `Файл: ${filePath}. Режим: ${mode}. Веток: ${count}.`,
      noteModel: 'Прямую модель берут тогда, когда нужен один фиксированный путь без ветвления.',
      noteSelect: 'Select нужен, когда свойство переключает между именованными кейсами вроде custom_model_data, display_context или руки.',
      noteRange: 'Range dispatch подходит для числовых порогов вроде урона, кулдауна или поэтапного прогресса.',
      noteCondition: 'Condition нужен для true/false состояний вроде selected, damaged или using_item.',
      modeMapTitle: 'Сначала выбери форму ветвления',
      modeMapSummary: 'Начни с того поведения, которое реально нужно предмету. Пример всегда можно поменять позже.',
      modeCards: {
        model: {
          title: 'Один фиксированный вид',
          desc: 'Один путь к модели, без веток.'
        },
        select: {
          title: 'Именованные состояния',
          desc: 'Переключение по явным значениям вроде строк CMD или контекста отображения.'
        },
        range_dispatch: {
          title: 'Пороговые стадии',
          desc: 'Переход по числам вроде урона, кулдауна или float-значений.'
        },
        condition: {
          title: 'Разделение true / false',
          desc: 'Два чётких состояния: активно и неактивно.'
        }
      },
      propertyHints: {
        model: {
          title: 'Свойство не нужно',
          body: 'В этом режиме файл просто указывает на один model path, поэтому селектор свойства не участвует.'
        },
        'select:minecraft:custom_model_data': {
          title: 'Лучше всего для именованных состояний',
          body: 'Добавляй по строке на каждое имя вроде novice, master, sealed или ritual. Индекс определяет, какой слот custom_model_data читается.'
        },
        'select:minecraft:main_hand': {
          title: 'Используй left и right',
          body: 'Подходит, когда предмет должен выглядеть по-разному в левой и правой руке.'
        },
        'select:minecraft:display_context': {
          title: 'Используй контексты рендера',
          body: 'Хорошо подходит для gui, ground, fixed, firstperson_righthand и других display_context значений.'
        },
        'range_dispatch:minecraft:damage': {
          title: 'Используй пороги от 0 до 1',
          body: 'Думай о них как о стадиях шкалы прочности. Чем меньше порог, тем раньше предмет меняет вид.'
        },
        'range_dispatch:minecraft:cooldown': {
          title: 'Используй точки кулдауна',
          body: 'Удобно для зарядки жезлов, ритуальных предметов и поэтапной подготовки.'
        },
        'range_dispatch:minecraft:custom_model_data': {
          title: 'Используй числовые CMD-значения',
          body: 'Этот режим нужен для float-подобных стадий. Если кейсы названы словами, лучше выбрать select.'
        },
        'condition:minecraft:using_item': {
          title: 'Только два состояния',
          body: 'Оставь одну ветку для активного состояния и одну для обычного — это удобно для draw, use и channel сцен.'
        },
        'condition:minecraft:damaged': {
          title: 'Целое против повреждённого',
          body: 'Подходит, когда нужен только двоичный раскол: предмет повреждён или нет.'
        },
        'condition:minecraft:selected': {
          title: 'Selected против idle',
          body: 'Хорошо ложится на предметы, которые должны раскрываться, светиться или менять силуэт только в выбранном состоянии.'
        }
      },
      branchHelpers: {
        model: 'Для режима direct model строки веток не нужны: fallback-модель и есть весь файл.',
        select: 'Добавляй по строке на каждый именованный кейс. Хороший первый проход — пары вроде novice/master или gui/ground.',
        range_dispatch: 'Собирай пороги по возрастанию, чтобы выход читался как ступени, а не как угадайка.',
        condition: 'По возможности держи ровно две строки: одну для true-состояния и одну для false.'
      },
      nextStepsTitle: 'Что сделать после этого файла',
      nextSteps: [
        'Положи JSON в assets/<namespace>/items/.',
        'Проверь, что все model path уже существуют в ресурспаке.',
        'Протестируй хук через Custom Item Builder или сырой /give до того, как усложнять схему.'
      ],
      placeholders: {
        branchModel: 'cubeinsquare:item/example/state_1',
        selectCmd: 'novice',
        selectHand: 'left',
        selectDisplay: 'gui',
        range: '0.6',
        conditionTrue: 'true',
        conditionFalse: 'false'
      },
      examples: {}
    },
    fr: {
      modeLabels: {
        model: 'Modèle direct',
        select: 'Select par propriété',
        range_dispatch: 'Range dispatch',
        condition: 'Condition'
      },
      modeOptions: {
        model: ['minecraft:model'],
        select: ['minecraft:custom_model_data', 'minecraft:main_hand', 'minecraft:display_context'],
        range_dispatch: ['minecraft:damage', 'minecraft:cooldown', 'minecraft:custom_model_data'],
        condition: ['minecraft:using_item', 'minecraft:damaged', 'minecraft:selected']
      },
      branchWhen: 'Quand',
      branchModel: 'Chemin du modèle',
      branchThreshold: 'Seuil',
      branchDelete: 'Retirer',
      summary: (filePath, mode, count) => `Fichier : ${filePath}. Mode : ${mode}. Branches : ${count}.`,
      noteModel: 'Utilisez un modèle direct quand un seul chemin fixe suffit et qu’aucune branche n’est nécessaire.',
      noteSelect: 'Utilisez select quand une propriété choisit entre des cas nommés comme custom_model_data, display_context ou la main.',
      noteRange: 'Range dispatch sert quand une propriété numérique passe par des seuils comme damage, cooldown ou une progression par étapes.',
      noteCondition: 'Condition sert aux états vrai/faux comme selected, damaged ou using_item.',
      modeMapTitle: 'Choisissez d’abord la forme de branche',
      modeMapSummary: 'Commencez par le comportement dont l’objet a réellement besoin. Vous pourrez changer d’exemple ensuite.',
      modeCards: {
        model: {
          title: 'Une seule apparence',
          desc: 'Un seul chemin de modèle, sans branches.'
        },
        select: {
          title: 'États nommés',
          desc: 'Bascule entre des valeurs explicites comme les chaînes CMD ou les contextes d’affichage.'
        },
        range_dispatch: {
          title: 'Paliers numériques',
          desc: 'Progresse selon des seuils de dégâts, de cooldown ou de valeurs float.'
        },
        condition: {
          title: 'Séparation vrai / faux',
          desc: 'Deux états clairs : actif et inactif.'
        }
      },
      propertyHints: {
        model: {
          title: 'Aucune propriété nécessaire',
          body: 'Dans ce mode, le fichier pointe simplement vers un seul model path, donc le sélecteur de propriété reste inutile.'
        },
        'select:minecraft:custom_model_data': {
          title: 'Parfait pour des états nommés',
          body: 'Ajoutez une ligne par valeur nommée comme novice, master, sealed ou ritual. L’index décide quel slot custom_model_data est lu.'
        },
        'select:minecraft:main_hand': {
          title: 'Utilisez left et right',
          body: 'Très utile quand le même objet doit changer d’apparence selon la main qui le tient.'
        },
        'select:minecraft:display_context': {
          title: 'Utilisez les contextes de rendu',
          body: 'Pratique pour gui, ground, fixed, firstperson_righthand et les autres valeurs de display_context.'
        },
        'range_dispatch:minecraft:damage': {
          title: 'Travaillez entre 0 et 1',
          body: 'Pensez à des seuils qui montent le long de la barre de durabilité. Les petits seuils changent l’apparence plus tôt.'
        },
        'range_dispatch:minecraft:cooldown': {
          title: 'Découpez le cooldown',
          body: 'Très pratique pour des baguettes, rituels ou objets qui se chargent progressivement.'
        },
        'range_dispatch:minecraft:custom_model_data': {
          title: 'Réservez-le aux valeurs numériques',
          body: 'Ce mode convient aux étapes float ou aux seuils numériques. Si vos cas portent des noms, utilisez plutôt select.'
        },
        'condition:minecraft:using_item': {
          title: 'Deux états suffisent',
          body: 'Gardez une branche pour l’état actif et une pour l’état normal, surtout pour les moments de draw, use ou channel.'
        },
        'condition:minecraft:damaged': {
          title: 'Normal contre abîmé',
          body: 'Bon choix quand vous voulez seulement un basculement binaire : intact ou endommagé.'
        },
        'condition:minecraft:selected': {
          title: 'Selected contre idle',
          body: 'Parfait quand un objet doit s’ouvrir, briller ou changer de silhouette seulement lorsqu’il est sélectionné.'
        }
      },
      branchHelpers: {
        model: 'Le mode direct model n’a pas besoin de lignes de branche : le fallback devient à lui seul tout le fichier.',
        select: 'Ajoutez une ligne par cas nommé. Un bon premier passage, ce sont des paires comme novice/master ou gui/ground.',
        range_dispatch: 'Rangez les seuils du plus petit au plus grand pour lire la sortie comme des étapes claires.',
        condition: 'Essayez de garder exactement deux lignes : une pour l’état true et une pour l’état false.'
      },
      nextStepsTitle: 'Après ce fichier',
      nextSteps: [
        'Placez le JSON dans assets/<namespace>/items/.',
        'Vérifiez que tous les model paths référencés existent déjà dans le pack.',
        'Testez le hook avec Custom Item Builder ou un /give brut avant d’ajouter plus de complexité.'
      ],
      placeholders: {
        branchModel: 'cubeinsquare:item/example/state_1',
        selectCmd: 'novice',
        selectHand: 'left',
        selectDisplay: 'gui',
        range: '0.6',
        conditionTrue: 'true',
        conditionFalse: 'false'
      },
      examples: {}
    },
    de: {
      modeLabels: {
        model: 'Direktes Modell',
        select: 'Select nach Eigenschaft',
        range_dispatch: 'Range dispatch',
        condition: 'Condition'
      },
      modeOptions: {
        model: ['minecraft:model'],
        select: ['minecraft:custom_model_data', 'minecraft:main_hand', 'minecraft:display_context'],
        range_dispatch: ['minecraft:damage', 'minecraft:cooldown', 'minecraft:custom_model_data'],
        condition: ['minecraft:using_item', 'minecraft:damaged', 'minecraft:selected']
      },
      branchWhen: 'Wenn',
      branchModel: 'Modellpfad',
      branchThreshold: 'Schwelle',
      branchDelete: 'Entfernen',
      summary: (filePath, mode, count) => `Datei: ${filePath}. Modus: ${mode}. Zweige: ${count}.`,
      noteModel: 'Nutze ein direktes Modell, wenn ein einziger fester Pfad reicht und keine Verzweigung nötig ist.',
      noteSelect: 'Nutze select, wenn eine Eigenschaft zwischen benannten Fällen wie custom_model_data, display_context oder der Hand wählt.',
      noteRange: 'Range dispatch ist gut, wenn ein numerischer Wert über Schwellen wie Schaden, Cooldown oder Stufenfortschritt läuft.',
      noteCondition: 'Condition passt zu true/false-Zuständen wie selected, damaged oder using_item.',
      modeMapTitle: 'Wähle zuerst die Verzweigungsform',
      modeMapSummary: 'Starte mit dem Verhalten, das dein Item wirklich braucht. Das Beispiel kannst du danach jederzeit tauschen.',
      modeCards: {
        model: {
          title: 'Ein festes Aussehen',
          desc: 'Ein einzelner Modellpfad, keine Verzweigung.'
        },
        select: {
          title: 'Benannte Zustände',
          desc: 'Wechsle zwischen klaren Werten wie CMD-Strings oder Anzeige-Kontexten.'
        },
        range_dispatch: {
          title: 'Numerische Stufen',
          desc: 'Arbeite mit Schwellen für Schaden, Cooldown oder Float-Werte.'
        },
        condition: {
          title: 'Wahr / falsch',
          desc: 'Zwei klare Zustände: aktiv und inaktiv.'
        }
      },
      propertyHints: {
        model: {
          title: 'Keine Eigenschaft nötig',
          body: 'In diesem Modus zeigt die Datei einfach auf einen einzelnen model path, deshalb spielt der Property-Selektor keine Rolle.'
        },
        'select:minecraft:custom_model_data': {
          title: 'Ideal für benannte Zustände',
          body: 'Lege eine Zeile pro Namen wie novice, master, sealed oder ritual an. Der Index bestimmt, welcher custom_model_data-Slot gelesen wird.'
        },
        'select:minecraft:main_hand': {
          title: 'Nutze left und right',
          body: 'Gut geeignet, wenn dasselbe Item in linker und rechter Hand unterschiedlich aussehen soll.'
        },
        'select:minecraft:display_context': {
          title: 'Nutze Render-Kontexte',
          body: 'Praktisch für gui, ground, fixed, firstperson_righthand und andere display_context-Werte.'
        },
        'range_dispatch:minecraft:damage': {
          title: 'Arbeite mit 0 bis 1',
          body: 'Denk an Schwellen entlang der Haltbarkeitsleiste. Niedrige Werte lösen frühere visuelle Wechsel aus.'
        },
        'range_dispatch:minecraft:cooldown': {
          title: 'Teile den Cooldown in Stufen',
          body: 'Sehr nützlich für Stäbe, Rituale oder andere Gegenstände mit spürbarem Ladezustand.'
        },
        'range_dispatch:minecraft:custom_model_data': {
          title: 'Für numerische CMD-Stufen',
          body: 'Dieser Modus ist für Float-ähnliche Stufen und Schwellenwerte gedacht. Wenn deine Fälle Namen tragen, nutze select.'
        },
        'condition:minecraft:using_item': {
          title: 'Zwei Zustände reichen',
          body: 'Halte eine Branch für den aktiven Zustand und eine für den Normalzustand bereit, vor allem für draw-, use- oder channel-Momente.'
        },
        'condition:minecraft:damaged': {
          title: 'Intakt gegen beschädigt',
          body: 'Gut, wenn du nur einen binären Wechsel brauchst: unbeschädigt oder beschädigt.'
        },
        'condition:minecraft:selected': {
          title: 'Selected gegen idle',
          body: 'Passt gut, wenn ein Item nur im ausgewählten Zustand leuchten, sich öffnen oder die Form ändern soll.'
        }
      },
      branchHelpers: {
        model: 'Der direct-model-Modus braucht keine Branch-Zeilen: Das Fallback-Modell ist bereits die ganze Datei.',
        select: 'Lege eine Zeile pro benanntem Fall an. Gute erste Paare sind novice/master oder gui/ground.',
        range_dispatch: 'Ordne die Schwellen von klein nach groß, damit die Ausgabe wie eine klare Stufenleiter lesbar bleibt.',
        condition: 'Wenn möglich, bleib bei genau zwei Zeilen: eine für den true-Zustand und eine für den false-Zustand.'
      },
      nextStepsTitle: 'Wenn die Datei steht',
      nextSteps: [
        'Lege das JSON in assets/<namespace>/items/ ab.',
        'Prüfe, dass alle referenzierten model paths schon im Pack existieren.',
        'Teste den Hook mit Custom Item Builder oder einem rohen /give, bevor du die Struktur weiter verzweigst.'
      ],
      placeholders: {
        branchModel: 'cubeinsquare:item/example/state_1',
        selectCmd: 'novice',
        selectHand: 'left',
        selectDisplay: 'gui',
        range: '0.6',
        conditionTrue: 'true',
        conditionFalse: 'false'
      },
      examples: {}
    }
  };

  const lang = document.documentElement.lang || 'en';
  const locale = copy[lang] || copy.en;
  locale.examples = { ...copy.en.examples, ...locale.examples };

  const modeInput = document.getElementById('imb-mode');
  const namespaceInput = document.getElementById('imb-namespace');
  const fileInput = document.getElementById('imb-file');
  const fallbackInput = document.getElementById('imb-fallback');
  const propertyInput = document.getElementById('imb-property');
  const indexInput = document.getElementById('imb-index');
  const indexField = document.querySelector('[data-imb-index-field]');
  const propertyField = document.querySelector('[data-imb-property-field]');
  const branchList = document.getElementById('imb-branch-list');
  const output = document.getElementById('imb-output');
  const summary = document.getElementById('imb-summary');
  const modeNote = document.getElementById('imb-mode-note');
  const pathPreview = document.getElementById('imb-path-preview');
  const copyButton = document.getElementById('imb-copy');
  const modeMapTitle = document.getElementById('imb-mode-map-title');
  const modeMapSummary = document.getElementById('imb-mode-map-summary');
  const modeMap = document.getElementById('imb-mode-map');
  const propertyHint = document.getElementById('imb-property-hint');
  const branchHelper = document.getElementById('imb-branch-helper');
  const nextStepsTitle = document.getElementById('imb-next-steps-title');
  const nextStepsList = document.getElementById('imb-next-steps');
  const quickstartButtons = Array.from(document.querySelectorAll('[data-imb-example]'));
  let activeScenario = 'select';

  function copyTextFallback(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  function getPropertyHintKey() {
    if (modeInput.value === 'model') return 'model';
    if (!propertyInput.value) return modeInput.value;
    return `${modeInput.value}:${propertyInput.value}`;
  }

  function getPropertyHint() {
    return locale.propertyHints[getPropertyHintKey()] || locale.propertyHints.model;
  }

  function getWhenPlaceholder(mode, index) {
    if (mode === 'condition') return index === 0 ? locale.placeholders.conditionTrue : locale.placeholders.conditionFalse;
    if (mode === 'range_dispatch') return locale.placeholders.range;
    if (propertyInput.value === 'minecraft:main_hand') return locale.placeholders.selectHand;
    if (propertyInput.value === 'minecraft:display_context') return locale.placeholders.selectDisplay;
    return locale.placeholders.selectCmd;
  }

  function updateBranchPlaceholders() {
    Array.from(branchList.querySelectorAll('.imb-branch-card')).forEach((card, index) => {
      const whenInput = card.querySelector('.imb-when');
      const modelInput = card.querySelector('.imb-model');
      if (whenInput) whenInput.placeholder = getWhenPlaceholder(modeInput.value, index);
      if (modelInput) modelInput.placeholder = locale.placeholders.branchModel;
    });
  }

  function buildBranchRow(mode, value = {}) {
    const card = document.createElement('div');
    card.className = 'imb-branch-card';
    const whenLabel = mode === 'range_dispatch' ? locale.branchThreshold : locale.branchWhen;
    card.innerHTML =
      '<div class="tool-form-grid">' +
        `<div class="tool-field"><label>${whenLabel}</label><input class="imb-when" type="text" value="${value.when || ''}"></div>` +
        `<div class="tool-field"><label>${locale.branchModel}</label><input class="imb-model" type="text" value="${value.model || ''}"></div>` +
      '</div>' +
      `<div class="imb-branch-actions"><button class="tool-button tool-button-secondary imb-remove" type="button">${locale.branchDelete}</button></div>`;
    card.querySelector('.imb-remove').addEventListener('click', () => {
      card.remove();
      update();
    });
    card.querySelectorAll('input').forEach((input) => input.addEventListener('input', update));
    return card;
  }

  function getBranchData() {
    return Array.from(branchList.querySelectorAll('.imb-branch-card')).map((card) => ({
      when: card.querySelector('.imb-when').value.trim(),
      model: card.querySelector('.imb-model').value.trim()
    })).filter((branch) => branch.model);
  }

  function populatePropertyOptions() {
    const previous = propertyInput.value;
    const options = locale.modeOptions[modeInput.value] || locale.modeOptions.model;
    propertyInput.innerHTML = options.map((option) => `<option value="${option}">${option}</option>`).join('');
    if (options.includes(previous)) propertyInput.value = previous;
    propertyField.hidden = modeInput.value === 'model';
    indexField.hidden = !(modeInput.value === 'select' && propertyInput.value === 'minecraft:custom_model_data');
  }

  function definitionObject() {
    const fallbackModel = fallbackInput.value.trim() || 'minecraft:item/paper';
    const branches = getBranchData();
    if (modeInput.value === 'model') {
      return { model: { type: 'minecraft:model', model: fallbackModel } };
    }
    if (modeInput.value === 'select') {
      const model = {
        type: 'minecraft:select',
        property: propertyInput.value,
        cases: branches.map((branch) => ({
          when: /^-?\d+(\.\d+)?$/.test(branch.when) ? Number(branch.when) : branch.when,
          model: { type: 'minecraft:model', model: branch.model }
        })),
        fallback: { type: 'minecraft:model', model: fallbackModel }
      };
      if (propertyInput.value === 'minecraft:custom_model_data') model.index = Number(indexInput.value || 0);
      return { model };
    }
    if (modeInput.value === 'range_dispatch') {
      return {
        model: {
          type: 'minecraft:range_dispatch',
          property: propertyInput.value,
          entries: branches.map((branch) => ({
            threshold: Number(branch.when || 0),
            model: { type: 'minecraft:model', model: branch.model }
          })).sort((a, b) => a.threshold - b.threshold),
          fallback: { type: 'minecraft:model', model: fallbackModel }
        }
      };
    }
    return {
      model: {
        type: 'minecraft:condition',
        property: propertyInput.value,
        on_true: { type: 'minecraft:model', model: branches[0]?.model || fallbackModel },
        on_false: { type: 'minecraft:model', model: branches[1]?.model || fallbackModel }
      }
    };
  }

  function noteForMode(mode) {
    if (mode === 'model') return locale.noteModel;
    if (mode === 'select') return locale.noteSelect;
    if (mode === 'range_dispatch') return locale.noteRange;
    return locale.noteCondition;
  }

  function renderModeMap() {
    if (!modeMap) return;
    if (modeMapTitle) modeMapTitle.textContent = locale.modeMapTitle;
    if (modeMapSummary) modeMapSummary.textContent = locale.modeMapSummary;
    modeMap.innerHTML = '';
    ['model', 'select', 'range_dispatch', 'condition'].forEach((modeKey) => {
      const cardCopy = locale.modeCards[modeKey];
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'imb-mode-card';
      button.dataset.imbMode = modeKey;
      button.innerHTML = `<strong>${cardCopy.title}</strong><span>${cardCopy.desc}</span>`;
      button.addEventListener('click', () => loadScenario(modeKey));
      modeMap.appendChild(button);
    });
  }

  function syncModeMap() {
    modeMap?.querySelectorAll('[data-imb-mode]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.imbMode === modeInput.value);
    });
  }

  function syncQuickstarts() {
    quickstartButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.imbExample === activeScenario);
    });
  }

  function updateGuidanceCards() {
    if (propertyHint) {
      const hint = getPropertyHint();
      propertyHint.innerHTML = `<strong>${hint.title}</strong><span>${hint.body}</span>`;
    }
    if (branchHelper) {
      branchHelper.innerHTML = `<strong>${locale.modeLabels[modeInput.value] || modeInput.value}</strong><span>${locale.branchHelpers[modeInput.value]}</span>`;
    }
  }

  function renderNextSteps() {
    if (!nextStepsList) return;
    if (nextStepsTitle) nextStepsTitle.textContent = locale.nextStepsTitle;
    nextStepsList.innerHTML = locale.nextSteps.map((item) => `<li>${item}</li>`).join('');
  }

  function update() {
    populatePropertyOptions();
    updateBranchPlaceholders();
    updateGuidanceCards();
    syncModeMap();
    syncQuickstarts();
    const filePath = `assets/${namespaceInput.value.trim() || 'minecraft'}/items/${fileInput.value.trim() || 'item'}.json`;
    output.value = JSON.stringify(definitionObject(), null, 2);
    const modeLabel = locale.modeLabels[modeInput.value] || modeInput.value;
    summary.textContent = locale.summary(filePath, modeLabel, getBranchData().length);
    modeNote.textContent = noteForMode(modeInput.value);
    pathPreview.textContent = filePath;
  }

  function ensureConditionRows() {
    if (modeInput.value !== 'condition') return;
    if (branchList.children.length >= 2) return;
    branchList.innerHTML = '';
    branchList.appendChild(buildBranchRow('condition', { when: 'true', model: fallbackInput.value.trim() || 'minecraft:item/paper' }));
    branchList.appendChild(buildBranchRow('condition', { when: 'false', model: fallbackInput.value.trim() || 'minecraft:item/paper' }));
  }

  function loadScenario(name) {
    const example = locale.examples[name] || locale.examples.select;
    const nextMode = example.mode || name;
    activeScenario = name;
    namespaceInput.value = example.ns || 'cubeinsquare';
    fileInput.value = example.file || 'item';
    fallbackInput.value = example.fallback || 'minecraft:item/paper';
    modeInput.value = nextMode;
    populatePropertyOptions();
    if (example.property) propertyInput.value = example.property;
    indexInput.value = typeof example.index !== 'undefined' ? example.index : 0;
    branchList.innerHTML = '';
    (example.branches || []).forEach((branch) => branchList.appendChild(buildBranchRow(nextMode, branch)));
    ensureConditionRows();
    update();
  }

  document.getElementById('imb-add-case').addEventListener('click', () => {
    branchList.appendChild(buildBranchRow(modeInput.value));
    update();
  });
  document.getElementById('imb-load-example').addEventListener('click', () => loadScenario(modeInput.value));
  document.getElementById('imb-reset').addEventListener('click', () => loadScenario('select'));
  quickstartButtons.forEach((button) => {
    button.addEventListener('click', () => loadScenario(button.dataset.imbExample));
  });

  copyButton.addEventListener('click', async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(output.value);
      } else {
        copyTextFallback(output.value);
      }
    } catch (error) {
      copyTextFallback(output.value);
    }
    const original = copyButton.textContent;
    copyButton.textContent = copyButton.dataset.copiedLabel || original;
    setTimeout(() => { copyButton.textContent = original; }, 1400);
  });

  [modeInput, namespaceInput, fileInput, fallbackInput, propertyInput, indexInput].forEach((input) => {
    input.addEventListener('input', update);
    input.addEventListener('change', update);
  });

  propertyInput.addEventListener('change', update);
  modeInput.addEventListener('change', () => {
    activeScenario = modeInput.value;
    ensureConditionRows();
    update();
  });

  renderModeMap();
  renderNextSteps();
  loadScenario('select');
})();
