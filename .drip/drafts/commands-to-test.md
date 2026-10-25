# Команды на проверку в игре

Каждая команда, которую мы добавляем или исправляем на сайте, попадает сюда. Синтаксис сверен с Minecraft Wiki
и официальными changelog, но в игре не запускался. Прогоните список на актуальной версии (26.3) и, где указано,
на старой, и отметьте результат в колонке «Итог». После проверки строку «Проверено на версиях» на странице можно
оставить как есть; если что-то не сработало — напишите, что именно игра ответила.

Как проверять: одиночный мир с читами (или сервер с правами оператора). Команды со слэшем — в чат или командный
блок; строки без слэша — в файл `.mcfunction` датапака (после правки файла `/reload`).

## Волна А: боссбары

Страницы: `/wiki-bossbar-builder/`, `/wiki-minecraft-bossbar-events/` (все 4 локали).

| # | Что запустить | Версии | Ожидаемый результат | Итог |
|---|---|---|---|---|
| A1 | Семь строк из генератора (пресет Ritual charge):<br>`/bossbar add cube:ritual_charge {"text":"Ritual charge","color":"white"}`<br>`/bossbar set cube:ritual_charge color purple`<br>`/bossbar set cube:ritual_charge style notched_10`<br>`/bossbar set cube:ritual_charge max 100`<br>`/bossbar set cube:ritual_charge value 65`<br>`/bossbar set cube:ritual_charge players @a`<br>`/bossbar set cube:ritual_charge visible true` | 26.3 и 1.21.4 | Фиолетовая шкала с 10 делениями, заполнена на 65%, заголовок «Ritual charge» белым. На обеих версиях одинаково (форма `{"text":…}` годится и для JSON, и для SNBT). | |
| A2 | Повторить первую строку `bossbar add …` ещё раз | 26.3 | Ошибка: боссбар с таким ID уже существует | |
| A3 | `/bossbar set cube:ritual_charge value 80`<br>`/bossbar set cube:ritual_charge name {"text":"The circle is complete","color":"gold"}`<br>`/bossbar set cube:ritual_charge color yellow` | 26.3 | Шкала 80%, заголовок золотой «The circle is complete», шкала жёлтая | |
| A4 | `/scoreboard objectives add ritual dummy`<br>`/scoreboard players set #offerings ritual 30`<br>`/execute store result bossbar cube:ritual_charge value run scoreboard players get #offerings ritual` | 26.3 | Шкала падает до 30% | |
| A5 | Второй игрок заходит на сервер после `players @a`, затем ещё раз `/bossbar set cube:ritual_charge players @a` | 26.3, сервер | До повтора команды второй игрок шкалу не видит, после — видит | |
| A6 | Перезапустить мир/сервер, не удаляя шкалу; затем `/bossbar list` | 26.3 | Шкала на месте после перезапуска; `list` её показывает | |
| A7 | `/bossbar remove cube:ritual_charge`, затем `/bossbar list` | 26.3 | Шкала исчезла; список пуст | |
| A8 | Файл функции со строкой, начинающейся со слэша (`/bossbar list`), затем `/reload` | 26.3 | Функция не загружается, в логе ошибка разбора | |
| A9 | `/bossbar add cube:test {text:"Short form"}` (без кавычек у ключа) | 26.3 и 1.21.4 | На 26.3 работает, на 1.21.4 — ошибка разбора JSON | |
| A10 | `/summon zombie ~ ~ ~ {Tags:["event_boss"],PersistenceRequired:1b}`<br>`/bossbar add cube:event_boss "Boss"`<br>`/bossbar set cube:event_boss players @a`<br>`/bossbar set cube:event_boss max 20`<br>`/execute store result bossbar cube:event_boss value run data get entity @e[tag=event_boss,limit=1] Health`<br>Ударить зомби и повторить последнюю строку | 26.3 | Шкала полная (20 из 20), после удара уменьшается до здоровья зомби, округлённого вниз | |

### Обратный отсчёт на командных блоках (статья о событиях, раздел «A working countdown»)

| # | Что сделать | Версии | Ожидаемый результат | Итог |
|---|---|---|---|---|
| A11 | Настройка из статьи (7 строк, таймер 1200 тиков), затем цепочка: повторяющийся блок + 4 цепных, все «Всегда активен», команды из статьи по порядку | 26.3 | Шкала убывает плавно ровно за ~60 секунд, в конце сообщение в чате, шкала удаляется, сообщение не повторяется | |
| A12 | Повторно выполнить настройку после окончания | 26.3 | Отсчёт начинается заново | |

### Обратный отсчёт в датапаке

Файлы `data/cube/function/evacuation/start.mcfunction`, `second.mcfunction`, `finish.mcfunction` — текст из статьи.

