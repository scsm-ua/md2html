/**/
const PROJECT_ROOT_DIR = process.cwd();

/**/
const PATH = {
  ARCHIVE_PATH: '/node_modules/sridhar-maharaj-archive/docs'
};

/**/
const DIRS = {
  ARCHIVE: PROJECT_ROOT_DIR + PATH.ARCHIVE_PATH,
  FIXTURES: PROJECT_ROOT_DIR + '/fixtures',
  INPUT: {
    FOOTNOTES_FILE: PROJECT_ROOT_DIR + '/node_modules/sridhar-maharaj-archive/scripts/footnotes.json',
    ROOT: PROJECT_ROOT_DIR + PATH.ARCHIVE_PATH + '/ru',
  },
  OUTPUT: {
    JSON: PROJECT_ROOT_DIR + '/output/json',
  }
};

/**/
const FILES = {
  ARCHIVE: {
    CATEGORIES: 'categories.json',
    TAGS: 'tags.json'
  },
  COLLECTIONS: {
    FOOTNOTES: 'footnotes.json',
    POSTS: 'posts.json',
    SHLOKAS: 'shlokas.json',
    YEARS: 'years.json',
    YEAR_GROUPED: 'years-grouped'
  }
};

/**/
const GLOBS = {
  NOTES: DIRS.INPUT.ROOT + '/notes/**/*.md',
  SHLOKAS: DIRS.INPUT.ROOT + '/notes/**/*.md',
  POSTS: [
    DIRS.INPUT.ROOT + '/**/*.md',
    '!' + DIRS.INPUT.ROOT + '/notes/**',
    '!' + DIRS.INPUT.ROOT + '/old/**'
  ]
};

/**/
const REGEXP = {
  DATE_REGEXP: /^([1-2]\d{3})[.-]([01]\d)([.-]([0-3]\d))?$/,
  FULL_DATE_REGEXP: /(19[78]\d\.[01]\d\.[0-3]\d)\.\w/,

  FOOTNOTE_LINK_REGEXP: /\[\^([^\]]+)]/g, // Footnote link [^_ftn1234] [^1234]
  FOOTNOTES_BEGINNING_REGEXP: /\n\[\^[^\]]+]:/,
  VERSE_FOOTNOTE_REGEXP: /\n\[\^[^\]]+]/g,
  FOOTNOTE_PATH: /\(([^\)]+\.md)\)$/, // Link to footnote file inside of footnote text.
};

/**/
module.exports = {
  DIRS,
  FILES,
  GLOBS,
  PATH,
  REGEXP
}
