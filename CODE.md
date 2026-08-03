# Архитектура md2html

**Назначение:** конвертер архива аудиозаписей Шрилы Шридхара Махараджа из Markdown-файлов (с YAML-метаданными) в JSON-коллекции для импорта в MongoDB.

---

## Источник данных

- **`node_modules/sridhar-maharaj-archive`** — внешний npm-пакет (`scsm-ua/sridhar-maharaj-archive`) — исходный контент: Markdown-файлы постов, сносок (`notes/`), а также JSON-справочники `categories.json`, `tags.json`, `footnotes.json`.
- **`fixtures/years.json`** — список допустимых годов для группировки.

---

## Gulp-пайплайны (gulpfile.js)

| Задача | Описание |
|---|---|
| `build-json` | `clean-json` → `text-json` → `ftn-json` → `build-tags` → `build-grouped` |
| `update-source` | `yarn upgrade archive` — обновление архива |

Каждый `gulp.task` создаёт Node.js `Transform`-стрим, который обрабатывает файлы поштучно через `.pipe()`.

---

## Поток обработки постов

```
.md файлы (YAML + Markdown)
        │
        ▼
 convertTextFiles()        ← scripts/text2html.js
        │
        ▼
   text2html()
        │
        └── new ToJSON(...)
                │
                ▼
         BasicConvertor (конструктор)
          ├── yaml.parse(rawMeta)      — парсинг YAML-шапки
          ├── extractNotes()           — отделяет сноски от основного текста
          ├── processFootnotes(slug)   — строит JSON сносок
          ├── extractText(textParser)  — MarkedJS → HTML основного текста
          ├── processMeta(meta)        — нормализует метаданные
          └── processTitle()           — очищает заголовок (убирает номер, переставляет код записи)
                │
                ▼
         convertor.convert()  → строка JSON
```

---

## Классы

### `BasicConvertor` (scripts/classes/BasicConvertor.js)
Абстрактный базовый класс. Парсит и нормализует содержимое `.md` файла:
- **`extractText()`** — отрезает блок сносок, прогоняет основной текст через MarkedJS, форматирует HTML.
- **`extractNotes()`** — вычленяет блок сносок `[^_ftn...]`.
- **`processMeta()`** — из YAML-данных формирует `MetaProcessed`: извлекает дату из заголовка или тегов, определяет `audioSrc`, устанавливает `language: 'ru'`, `updated`.
- **`processTitle()`** — убирает порядковый номер статьи (`"131. Заголовок"`) и переставляет код записи в начало.
- **`extractYear(date)`** — статический метод, проверяет год в диапазоне 1973–1987.
- **`processFootnotes()`** — абстрактный метод (переопределяется подклассами).

### `ToJSON` (scripts/classes/ToJSON.js)
Наследует `BasicConvertor`. Генерирует структурированный JSON для API.
- **`processFootnotes()`** — сопоставляет сноски из `footnotesByFile` с их позициями в тексте.
- **`mapFootnote()`** — статический метод, строит объект `FootnoteItemHtml` с `name`, `slug`, `text`, `title`.
- **`convert()`** — возвращает `JSON.stringify({meta, title, text, footnotes})`.

### `FootnotesConvertor` (scripts/classes/FootnotesConvertor.js)
Обрабатывает отдельные `.md`-файлы из папки `notes/` (общие сноски/статьи-глоссарий).
- **`validateMeta()`** — проверяет наличие `slug` и `refs`.
- **`convert()`** — возвращает JSON `{meta, text}`.

### `YearRecord` / `MonthRecord` / `YearCatalog` (scripts/classes/YearCatalog.js)
Структуры данных для группировки постов по годам и месяцам. `YearRecord` хранит заранее инициализированную карту 13 месяцев (00–12, где 00 = неизвестный).

---

## Вспомогательные модули

| Файл | Назначение |
|---|---|
| `scripts/markedExt.js` | Кастомные рендереры для MarkedJS: ссылки-сноски → `<a>`, стихи → `<div class="Article__verse">`, временны́е метки `#...#` → `<em data-type="time">`, подавление `<h1>`, pre/post-процессинг для стихов со сносками |
| `scripts/textValidation.js` | Валидация: `validateMeta()` — проверяет поля + известные категории/теги; `validateText()` — ищет непреобразованные сноски; `validateHtml()` — прогоняет HTML через `html-validate` |
| `scripts/groupPostsByYears.js` | Gulp-трансформ: читает `posts.json`, группирует посты по годам/месяцам через `YearRecord`, сохраняет краткие `PostShort` объекты |
| `scripts/convertTags.js` | Преобразует `{slug: name}` объект в массив `[{name, slug}]` |
| `scripts/helpers.js` | `getDictionaries()` — загружает категории/теги/сноски из архива; `toIsoDateWithTimezone()` — форматирует дату; утилиты для id-сносок |
| `scripts/const.js` | Константы: пути (`DIRS`, `FILES`), glob-паттерны (`GLOBS`), регулярные выражения (`REGEXP`) |
| `scripts/types.js` | JSDoc-типы: `Post`, `PostShort`, `MetaParsed`, `MetaProcessed`, `Dictionaries`, `FootnoteRef` и др. |

---

## Выходные данные

```
output/
  json/
    posts.json        ← все посты в одном массиве
    footnotes.json    ← все сноски
    years-grouped.json ← посты сгруппированы по годам/месяцам
    categories.json   ← нормализованный справочник категорий
    tags.json         ← нормализованный справочник тегов
```
