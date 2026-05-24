const { Marked } = require('marked');
const { Transform } = require('stream');

/**/
const { preprocessText, postprocessText, createTextRenderer } = require('./markedExt');
const { ToHTML } = require('./classes/ToHTML');
const { ToJSON } = require('./classes/ToJSON');
const { validateMeta, validateText } = require('./textValidation');


/**/
const textParserOptions = {
  hooks: {
    preprocess: preprocessText,
    postprocess: postprocessText
  }
};


/**
 * @param dictionaries {Dictionaries}
 * @param [isJsonMode] {boolean}
 * @returns {*}
 */
function convertTextFiles(dictionaries, isJsonMode) {
  return new Transform({
    objectMode: true,
    
    transform(file, encoding, callback) {
      try {
        file.contents = Buffer.from(
          text2html(file.contents.toString(), dictionaries, isJsonMode, file.stem)
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
 * @param str {string}
 * @param dictionaries {Dictionaries}
 * @param [isJsonMode] {boolean}
 * @returns {string}
 */
function text2html(str, dictionaries, isJsonMode, filename) {
    const textParser = new Marked({ ...textParserOptions, renderer: createTextRenderer() });
    const convertor = isJsonMode
        ? new ToJSON(str, textParser, dictionaries.footnotesByFile, filename)
        : new ToHTML(str, textParser, dictionaries.footnotesByFile, filename);

    const meta = convertor.getMeta();
	validateMeta(meta, dictionaries, filename);
	validateText(convertor.getText(), filename);
	return convertor.convert();
}


/**/
module.exports = {
  convertTextFiles
};
