/* Posts */

/**
 * @typedef {Object} FootnoteRef
 * @property {string} raw
 * @property {string} slug
 */

/**
 * @typedef {Object} Link
 * @property {string} href - rather path, e.g. "/en/file_123.rtf"
 * @property {string} title
 */

/**
 * @typedef {Object} Tag
 * @property {string} slug
 * @property {string} title
 */

/**
 *  @typedef {Object} MetaParsed
 *  @property {string} author - "Шрила Бхакти Ракшак Шридхар Дев-Госвами Махарадж"
 *  @property {string} category - category slug
 *  @property {string} slug
 *  @property {Array<Link>} links
 *  @property {Array<Tag>} tags
 */

/**
 *  @typedef {Object} MetaProcessed
 *  @property {string} author - "Шрила Бхакти Ракшак Шридхар Дев-Госвами Махарадж"
 *  @property {string | null} audioSrc - "/ru/file_123.mp3"
 *  @property {string} category - category slug
 *  @property {string} slug
 *  @property {string | null} date - "1982-01-25" or "1982-01"
 *  @property {string} language - "ru"
 *  @property {string} updated - "2024-10-16T07:36:17+03:00"
 *  @property {Array<string> | null} tags
 *  @property {string | null} year - "1973"
 */

/* Dictionaries */

/**
 * @typedef {Object} Dictionaries
 * @property {Array<string>} categories - slugs of the categories.
 * @property {Array<FootnotesByFile>} footnotesByFile
 * @property {Array<string>} tags - slugs of the tags.
 */

/**
 * @typedef {Object} FootnotesByFile
 * @property {string} path - the post file path.
 * @property {Array<FootnoteItem>} items
 */

/**
 * @typedef {Object} FootnoteItem
 * @property {string} name - "_ftn5".
 * @property {string} [title] - "Шримад-Бхагаватам 10.47.61".
 * @property {string} text - Markdown text.
 */

/**
 * @typedef {Object} FootnoteItemHtml
 * @property {string} name - "_ftn5".
 * @property {string} [slug] - slug of the sloka.
 * @property {string} [title] - "Шримад-Бхагаватам 10.47.61".
 * @property {string} text - HTML string.
 */
