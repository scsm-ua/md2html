const crypto = require('crypto');
const { Marked } = require('marked');
const { Transform } = require('stream');
const yaml = require('yaml');
/**/
const { createHtmlOutput, createJsonOutput } = require('./output');
const { footnotesRenderer, textRenderer } = require('./markedExt');
const { validateMeta } = require('./helpers');

/**/
const footnotesParser = new Marked({ renderer: footnotesRenderer });
const textParser = new Marked({ renderer: textRenderer });
const DATE_REGEXP = /^([1-2]\d{3})[.-]([01]\d)([.-]([0-3]\d))?$/;


/**/
function convertFiles(dictionaries, isProdMode) {
  return new Transform({
    objectMode: true,
    
    transform(file, encoding, callback) {
      try {
        file.contents = Buffer.from(
          md2html(file.contents.toString(), dictionaries, isProdMode)
        );
        this.push(file);
        callback();
        
      } catch (error) {
        callback(error);
      }
    }
  });
}


/**
 *
 */
function md2html(str, dictionaries, isProdMode) {
  const [meta, text, notes] = str.split('---\n')
    .filter(Boolean)
    .map((s) => s.trim());
  
  const _meta = yaml.parse(meta);
  validateMeta(_meta, dictionaries);
  
  const args = {
    meta: processMeta(_meta, str),
    title: text.slice(0, text.indexOf('\n')).replace('#', '').trim(),
    text: textParser.parse(text),
    footnotes: notes
      ? footnotesParser.parse(notes).replace(/^\s+|\s+$/gi, '')
      : ''
  };
  
  return isProdMode ? createJsonOutput(args) : createHtmlOutput(args);
}


/**
 *
 */
function processMeta({ tags, ...data }, str) {
  const date = tags?.find((item) => DATE_REGEXP.test(item));
  const _tags = tags?.filter((item) => item !== date);
  
  return {
    ...data,
    ...(_tags && { tags: _tags }),
    ...(date && { date }),
    updated: getTodayDate(),
    sourceHash: getFileHash(str)
  };
}


/**
 *
 */
function getTodayDate() {
  const today = new Date();
  const month = today.getMonth() + 1;
  return today.getFullYear() + '-' +
    (month > 9 ? month : '0' + month) + '-' +
    today.getDate() + ' ' +
    today.getHours() + ':' +
    today.getMinutes();
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
  convertFiles
};
