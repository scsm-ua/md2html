const chalk = require('chalk');
const { formatterFactory, HtmlValidate } = require('html-validate');
/**/
const { REGEXP } = require('./const');

/**/
const config = {
  "extends": [
    "html-validate:recommended"
  ],
  "rules": {
    "close-order": "error",
    "long-title": "off",
    "no-trailing-whitespace": "warn"
  }
};

const formatReport = formatterFactory('codeframe');
const htmlValidate = new HtmlValidate(config);
const PART = {
  MAIN_TEXT: 'MAIN TEXT',
  FOOTNOTES: 'FOOTNOTES'
};


/**
 *
 */
function validateMeta(meta, { categories, tags }) {
  if (!('category' in meta)) {
    const msg = `Warning: NO CATEGORY in file "${meta.slug}.md".`;
    console.warn(chalk.black.bgYellow.bold(msg));
    
  } else if (!categories.includes(meta.category.slug)) {
    const msg = `UNKNOWN CATEGORY "${meta.category.slug}" in file "${meta.slug}.md"!`;
    console.error(chalk.blue.bgRed.bold(msg));
    throw new Error("Encountered unknown category!");
  }
  
  if (!('tags' in meta) || !meta.tags.length) {
    const msg = `Warning: NO TAGS in file "${meta.slug}.md".`;
    console.warn(chalk.black.bgYellow.bold(msg));
  }
  
  const invalidTag = meta.tags?.find((tag) => !tags.includes(tag.slug));
  
  if (invalidTag) {
    const msg = `UNKNOWN TAG "${invalidTag.slug}" in file "${meta.slug}.md"!`;
    console.error(chalk.blue.bgRed.bold(msg));
    throw new Error("Encountered unknown tag!");
  }
}


/**
 *
 */
function validateText(text, slug) {
  const pos = text.search(REGEXP.FOOTNOTE_LINK_REGEXP);
  validateHtml(text, PART.MAIN_TEXT, slug);
  
  if (pos >= 0) {
    const msg = `MALFORMED LINK at position ${pos} for source file "${slug}.md"!`;
    console.error(chalk.blue.bgRed.bold(msg));
  }
}


/**
 *
 */
function validateFtn(text, slug) {
  const pos = text.search(REGEXP.FOOTNOTE_REGEXP);
  validateHtml(text, PART.FOOTNOTES, slug);
  
  if (pos >= 0) {
    const msg = `MALFORMED FOOTNOTES for source file "${slug}.md"!`;
    console.error(chalk.blue.bgRed.bold(msg));
    console.log(text);
  }
}


/**
 *
 */
function validateHtml(str, part, slug) {
  htmlValidate.validateString(str)
    .then((report)=> {
      if (report.valid) return;
      
      console.warn(chalk.black.bgGray.bold(`Issue in ${part} rendering. Source file: "${slug}.md":`));
      console.log(formatReport(report.results));
    })
    .catch(console.error);
}


/**/
module.exports = {
  validateFtn,
  validateMeta,
  validateText
};
