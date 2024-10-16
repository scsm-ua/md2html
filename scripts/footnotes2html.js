const format = require('html-format');
const { marked } = require('marked');
const { Transform } = require('stream');
const yaml = require('yaml');
/**/
const { validateHtml } = require('./textValidation');
const { validateMeta } = require('./ftnValidation');


/**
 *
 */
function convertFtnFiles(isProdMode) {
  return new Transform({
    objectMode: true,
    
    transform(file, encoding, callback) {
      try {
        file.contents = Buffer.from(
          ftn2html(file.contents.toString(), isProdMode)
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
function ftn2html(str, isProdMode) {
  const [meta, text] = str.trimStart().split('---\n')
    .filter(Boolean)
    .map((s) => s.trim());
  
  const _meta = yaml.parse(meta);
  const parsedText = format(marked.parse(text));
  
  validateMeta(_meta);
  validateHtml(parsedText, 'FOOTNOTE FILE', meta.slug);
  
  const args = {
    meta: _meta,
    text: parsedText
  };
  
  return isProdMode
    ? JSON.stringify(args, null, 2) : createHtmlOutput(args);
}


/**
 *
 */
function createHtmlOutput({ meta, text }) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    
    <head>
      <meta charset="UTF-8">
      <title>${meta.slug}</title>
      <link rel="stylesheet" href="../styles.css">
      <!-- For the old articles -->
      <link rel="stylesheet" href="../../styles.css">
      <!-- For the deep footnotes -->
      <link rel="stylesheet" href="../../../styles.css">
    </head>
    
    <body>
      <main>
        <div class="Meta">
          <details>
            <summary>Meta data</summary>
            <pre><code>${JSON.stringify(meta, null, 2)}</code></pre>
          </details>
        </div>
        
        <div class="Footnote">
          <div>${text}</div>
        </div>
      </main>
    </body>
    </html>
  `;
}


/**/
module.exports = {
  convertFtnFiles
};
