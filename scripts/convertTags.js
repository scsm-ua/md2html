const { Transform } = require('stream');

/**
 *
 */
function convertTags() {
  return new Transform({
    objectMode: true,
    
    transform(file, encoding, callback) {
      try {
        file.contents = Buffer.from(
          convert(file.contents.toString())
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
function convert(str) {
  const items = Object.entries(JSON.parse(str))
    .map(([slug, name]) => ({ name, slug }));
  
  return JSON.stringify(items, null, 2);
}

/**/
module.exports = {
  convertTags
};
