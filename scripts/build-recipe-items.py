"""Build the recipe generator's item library (assets/recipe-items*.js) from a Minecraft client jar.

Usage: python -I scripts/build-recipe-items.py <jar_dir> <dl_dir> <out_dir>

  jar_dir  the client jar of the newest supported version, unzipped (at least assets/minecraft/items/,
           models/block/, models/item/, textures/item/, textures/block/, textures/entity/ and
           lang/en_us.json; unzip patterns do not recurse, so list the model and entity folders).
  dl_dir   items_<version>.json for each entry of VERSIONS below: PrismarineJS
           data/pc/<dir>/items.json (dataPaths.json maps versions to dirs), or a plain JSON list of
           ids from the InventivetalentDev/minecraft-assets <branch>/assets/minecraft/items folder for
           versions PrismarineJS lacks; plus lang_ru_ru.json, lang_fr_fr.json, lang_de_de.json from
           that mirror.
  out_dir  where recipe-items.js and recipe-items-<ru|fr|de>.js are written; copy them to assets/.

For a new game version: add its tool id to VERSIONS (and the version select in
assets/recipe-generator.js), use its jar, point textureBase at its mirror branch, and check that every
icon path exists on that branch. First built 2026-11-20 from the 26.3 jar.
"""
import json
import os
import sys

JAR, DL, OUT = sys.argv[1:4]
MC = os.path.join(JAR, 'assets', 'minecraft')

# Tool version ids in release order, and the list each one is read from.
VERSIONS = [
    ('1.20', 'items_1.20.json'),
    ('1.20.5', 'items_1.20.5.json'),
    ('1.21', 'items_1.21.1.json'),
    ('1.21.2', 'items_1.21.3.json'),
    ('1.21.4', 'items_1.21.4.json'),
    ('1.21.5', 'items_1.21.5.json'),
    ('1.21.6', 'items_1.21.6.json'),
    ('1.21.7', 'items_1.21.8.json'),
    ('1.21.9', 'items_1.21.9.json'),
    ('1.21.11', 'items_1.21.11.json'),
    ('26.1', 'items_26.1.json'),
    ('26.2', 'items_26.2.json'),
]


def load_names(path):
    data = json.load(open(os.path.join(DL, path), encoding='utf-8'))
    return [x['name'] if isinstance(x, dict) else x for x in data]


version_sets = [(v, set(load_names(f))) for v, f in VERSIONS]
order_source = load_names('items_26.1.json')  # registry order, close to the creative inventory

items_26_3 = sorted(f[:-5] for f in os.listdir(os.path.join(MC, 'items')) if f.endswith('.json'))
items_26_3 = [i for i in items_26_3 if i != 'air']


VERSION_IDS = [v for v, _ in VERSIONS] + ['26.3']
# The registry lists items of experimental drops before they ship. Move them to the version that
# enabled them by default: Update 1.21 content sat behind an experiment in 1.20.5, the bundle until
# 1.21.2, the pale garden until 1.21.4.
REAL_1_20_5 = {'short_grass', 'turtle_scute', 'armadillo_scute', 'wolf_armor', 'armadillo_spawn_egg'}


def since_index(item):
    found = len(VERSIONS)  # new in 26.3
    for index, (_, names) in enumerate(version_sets):
        if item in names:
            found = index
            break
    version = VERSION_IDS[found]
    if version == '1.20.5' and item not in REAL_1_20_5:
        version = '1.21'
    if item == 'bundle':
        version = '1.21.2'
    if version == '1.21.2' and (item.startswith('pale_') or item in ('creaking_heart', 'creaking_spawn_egg')):
        version = '1.21.4'
    return VERSION_IDS.index(version)


# --- texture resolution ---------------------------------------------------------------------

def read_json(path):
    try:
        return json.load(open(path, encoding='utf-8'))
    except (OSError, ValueError):
        return None


