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

/**/
const METADATA_VALIDATION_SCHEME = [
	{ field: 'author', severity: 'error' },
	{ field: 'audioSrc', severity: 'error' },
	{ field: 'category', severity: 'error' },
	{ field: 'date', severity: 'warning' },
	{ field: 'language', severity: 'error' },
	{ field: 'tags', severity: 'warning' },
	{ field: 'updated', severity: 'error' }
];

/* Evaluated function. Don't remove. */
function errorLogger(field, slug) {
	const msg = `Error: NO ${field.toUpperCase()} in file "${slug}.md".`;
	console.error(chalk.blue.bgRed.bold(msg));
}

/* Evaluated function. Don't remove. */
function warningLogger(field, slug) {
	const msg = `Warning: NO ${field.toUpperCase()} in file "${slug}.md".`;
	console.warn(chalk.black.bgYellow.bold(msg));
}

/**
 *
 */
function validateMeta(meta, { categories, tags }) {
	METADATA_VALIDATION_SCHEME.forEach(({ field, severity })=> {
		if (!(field in meta) || !meta[field] || meta[field]?.length === 0) {
			const ex = `${severity}Logger("${field}", "${meta.slug}")`;
			eval(ex);
		}
	});
	
	if (!categories.includes(meta.category)) {
    const msg = `UNKNOWN CATEGORY "${meta.category}" in file "${meta.slug}.md"!`;
    console.error(chalk.blue.bgRed.bold(msg));
    throw new Error("Encountered unknown category!");
  }
  
  const invalidTag = meta.tags?.find((tag) => !tags.includes(tag));
  
  if (invalidTag) {
    const msg = `UNKNOWN TAG "${invalidTag}" in file "${meta.slug}.md"!`;
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
  validateHtml,
  validateMeta,
  validateText
};
