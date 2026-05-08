const fs = require('fs');
/**/
const { DIRS, FILES } = require('./const');

/**
 *
 */
function readSlugList(name) {
  const str = fs.readFileSync(DIRS.ARCHIVE + '/' + name).toString();
  return Object.keys(JSON.parse(str));
}

/**
 * @returns {Dictionaries}
 */
function getDictionaries() {
  return {
    categories: readSlugList(FILES.ARCHIVE.CATEGORIES),
    footnotesByFile: JSON.parse(
      fs.readFileSync(DIRS.INPUT.FOOTNOTES_FILE).toString()
    ),
    tags: readSlugList(FILES.ARCHIVE.TAGS)
  }
}


/**
 * @param ftnNumber {string}
 * @returns {string}
 */
function getFtnNameByNumber(ftnNumber) {
  return `ftn${ftnNumber}`;
}

/**
 * @param ftnNumber {string}
 * @returns {string}
 */
function getFtnLinkIdByNumber(ftnNumber) {
  return `link-ftn${ftnNumber}`;
}


/**/
module.exports = {
  getDictionaries,
  getFtnNameByNumber,
  getFtnLinkIdByNumber
};
