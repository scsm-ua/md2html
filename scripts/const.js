/**/
const PROJECT_ROOT_DIR = process.cwd();

/**/
const PATH = {
  ARCHIVE_PATH: '/node_modules/archive/docs',
  ARCHIVE_ROOT_PATH: PROJECT_ROOT_DIR + '/node_modules/archive'
};

/**/
const DIRS = {
  ARCHIVE: PROJECT_ROOT_DIR + PATH.ARCHIVE_PATH,
  INPUT: PROJECT_ROOT_DIR + PATH.ARCHIVE_PATH + '/ru',
  OUTPUT: PROJECT_ROOT_DIR + '/output',
  JSON_OUTPUT: PROJECT_ROOT_DIR + '/output/json',
  HTML_OUTPUT: PROJECT_ROOT_DIR + '/output/html',
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
  }
};

/**/
const REGEXP = {
  DATE_REGEXP: /^([1-2]\d{3})[.-]([01]\d)([.-]([0-3]\d))?$/,
  FOOTNOTE_REGEXP: /\[\^_ftn(\d+)]:/, // Footnote [^_ftn1234]:
  FOOTNOTE_LINK_REGEXP: /\[\^_ftn(\d+)]/ // Footnote link [^_ftn1234]
};

/**/
module.exports = {
  DIRS,
  FILES,
  PATH,
  REGEXP
}
