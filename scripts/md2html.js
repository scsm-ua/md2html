const format = require('html-format');
const { Marked } = require('marked');
const { Transform } = require('stream');
const yaml = require('yaml');
/**/
const { createHtmlOutput, createJsonOutput } = require('./output');
const { footnotesRenderer, textRenderer } = require('./markedExt');
const { REGEXP } = require('./const');
const { toIsoDateWithTimezone, getFileHash } = require('./helpers');
const { validateFtn, validateMeta, validateText } = require('./validation');

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
  const parsedText = format(textParser.parse(text));
  const parsedFtn = processFtn(notes, _meta.slug);
  
  validateMeta(_meta, dictionaries);
  validateText(parsedText, _meta.slug);
  
  const args = {
    meta: processMeta(_meta, str),
    title: format(text.slice(0, text.indexOf('\n')).replace('#', '')),
    text: parsedText,
    footnotes: parsedFtn
  };
  
  return isProdMode ? createJsonOutput(args) : createHtmlOutput(args);
}


/**
 *
 */
function processFtn(notes, slug) {
  if (!notes) return '';
  
  const str = format(footnotesParser.parse(notes).replace(/^\s+|\s+$/gi, ''));
  validateFtn(str, slug);
  return str;
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
