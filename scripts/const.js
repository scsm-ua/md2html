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
    TEST: PROJECT_ROOT_DIR + '/test',
  },
  OUTPUT: {
    HTML: {
      NOTES: PROJECT_ROOT_DIR + '/output/html/notes',
      ROOT: PROJECT_ROOT_DIR + '/output/html'
    },
    JSON: PROJECT_ROOT_DIR + '/output/json',
    ROOT: PROJECT_ROOT_DIR + '/output',
    TEST: PROJECT_ROOT_DIR + '/output/test',
  },
  STYLES: PROJECT_ROOT_DIR + '/styles'
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
    YEARS: 'years.json',
    YEAR_GROUPED: 'years-grouped'
  },
  STYLES: {
    CSS: 'styles.css'
  }
};

/**/
const GLOBS = {
  JSON: DIRS.ARCHIVE + '/**/*.json',
  NOTES: DIRS.INPUT.ROOT + '/notes/**/*.md',
  POSTS: [
    DIRS.INPUT.ROOT + '/**/*.md',
    '!' + DIRS.INPUT.ROOT + '/notes/**',
    '!' + DIRS.INPUT.ROOT + '/old/**'
  ],
  SASS: DIRS.STYLES + '/**/*.scss'
};

/**/
const REGEXP = {
  DATE_REGEXP: /^([1-2]\d{3})[.-]([01]\d)([.-]([0-3]\d))?$/,
  FULL_DATE_REGEXP: /(19[78]\d\.[01]\d\.[0-3]\d)\.\w/,

  FOOTNOTE_REGEXP: /^\[\^([^\]]+)]:/, // Footnote [^_ftn1234]: [^1234]:
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
