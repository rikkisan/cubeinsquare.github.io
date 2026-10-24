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
