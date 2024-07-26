const { marked } = require('marked');
const { Transform } = require('stream');
/**/
const { htmlRenderer } = require('./markedExt');

const walkTokens = (token) => {
  if (token.type === 'paragraph') {
    console.log('+++++' + JSON.stringify(token, null, 2) + '+++++');
  }
  
  return token;
};

/**/
marked.use({
  // hooks: {
  //   preprocess:
  // },
  renderer: htmlRenderer,
  // walkTokens
});

/**
 *
 */
function convertFiles() {
  return new Transform({
    objectMode: true,
    
    transform(file, encoding, callback) {
      try {
        // const htmlString = fillTemplate(
        //   songbook_id,
        //   template,
        //   JSON.parse(file.contents.toString()),
        //   file.path
        // );
        const content = cutOffMeta(file.contents.toString());
        const htmlString = marked.parse(content);
        // console.log(htmlString);
        
        file.contents = Buffer.from(wrapIntoDoc(htmlString));
        this.push(file);
        callback();
        
      } catch (error) {
        callback(error);
      }
    }
  });
}

/**
 * Removes YAML metadata in the beginning of a file.
 */
function cutOffMeta(str) {
  return str.slice(str.lastIndexOf('---') + 3).trimStart();
}

/**
 *
 */
function wrapIntoDoc(str) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Title</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="Article">
    ${str}
  </div>
</body>
</html>
  `;
}

/**
 *
 */
function md2html(str) {

}

/**/
module.exports = {
  convertFiles
};
