const { Marked } = require('marked');
const { Transform } = require('stream');

/**/
const { FootnotesConvertor } = require('./classes/FootnotesConvertor');
const { validateHtml } = require('./textValidation');

/**
 *
 */
function headingRenderer(text, depth) {
  const _depth = depth < 4 ? depth + 2 : 6;
  return `
    <h${_depth}>
      ${text}
    </h${_depth}>
  `;
}

const parser = new Marked({
  renderer: { heading: headingRenderer }
});


/**
 *
 */
function convertFtnFiles(isJsonMode) {
  return new Transform({
    objectMode: true,
    
    transform(file, encoding, callback) {
      try {
        file.contents = Buffer.from(
          ftn2html(file.contents.toString(), isJsonMode)
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
function ftn2html(str, isJsonMode) {
	const convertor = new FootnotesConvertor(str, parser);
	validateHtml(
		convertor.getText(),
		'FOOTNOTE FILE',
		convertor.getMeta().slug
	);
	
	return convertor.convert(isJsonMode);
}


/**/
module.exports = {
  convertFtnFiles
};
