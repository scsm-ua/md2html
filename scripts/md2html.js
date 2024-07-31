const { Marked } = require('marked');
const { Transform } = require('stream');
const yaml = require('yaml');
/**/
const { createHtmlOutput, createJsonOutput } = require('./output');
const { footnotesRenderer, textRenderer } = require('./markedExt');
const { REGEXP } = require('./const');
const { toIsoDateWithTimezone, validateMeta, getFileHash } = require('./helpers');

/**/
const footnotesParser = new Marked({ renderer: footnotesRenderer });
const textParser = new Marked({ renderer: textRenderer });


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
  const [meta, _text] = str.split('---\n')
    .filter(Boolean)
    .map((s) => s.trim());
  
  const notesStart = _text.search(REGEXP.FOOTNOTES_BEGINNING_REGEXP);
  const notes = _text.slice(notesStart);
  const text = _text.slice(0, notesStart).trimEnd();
  
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
function processMeta({ category, tags, ...data }, str) {
  const date = tags?.find((item) => REGEXP.DATE_REGEXP.test(item));
  const _tags = tags
    ?.filter((item) => item !== date)
    .map(({ slug }) => slug);
  
  return {
    ...data,
    ...(category && { category: category.slug }),
    ...(date && { date }),
    ...(_tags && { tags: _tags }),
    updated: toIsoDateWithTimezone(new Date()),
    sourceHash: getFileHash(str)
  };
}


/**/
module.exports = {
  convertFiles
};
