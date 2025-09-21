/**/
const PROJECT_ROOT_DIR = process.cwd();

/**/
const PATH = {
  ARCHIVE_PATH: '/node_modules/sridhar-maharaj-archive/docs'
};

/**/
const DIRS = {
  ARCHIVE: PROJECT_ROOT_DIR + PATH.ARCHIVE_PATH,
  INPUT: {
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
    POSTS: 'posts.json'
  },
  STYLES: {
    CSS: 'styles.css'
  }
};

/**/
const GLOBS = {
	DOCS: DIRS.INPUT.TEST + '/**/*.docx',
	JSON: DIRS.ARCHIVE + '/**/*.json',
  NOTES: DIRS.INPUT.ROOT + '/notes/**/*.md',
  POSTS: [DIRS.INPUT.ROOT + '/**/*.md', '!' + DIRS.INPUT.ROOT + '/notes/**'],
  SASS: DIRS.STYLES + '/**/*.scss'
};

/**/
const REGEXP = {
  DATE_REGEXP: /^([1-2]\d{3})[.-]([01]\d)([.-]([0-3]\d))?$/,
  FOOTNOTE_REGEXP: /^\[\^_ftn(\d+)]:/, // Footnote [^_ftn1234]:
  FOOTNOTE_LINK_REGEXP: /\[\^_ftn(\d+)]/g, // Footnote link [^_ftn1234]
  FOOTNOTE_PATH: /(\(.+\.md\))$/,
  FOOTNOTES_BEGINNING_REGEXP: /\n\[\^_ftn(\d+)]:/,
  FULL_DATE_REGEXP: /(19[78]\d\.[01]\d\.[0-3]\d)\.?\w/,
  VERSE_FOOTNOTE_REGEXP: /\n\[\^_ftn(\d+)]/g,
	RECORD_YEAR_REGEXP: /[1-2]\d{3}/ // /19[78]\d/
};

/**/
const AUTHOR = 'Шрила Бхакти Ракшак Шридхар Дев-Госвами Махарадж';
const AUTHOR_VERSIONS = [
	'BR.SridharM',
	'SridharMj'
];

const ARCHIVE_CHRONOLOGY = {
  MAX: 1987,
  MIN: 1973
};

/**/
module.exports = {
  ARCHIVE_CHRONOLOGY,
	AUTHOR,
	AUTHOR_VERSIONS,
  DIRS,
  FILES,
  GLOBS,
  PATH,
  REGEXP
}