def model_ref(node):
    """First plain model id inside an item model definition (fallback branches first)."""
    if isinstance(node, str):
        return node
    if not isinstance(node, dict):
        return None
    kind = str(node.get('type', '')).replace('minecraft:', '')
    if kind == 'model':
        return node.get('model')
    if kind == 'special':
        return node.get('base')
    if kind in ('select', 'range_dispatch'):
        for key in ('fallback',):
            found = model_ref(node.get(key))
            if found:
                return found
        for entry in node.get('cases', []) + node.get('entries', []):
            found = model_ref(entry.get('model'))
            if found:
                return found
        return None
    if kind == 'condition':
        return model_ref(node.get('on_false')) or model_ref(node.get('on_true'))
    if kind == 'composite':
        for part in node.get('models', []):
            found = model_ref(part)
            if found:
                return found
    for key in ('model', 'fallback'):
        if key in node:
            found = model_ref(node[key])
            if found:
                return found
    return None


def model_path(model_id):
    name = model_id.split(':', 1)[-1]
    return os.path.join(MC, 'models', *name.split('/')) + '.json'


def collect_textures(model_id, depth=0):
    if not model_id or depth > 12:
        return {}
    data = read_json(model_path(model_id))
    if not data:
        return {}
    textures = collect_textures(data.get('parent'), depth + 1)
    textures.update(data.get('textures', {}))
    return textures


PRIORITY = ['layer0', 'all', 'front', 'north', 'side', 'top', 'up', 'texture', 'end', 'cross', 'plant',
            'pattern', 'wool', 'content', 'body', 'flowerbed', 'stem', 'particle']


def pick_texture(textures):
    def resolve(value, depth=0):
        while isinstance(value, str) and value.startswith('#') and depth < 8:
            value = textures.get(value[1:])
            depth += 1
        return value if isinstance(value, str) else None

    first = resolve(textures.get('layer0'))
    second = resolve(textures.get('layer1'))
    # A tinted overlay or arrow head as layer0 hides what the item is; the bottle or shaft is layer1.
    if first and second and first.endswith(('_overlay', '_head')):
        return second.split(':', 1)[-1]
    for key in PRIORITY + sorted(textures):
        value = resolve(textures.get(key))
        if value:
            return value.split(':', 1)[-1]
    return None


def texture_exists(path):
    return os.path.isfile(os.path.join(MC, 'textures', *path.split('/')) + '.png')


DYES = {
    'white': '#f9fffe', 'orange': '#f9801d', 'magenta': '#c74ebd', 'light_blue': '#3ab3da',
    'yellow': '#fed83d', 'lime': '#80c71f', 'pink': '#f38baa', 'gray': '#474f52',
    'light_gray': '#9d9d97', 'cyan': '#169c9c', 'purple': '#8932b8', 'blue': '#3c44aa',
    'brown': '#835432', 'green': '#5e7c16', 'red': '#b02e26', 'black': '#1d1d21',
}

# Entity-drawn items have no flat texture: show one face cropped from the entity texture.
# p = texture path, c = crop [x, y, w, h], s = texture size [w, h], t = dye tint (multiplied in).
SPECIAL = {
    'skeleton_skull': {'p': 'entity/skeleton/skeleton', 'c': [8, 8, 8, 8], 's': [64, 32]},
    'wither_skeleton_skull': {'p': 'entity/skeleton/wither_skeleton', 'c': [8, 8, 8, 8], 's': [64, 32]},
    'player_head': {'p': 'entity/player/wide/steve', 'c': [8, 8, 8, 8], 's': [64, 64]},
    'zombie_head': {'p': 'entity/zombie/zombie', 'c': [8, 8, 8, 8], 's': [64, 64]},
    'creeper_head': {'p': 'entity/creeper/creeper', 'c': [8, 8, 8, 8], 's': [64, 32]},
    'piglin_head': {'p': 'entity/piglin/piglin', 'c': [8, 8, 10, 8], 's': [64, 64]},
    'dragon_head': {'p': 'entity/enderdragon/dragon', 'c': [192, 60, 16, 16], 's': [256, 256]},
    'shield': {'p': 'entity/shield/shield_base', 'c': [14, 1, 12, 22], 's': [64, 64]},
    'chest': {'p': 'entity/chest/normal', 'c': [14, 33, 14, 10], 's': [64, 64]},
    'trapped_chest': {'p': 'entity/chest/trapped', 'c': [14, 33, 14, 10], 's': [64, 64]},
    'ender_chest': {'p': 'entity/chest/ender', 'c': [14, 33, 14, 10], 's': [64, 64]},
}
for dye, tint in DYES.items():
    SPECIAL[dye + '_banner'] = {'p': 'entity/banner/banner_base', 'c': [1, 1, 20, 40], 's': [64, 64], 't': tint}


