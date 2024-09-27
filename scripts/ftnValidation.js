const chalk = require('chalk');


/**
 *
 */
function validateMeta(meta) {
  if (!('slug' in meta)) {
    console.error(chalk.blue.bgRed.bold('NO SLUG found in footnote file!'));
    throw new Error('Undefined slug!');
  }
  
  if (!('refs' in meta) || !meta.refs.length) {
    const msg = `Warning: NO REFS in footnote file "${meta.slug}.md".`;
    console.warn(chalk.black.bgYellow.bold(msg));
  }
}


/**/
module.exports = {
  validateMeta
};
