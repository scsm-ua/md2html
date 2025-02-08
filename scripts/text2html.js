const format = require('html-format');
const { Marked } = require('marked');
const path = require('path');
const { Transform } = require('stream');
const yaml = require('yaml');
/**/
const { createHtmlOutput, createJsonOutput } = require('./output');
const { footnotesRenderer, preprocessText, postprocessText, textRenderer } = require('./markedExt');
const { REGEXP } = require('./const');
const { toIsoDateWithTimezone, getFileHash } = require('./helpers');
const { validateFtn, validateMeta, validateText } = require('./textValidation');
const chalk = require('chalk');

/**/
const footnotesParser = new Marked({ renderer: footnotesRenderer });

const textParser = new Marked({
  hooks: {
    preprocess: preprocessText,
    postprocess: postprocessText
  },
  renderer: textRenderer
});


/**/
function convertTextFiles(dictionaries, isProdMode) {
  return new Transform({
    objectMode: true,
    
    transform(file, encoding, callback) {
      try {
        file.contents = Buffer.from(
          text2html(file.contents.toString(), dictionaries, isProdMode)
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
function text2html(str, dictionaries, isProdMode) {
  const [meta, _text] = str.split('---\n')
    .filter(Boolean)
    .map((s) => s.trim());
  
  const notesStart = _text.search(REGEXP.FOOTNOTES_BEGINNING_REGEXP);
  const notes = notesStart < 0 ? '' : _text.slice(notesStart);
  const text = notesStart < 0 ? _text : _text.slice(0, notesStart).trimEnd();
  
  const _meta = yaml.parse(meta);
  const parsedText = format(textParser.parse(text));
  const title = format(text.slice(0, text.indexOf('\n')).replace('#', ''));
  
  validateMeta(_meta, dictionaries);
  validateText(parsedText, _meta.slug);
  
  const args = {
    meta: processMeta(_meta, str, extractDate(title, _meta.tags)),
    title: title,
    text: parsedText,
    footnotes: isProdMode
      ? (notesStart < 0 ? null : parseFootnotes(notes, _meta.slug))
      : (notesStart < 0 ? '' : processFtn(notes, _meta.slug))
  };
  
  return isProdMode ? createJsonOutput(args) : createHtmlOutput(args);
}


/**
 *
 */
function parseFootnotes(notes, postSlug) {
  return notes
    .split('\n')
    .map((note) => {
      if (!note) return null;
      const res = REGEXP.FOOTNOTE_PATH.exec(note);
      
      if (!res) return null;
      const slug = path.parse(res[0]).name;
      
      if (!res[0] || !slug) {
        const msg = `CAN'T EXTRACT FOOTNOTE SLUG from "${note}" for source file "${postSlug}.md"!`;
        console.warn(chalk.blue.bgRed.bold(msg));
        return null;
      }
      
      return {
        raw: note,
        slug: slug
      };
    })
    .filter(Boolean);
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
function processMeta({ category, tags, ...data }, str, date) {
  const audio = data.links?.find(({ href }) => href.trimEnd().endsWith('.mp3'));
  const _tags = tags
    // ?.filter((item) => item !== date)
    ?.map(({ slug }) => slug);
  
  return {
    ...data,
    ...(audio && { audio }),
    ...(category && { category: category.slug }),
    ...(_tags && { tags: _tags }),
    date: date,
    updated: toIsoDateWithTimezone(new Date()),
    sourceHash: getFileHash(str)
  };
}


/**
 *
 */
function extractDate(title, tags) {
  const res = REGEXP.FULL_DATE_REGEXP.exec(title);
  if (res && res[1]) return res[1]; // 1982.01.25
  
  const tag = tags?.find((item) => REGEXP.DATE_REGEXP.test(item.title));
  return tag?.title || null; // 1982.01
}


/**/
module.exports = {
  convertTextFiles
};