def png_size(path):
    with open(path, 'rb') as f:
        head = f.read(24)
    return int.from_bytes(head[16:20], 'big'), int.from_bytes(head[20:24], 'big')


def special_for(item):
    spec = SPECIAL.get(item)
    if not spec:
        return None
    if not texture_exists(spec['p']):
        raise SystemExit(f'missing entity texture for {item}: {spec["p"]}')
    real = list(png_size(os.path.join(MC, 'textures', *spec['p'].split('/')) + '.png'))
    if real != spec['s']:
        raise SystemExit(f'{item}: {spec["p"]} is {real}, expected {spec["s"]}')
    return spec


def texture_for(item):
    if item.endswith('_bed') and texture_exists(f'block/{item}_head_up'):
        return f'block/{item}_head_up'
    definition = read_json(os.path.join(MC, 'items', item + '.json')) or {}
    ref = model_ref(definition.get('model'))
    tex = pick_texture(collect_textures(ref)) if ref else None
    if tex and texture_exists(tex):
        return tex
    for guess in ('item/' + item, 'block/' + item):
        if texture_exists(guess):
            return guess
    return tex if tex and texture_exists(tex) else None


# --- names ----------------------------------------------------------------------------------

def lang(path):
    return json.load(open(path, encoding='utf-8'))


EN = lang(os.path.join(MC, 'lang', 'en_us.json'))
LANGS = {code: lang(os.path.join(DL, f'lang_{code}.json')) for code in ('ru_ru', 'fr_fr', 'de_de')}


def name_in(table, item):
    for key in (f'item.minecraft.{item}', f'block.minecraft.{item}'):
        if key in table:
            return table[key]
    return None


# --- build ----------------------------------------------------------------------------------

rank = {name: i for i, name in enumerate(order_source)}
items_26_3.sort(key=lambda i: (rank.get(i, 10 ** 6), i))

rows, missing_tex, missing_name = [], [], []
for item in items_26_3:
    special = special_for(item)
    tex = special['p'] if special else texture_for(item)
    if not tex:
        missing_tex.append(item)
    if tex == 'item/' + item:
        tex_code = ''
    elif tex == 'block/' + item:
        tex_code = '='
    else:
        tex_code = tex or '-'
    if special:
        tex_code = special
    en = name_in(EN, item)
    if not en:
        missing_name.append(item)
    rows.append([item, tex_code, since_index(item), en or item.replace('_', ' ')])

versions = [v for v, _ in VERSIONS] + ['26.3']
header = ('/* Item library for the recipe generator: every item of Minecraft 26.3 with its icon texture,\n'
          '   the first version that has it, and its English name. Built from the 26.3 client jar and the\n'
          '   PrismarineJS item lists; textures load from the InventivetalentDev/minecraft-assets 26.3 mirror.\n'
          '   Row: [id, texture ("" = item/<id>, "=" = block/<id>, "-" = none, else a path), since, name]. */\n')
payload = {
    'textureBase': 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/26.3/assets/minecraft/textures/',
    'versions': versions,
    'items': rows,
}
with open(os.path.join(OUT, 'recipe-items.js'), 'w', encoding='utf-8', newline='\n') as f:
    f.write(header + 'window.RECIPE_ITEM_LIBRARY = ' + json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + ';\n')

for code, table in LANGS.items():
    short = code[:2]
    names = {}
    for item, *_ in rows:
        local = name_in(table, item)
        if local and local != name_in(EN, item):
            names[item] = local
    with open(os.path.join(OUT, f'recipe-items-{short}.js'), 'w', encoding='utf-8', newline='\n') as f:
        f.write(f'/* {short} item names for the recipe generator library, from the Minecraft 26.3 {code} language file. */\n')
        f.write('window.RECIPE_ITEM_NAMES = ' + json.dumps(names, ensure_ascii=False, separators=(',', ':')) + ';\n')

print('items', len(rows), 'no texture', len(missing_tex), missing_tex[:40])
print('no name', len(missing_name), missing_name[:20])
from collections import Counter
print('since', Counter(versions[r[2]] for r in rows))
print('new in 26.3 sample', [r[0] for r in rows if r[2] == len(VERSIONS)][:30])
