/**/
const PROJECT_ROOT_DIR = process.cwd();

/**/
const PATH = {
  ARCHIVE_PATH: '/node_modules/archive/docs'
};

/**/
const DIRS = {
  ARCHIVE: PROJECT_ROOT_DIR + PATH.ARCHIVE_PATH,
  INPUT: PROJECT_ROOT_DIR + PATH.ARCHIVE_PATH + '/ru',
  OUTPUT: PROJECT_ROOT_DIR + '/output',
  JSON_OUTPUT: PROJECT_ROOT_DIR + '/output/json',
  HTML_OUTPUT: PROJECT_ROOT_DIR + '/output/html',
  TEST_OUTPUT: PROJECT_ROOT_DIR + '/output/test',
  STYLES: PROJECT_ROOT_DIR + '/styles'
};

/**/
const FILES = {
  ARCHIVE: {
    CATEGORIES: 'categories.json',
    TAGS: 'tags.json'
  },
  COLLECTIONS: {
    POSTS: 'posts.json'
  },
  STYLES: {
    CSS: 'styles.css'
  }
};

/**/
const REGEXP = {
  DATE_REGEXP: /^([1-2]\d{3})[.-]([01]\d)([.-]([0-3]\d))?$/,
  FOOTNOTE_REGEXP: /^\[\^_ftn(\d+)]:/, // Footnote [^_ftn1234]:
  FOOTNOTE_LINK_REGEXP: /\[\^_ftn(\d+)]/g, // Footnote link [^_ftn1234]
  FOOTNOTES_BEGINNING_REGEXP: /\n\[\^_ftn(\d+)]:/,
  VERSE_FOOTNOTE_REGEXP: /\n\[\^_ftn(\d+)]/g
};

/**/
module.exports = {
  DIRS,
  FILES,
  PATH,
  REGEXP
}
