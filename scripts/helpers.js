const crypto = require('crypto');
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
 * Example output: 2013-07-01T17:55:13-07:00
 */
function toIsoDateWithTimezone(date) {
  const tzo = -date.getTimezoneOffset();
  const dif = tzo >= 0 ? '+' : '-';
  const pad = (num) =>(num < 10 ? '0' : '') + num;
  
  return date.getFullYear() +
    '-' + pad(date.getMonth() + 1) +
    '-' + pad(date.getDate()) +
    'T' + pad(date.getHours()) +
    ':' + pad(date.getMinutes()) +
    ':' + pad(date.getSeconds()) +
    dif + pad(Math.floor(Math.abs(tzo) / 60)) +
    ':' + pad(Math.abs(tzo) % 60);
}


/**
 *
 */
function getFileHash(str) {
  const hash = crypto.createHash('sha1').setEncoding('hex');
  hash.write(str);
  hash.end();
  return hash.read();
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
  getFileHash,
  getFtnNameByNumber,
  getFtnLinkIdByNumber,
  toIsoDateWithTimezone
};
