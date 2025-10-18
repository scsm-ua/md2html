const { Marked } = require('marked');
const { Transform } = require('stream');
/**/
const { preprocessText, postprocessText, textRenderer } = require('./markedExt');
const { ToHTML } = require('./classes/ToHTML');
const { ToJSON } = require('./classes/ToJSON');
const { validateMeta, validateText } = require('./textValidation');


/**/
const textParser = new Marked({
  hooks: {
    preprocess: preprocessText,
    postprocess: postprocessText
  },
  renderer: textRenderer
});


/**/
function convertTextFiles(dictionaries, isJsonMode) {
  return new Transform({
    objectMode: true,
    
    transform(file, encoding, callback) {
      try {
        file.contents = Buffer.from(
          text2html(file.contents.toString(), dictionaries, isJsonMode)
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
function text2html(str, dictionaries, isJsonMode) {
	const convertor = isJsonMode ? new ToJSON(str, textParser) : new ToHTML(str, textParser);
	const meta = convertor.getMeta();
	
	validateMeta(meta, dictionaries);
	validateText(convertor.getText(), meta.slug);
	return convertor.convert();
}


/**/
module.exports = {
  convertTextFiles
};