| # | Что сделать | Версии | Ожидаемый результат | Итог |
|---|---|---|---|---|
| A13 | `/reload`, затем `/function cube:evacuation/start` | 26.3 (папка `function`) | Шкала убывает раз в секунду 60→0, в конце сообщение и шкала удаляется | |
| A14 | Второй игрок заходит во время отсчёта | 26.3, сервер | Через секунду видит шкалу | |
| A15 | `/schedule clear cube:evacuation/second` во время отсчёта | 26.3 | Отсчёт останавливается, шкала замирает (удалить вручную) | |
| A16 | Те же файлы в папке `functions` | 1.20.6 | Работает так же (до 1.21 папка во множественном числе) | |

## Волна А: объединённые статьи

Страницы: `/wiki-custom-potions/#potion-contents`, `/wiki-readable-minecraft-books/#prop-types`
и FAQ там же (все 4 локали).

| # | Что запустить | Версии | Ожидаемый результат | Итог |
|---|---|---|---|---|
| A17 | `/give @p minecraft:potion[potion_contents={custom_color:11750815,custom_effects:[{id:"minecraft:speed",amplifier:1,duration:2400},{id:"minecraft:night_vision",duration:2400}]}]` | 26.3 и 1.20.5 | Бутылка цвета #B34D9F (лилово-розовая), в подсказке «Скорость II (2:00)» и «Ночное зрение (2:00)» | |
| A18 | То же, но `custom_color:0xB34D9F` | 26.3 и 1.21.4 | На 26.3 тот же цвет; на 1.21.4 ошибка разбора числа | |
| A19 | `/give @p minecraft:potion[potion_contents={custom_effects:[{id:"minecraft:night_vision",duration:-1}]}]`, выпить | 26.3 | Эффект бесконечный (в подсказке и в инвентаре ∞) | |
| A20 | Подписать книгу с пером; скопировать её на верстаке (книга + книга с пером); скопировать копию; попробовать скопировать копию копии | 26.3 | Подсказки: «Оригинал», «Копия оригинала», «Копия копии»; копию копии скопировать нельзя | |
| A21 | Дать другому игроку неподписанную книгу с пером | 26.3 | Он может открыть и изменить текст | |

## Волна Б: страницы инструментов (диалоги, книги)

Здесь проверяется не только синтаксис из текстов, но и то, что выдают сами инструменты: две находки ниже
нужно подтвердить, прежде чем менять код.

| # | Что запустить | Версии | Ожидаемый результат | Итог |
|---|---|---|---|---|
| B1 | `/title @a subtitle {"text":"Gate breach detected","color":"gold"}` и только потом `/title @a title {"text":"WARNING","color":"red"}` | 26.3 | После первой команды на экране ничего; после второй — заголовок с подзаголовком | |
| B2 | Дизайнер сообщений (страница диалогов): пресет Court verdict с hover-текстом и командой по клику, скопировать `/tellraw` | 1.21.4 и 26.3 | **Находка:** инструмент пишет `hoverEvent`/`clickEvent`. Ожидаем: на 1.21.4 наведение и клик работают; на 26.3 текст есть, наведения и клика нет | |
| B3 | Тот же `/tellraw`, вручную заменить на `"hover_event":{"action":"show_text","value":"Open the evidence chest"}` и `"click_event":{"action":"run_command","command":"/warp court"}` | 26.3 | Наведение и клик работают | |
| B4 | Компонент с обоими вариантами сразу (`hoverEvent` и `hover_event`, `clickEvent` и `click_event`) | 1.21.4 и 26.3 | Если работает на обеих версиях без ошибки — инструмент можно перевести на двойную запись. Если на одной из них ошибка — нужен переключатель версии | |
| B5 | Конструктор книг, режим «1.20.5+ Components», подписанная книга из двух страниц с пробелами в тексте | 1.21.4 и 26.3 | **Находка:** страницы выводятся как `{"raw":"текст"}` — формат 1.21.5+. Ожидаем: на 26.3 книга открывается с текстом; на 1.21.4 — ошибка или пустые/сломанные страницы | |
| B6 | Тот же конструктор, «Writable book» (книга с пером) | 1.21.4 и 26.3 | Работает на обеих: у книги с пером страницы — обычные строки | |

## Волна Б: генератор датапака (исправлен pack.mcmeta)

| # | Что сделать | Версии | Ожидаемый результат | Итог |
|---|---|---|---|---|
| B7 | Генератор датапака: версия 26.3, скачать ZIP, положить в `saves/<мир>/datapacks/`, `/reload`, `/datapack list` | 26.3 | Пак в списке включённых, без пометки «несовместим»; в `pack.mcmeta` стоят `min_format: 121` и `max_format: 121` | |
| B8 | То же для версии 1.21.4 | 1.21.4 | Пак включён; в `pack.mcmeta` `pack_format: 61` | |
| B9 | Старый ZIP с `pack_format: 121` без `min_format` (как выдавал генератор до исправления) | 26.3 | Для сравнения: пак не включается или помечен несовместимым — это и была ошибка | |

