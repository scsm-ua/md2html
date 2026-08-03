# Markdown to Html

## Main update flow

    npm run build:json

### DB import

    cd import
    sh import-collections.sh

## Description

Цель репозитория - конвертация исходников *Хари-катхи* (из файлов формата `Markdown`) в коллекцию `MongoDB`.

Исходные файлы *катхи* находятся в репозитории [Sridhar Maharaj Archive](https://github.com/scsm-ua/sridhar-maharaj-archive).

## Требования к работе с репо
- `node.js v >=20`
- `git`
- `yarn` или `npm` (потребует модификации скрипта `update-source`).

## Основные скрипты

### `update-source`

Удаляет папку со скаченными исходниками (если есть) и устанавливает свежие из ветки `main` репозитория-архива. Исходники устанавливаются как `node` модуль.

### `build-json`

Конвертирует исходники в `json` файлы коллекций 
- `posts.json`
- `categories.json`
- `tags.json`.

Файлы сохраняются в папку `output/json`. Выполнение скрипта сопровождается валидацией категорий и тэгов, указанных в отдельно взятом посте, а также валидацией `html` разметки текстов. Результаты валидации выводятся в терминал.

