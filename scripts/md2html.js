const { Marked } = require('marked');
const { Transform } = require('stream');
const yaml = require('yaml');
/**/
const { createHtmlOutput, createJsonOutput } = require('./output');
const { footnotesRenderer, textRenderer } = require('./markedExt');

/**/
const footnotesParser = new Marked({ renderer: footnotesRenderer });
const textParser = new Marked({ renderer: textRenderer });
const DATE_REGEXP = /^([1-2]\d{3})[.-]([01]\d)$/;

/**/
function convertFiles(isProdMode) {
  return new Transform({
    objectMode: true,
    
    transform(file, encoding, callback) {
      try {
        file.contents = Buffer.from(md2html(file.contents.toString(), isProdMode));
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
function md2html(str, isProdMode) {
  const [meta, text, notes] = str.split('---\n')
    .filter(Boolean)
    .map((s) => s.trim());
  
  const args = {
    meta: precessMeta(meta),
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
function precessMeta(meta) {
  const { tags, ...data } = yaml.parse(meta);
  const date = tags?.find((item) => DATE_REGEXP.test(item));
  const _tags = tags?.filter((item) => item !== date);
  
  const today = new Date();
  const month = today.getMonth() + 1;
  const updated = today.getFullYear() + '-' +
    (month > 9 ? month : '0' + month) + '-' +
    today.getDate() + ' ' +
    today.getHours() + ':' +
    today.getMinutes();
  
  return {
    ...data,
    ...(_tags && { tags: _tags }),
    ...(date && { date }),
    updated
  };
}

/**/
module.exports = {
  convertFiles
};