## Волна Б: страницы генераторов лута и рецептов

| # | Что запустить | Версии | Ожидаемый результат | Итог |
|---|---|---|---|---|
| B10 | Таблица лута из пресета Dungeon chest в датапаке, `/reload`, затем `/loot give @s loot harbor:harbor_dungeon` раз двадцать | 26.3 | Каждый раз 2–4 стака; железо заметно чаще золота, алмаз редко (≈6% на выбор) | |
| B11 | `/setblock ~ ~1 ~ minecraft:chest{LootTable:"harbor:harbor_dungeon"}`, открыть сундук | 26.3 | В сундуке лут из таблицы | |
| B12 | `/summon minecraft:zombie ~ ~ ~ {DeathLootTable:"harbor:harbor_guard"}` (таблица из пресета Rare mob drop), убить несколько раз | 26.3 | Меч «Guard blade» выпадает примерно в 15% случаев | |
| B13 | Рецепт из пресета Shaped craft, `/reload`, скрафтить; затем открыть книгу рецептов; затем `/recipe give @s harbor:reinforced_block` | 26.3 | Крафт работает сразу; в книге рецепт появляется только после `/recipe give` | |
| B14 | Файл `data/minecraft/recipe/torch.json` с другим рецептом | 26.3 | Ванильный рецепт факела заменён | |
| B15 | Рецепт с версией 1.20.5 в генераторе (путь `recipes/`, поле `id`) | 1.20.6 | Работает; та же форма на 26.3 тоже грузится или даёт ошибку в логе — записать, что именно | |

## Волна Б: рандомайзер зачарований и атрибутов (исправлен вывод)

До исправления «Modern (1.20.5+)» писал `enchantments={levels:…}`, `generic.`-атрибуты и обёртку
`{modifiers:…,show_in_tooltip:true}`; теперь у него три ветки версий. Проверьте по одной команде из каждой.

| # | Что запустить | Версии | Ожидаемый результат | Итог |
|---|---|---|---|---|
| B16 | `/give @p minecraft:iron_sword[minecraft:enchantments={"minecraft:sharpness":3},minecraft:attribute_modifiers=[{type:"minecraft:attack_damage",id:"harbor:roll_0",amount:4,operation:"add_value",slot:"mainhand"}]] 1` (ветка 1.21.5 – 26.x) | 26.3 | Меч с «Острота III» и +4 к урону в подсказке | |
| B17 | `/give @p minecraft:iron_sword[minecraft:enchantments={levels:{"minecraft:sharpness":3}},minecraft:attribute_modifiers={modifiers:[{type:"minecraft:attack_damage",id:"harbor:roll_0",amount:4,operation:"add_value",slot:"mainhand"}]}] 1` (ветка 1.21.2 – 1.21.4) | 1.21.4 | То же | |
| B18 | Та же команда, что B17, но `type:"minecraft:generic.attack_damage"` (ветка 1.21 – 1.21.1) | 1.21.1 | То же | |
| B19 | Команда из B17 на 26.3 | 26.3 | Для сравнения: ошибка разбора — поэтому нужны отдельные ветки | |
| B20 | `/give @p minecraft:iron_sword[minecraft:enchantments={"minecraft:vanishing_curse":1}] 1` | 26.3 | Проклятие утраты в подсказке (раньше инструмент писал несуществующий `curse_of_vanishing`) | |

## Волна Б: достижения, рандомайзер, item_model

| # | Что запустить | Версии | Ожидаемый результат | Итог |
|---|---|---|---|---|
| B21 | `/give @p minecraft:diamond_sword[minecraft:attribute_modifiers=[{type:"minecraft:luck",id:"harbor:roll_0",amount:2,operation:"add_value",slot:"mainhand"}]] 1`, ударить моба | 26.3 | В подсказке нет урона меча (+2 удачи); удар как пустой рукой — встроенные модификаторы заменены | |
| B22 | Достижение-ребёнок с `"hidden": true` и ещё одним ребёнком под ним; открыть экран достижений | 26.3 | Ни скрытого, ни его потомка не видно, пока скрытое не выполнено | |
| B23 | Достижение с несуществующим `parent`, `/reload` | 26.3 | Не загружается (в логе ошибка), в экране его нет | |
| B24 | Конструктор item_model, пресет Selected… / select по custom_model_data, ветка `novice`; пак с моделью; `/give @p minecraft:book[item_model="cubeinsquare:book/formulary",custom_model_data={strings:["novice"]}]` | 26.3 и 1.21.4 | Книга с моделью ветки novice на обеих версиях | |
| B25 | Ветка select со значением `1` и `custom_model_data={strings:["1"]}` | 26.3 | Срабатывает (раньше инструмент писал `"when": 1` числом, и ветка не совпадала) | |
