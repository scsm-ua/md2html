# Markdown to Html

Цель репозитория - конвертация исходников *Хари-катхи* (из файлов формата `Markdown`) в коллекцию `MongoDB`.

Исходные файлы *катхи* находятся в репозитории [Sridhar Maharaj Archive](https://github.com/scsm-ua/sridhar-maharaj-archive).

## Требования к работе с репо
- `node.js v >=20`
- `git`
- `yarn` или `npm` (потребует модификации скрипта `update-source`).

## Основные скрипты

### `update-source`

Удаляет папку со скаченными исходниками (если есть) и устанавливает свежие из ветки `main` репозитория-архива. Исходники устанавливаются как `node` модуль.

### `build-html`

Конвертирует исходники в `html` файлы, папка `output/html`. Предназначется для визуальной оценки и контроля внешнего вида постов.

Выполнение скрипта сопровождается валидацией `html` файлов. Результаты валидации выводятся в терминал.

### `build-json`

Конвертирует исходники в `json` файлы коллекций 
- `posts.json`
- `categories.json`
- `tags.json`.

Файлы сохраняются в папку `output/json`. Выполнение скрипта, как и выполнение `build-html`, сопровождается валидацией категорий и тэгов, указанных в отдельно взятом посте. Результаты валидации выводятся в терминал.

### `html-test`

Конвертирует указанный исходный файл(ы) в `html`, в папку `output/test`. Полезен для изучения отдельных недоразумений. 

## ToDo
- Убрать даты из тегов и сделать отдельной коллекцией.

## DB import

cd import
sh import-collections.sh