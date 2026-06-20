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
    footnotesByFile: JSON.parse(
      fs.readFileSync(DIRS.INPUT.FOOTNOTES_FILE).toString()
    ),
    tags: readSlugList(FILES.ARCHIVE.TAGS)
  }
}

/**
 * Footnote link id in bottom footnotes section.
 * 
 * @param ftnNumber {string}
 * @returns {string}
 */
function getFootnoteId(footnote_id) {
  // Fixes html element id (if only digit like id="1").
  return `f${footnote_id}`;
}

function getUniqueLinkId(footnote_id, linkIdCounts) {
  const count = (linkIdCounts.get(footnote_id) ?? 0) + 1;
  linkIdCounts.set(footnote_id, count);
  return count === 1 ? getFtnLinkId(footnote_id) : `${getFtnLinkId(footnote_id)}-${count}`;
}

// Reference link id in text body.
function getFtnLinkId(footnote_id) {
  return `link-${getFootnoteId(footnote_id)}`;
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
  getFootnoteId,
  getUniqueLinkId,
  getFtnLinkId,
  getFootnoteNumber
};
