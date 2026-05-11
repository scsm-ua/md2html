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
function getFtnLinkId(footnote_id) {
  return `link-${footnote_id}`;
}

function getFootnoteNumber(footnote_id) {
  const m = footnote_id.match(/\d+/);
  if (!m) {
    throw new Error(`Footnote ${footnote_id} must contain number`);
  }
  return m[0];
}



/**/
module.exports = {
  getDictionaries,
  getFtnLinkId,
  getFootnoteNumber
};
