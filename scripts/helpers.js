const chalk = require('chalk');
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
 *
 */
function getDictionaries() {
  return {
    categories: readSlugList(FILES.ARCHIVE.CATEGORIES),
    tags: readSlugList(FILES.ARCHIVE.TAGS)
  }
}


/**
 *
 */
function validateMeta(meta, { categories, tags }) {
  if (!('category' in meta)) {
    const msg = `Warning: NO CATEGORY in file "${meta.slug}.md".`;
    console.warn(chalk.black.bgYellow.bold(msg));
    
  } else if (!categories.includes(meta.category.slug)) {
    const msg = `UNKNOWN CATEGORY "${meta.category.slug}" in file "${meta.slug}.md"!`;
    console.error(chalk.blue.bgRed.bold(msg));
    throw new Error("Encountered unknown category!");
  }
  
  if (!('tags' in meta) || !meta.tags.length) {
    const msg = `Warning: NO TAGS in file "${meta.slug}.md".`;
    console.warn(chalk.black.bgYellow.bold(msg));
  }
  
  const invalidTag = meta.tags?.find((tag) => !tags.includes(tag.slug));

  if (invalidTag) {
    const msg = `UNKNOWN TAG "${invalidTag.slug}" in file "${meta.slug}.md"!`;
    console.error(chalk.blue.bgRed.bold(msg));
    throw new Error("Encountered unknown tag!");
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


/**/
module.exports = {
  getDictionaries,
  getFileHash,
  toIsoDateWithTimezone,
  validateMeta
};
