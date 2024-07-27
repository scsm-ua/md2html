const { Marked } = require('marked');
const { Transform } = require('stream');
const yaml = require('yaml');
/**/
const { createHtmlOutput, createJsonOutput } = require('./output');
const { footnotesRenderer, textRenderer } = require('./markedExt');

/**/
const footnotesParser = new Marked({ renderer: footnotesRenderer });
const textParser = new Marked({ renderer: textRenderer });

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
    meta: yaml.parse(meta),
    title: text.slice(0, text.indexOf('\n')).replace('#', '').trim(),
    text: textParser.parse(text),
    footnotes: notes
      ? footnotesParser.parse(notes).replace(/^\s+|\s+$/gi, '')
      : ''
  };
  
  return isProdMode ? createJsonOutput(args) : createHtmlOutput(args);
}

/**/
module.exports = {
  convertFiles
};
