/* Posts */

/**
 * @typedef {Object} Post
 * @property {Array<FootnoteItemHtml>} footnotes
 * @property {string} id
 * @property {MetaProcessed} meta
 * @property {string} text
 * @property {string} title
 */

/**
 * @typedef {Object} PostShort
 * @property {{ src: string, bytes: number, duration: string } | null} audio
 * @property {string} author
 * @property {string | null} category
 * @property {string} date
 * @property {string} id
 * @property {string} language
 * @property {string | null} record_id
 * @property {string} slug
 * @property {string[]} tags
 * @property {string} title
 * @property {string | null} topic_idx
 * @property {string | null} year
 */

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
 *  @property {{ src: string, bytes: number, duration: string } | null} audio
 *  @property {{ title: string, slug: string } | null} category
 *  @property {string | null} date - "1982-01-25" or "1982-01"
 *  @property {{ index: string } | null} [legacy]
 *  @property {string | null} lang - "ru"
 *  @property {string | null} record_id
 *  @property {string} slug
 *  @property {Array<Tag>} tags
 *  @property {string | null} [title]
 */

/**
 *  @typedef {Object} MetaProcessed
 *  @property {string} author - "Шрила Бхакти Ракшак Шридхар Дев-Госвами Махарадж"
 *  @property {{ src: string, bytes: number, duration: string } | null} audio
 *  @property {string | null} category - category slug
 *  @property {string | null} record_id
 *  @property {string} slug
 *  @property {string | null} topic_idx
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
 * @property {string} name - "ftn5".
 * @property {string} [slug] - slug of the sloka.
 * @property {string} [title] - "Шримад-Бхагаватам 10.47.61".
 * @property {string} text - HTML string.
 */

/* Fixtures */

/**
 * @typedef {Object} Year
 * @property {string} description
 * @property {string} imageFile
 * @property {number} postCount
 * @property {number} value
 */

// /* Years grouped */
//
// /**
//  * @typedef {Object} YearCatalog
//  * @property {string | null} year
//  * @property {Array<MonthRecord>} months
//  */

// /**
//  * @typedef {Object} MonthRecord
//  * @property {Month} month
//  * @property {Array<PostShort>} records
//  */
