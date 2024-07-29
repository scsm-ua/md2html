/**/
const PROJECT_ROOT_DIR = process.cwd();
const ARCHIVE_PATH = '/node_modules/archive/docs';

/**/
const DIRS = {
  ARCHIVE: PROJECT_ROOT_DIR + ARCHIVE_PATH,
  INPUT: PROJECT_ROOT_DIR + ARCHIVE_PATH + '/ru',
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
  }
};

/**/
module.exports = {
  DIRS,
  FILES
}
