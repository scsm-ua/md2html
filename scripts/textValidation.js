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
	{ field: 'audio', severity: 'error' },
	// { field: 'category', severity: 'warning' },
	{ field: 'date', severity: 'warning' },
	{ field: 'language', severity: 'error' },
	{ field: 'record_id', severity: 'warning' },
	// { field: 'tags', severity: 'warning' },
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
function validateMeta(meta, { categories, tags }, filename) {
	const errors = [];
	const warnings = [];

	METADATA_VALIDATION_SCHEME.forEach(({ field, severity }) => {
		if (!(field in meta) || !meta[field] || meta[field]?.length === 0) {
			if (severity === 'error') {
				errors.push(`NO ${field.toUpperCase()}`);
			} else {
				warnings.push(`NO ${field.toUpperCase()}`);
			}
		}
	});

	if (meta.date && !REGEXP.DATE_REGEXP.test(meta.date)) {
		warnings.push(`INVALID DATE FORMAT "${meta.date}"`);
	}

	if ('topic_idx' in meta && meta.topic_idx !== null && typeof meta.topic_idx !== 'string') {
		warnings.push(`INVALID TYPE for topic_idx (expected string, got ${typeof meta.topic_idx})`);
	}

	if (errors.length > 0) {
		const msg = `Error: ${errors.join(', ')} in file "${filename}.md".`;
		console.error(chalk.blue.bgRed.bold(msg));
	}

	if (warnings.length > 0) {
		const msg = `Warning: ${warnings.join(', ')} in file "${filename}.md".`;
		console.warn(chalk.black.bgYellow.bold(msg));
	}

	if (meta.category && !categories.includes(meta.category)) {
    const msg = `UNKNOWN CATEGORY "${meta.category}" in file "${filename}.md"!`;
    console.error(chalk.blue.bgRed.bold(msg));
    throw new Error("Encountered unknown category!");
  }
  
  const invalidTag = meta.tags?.find((tag) => !tags.includes(tag));
  
  if (invalidTag) {
    const msg = `UNKNOWN TAG "${invalidTag}" in file "${filename}.md"!`;
    console.error(chalk.blue.bgRed.bold(msg));
    throw new Error("Encountered unknown tag!");
  }
}


/**
 *
 */
function validateText(text, filename) {
  const pos = text.search(REGEXP.FOOTNOTE_LINK_REGEXP);
  validateHtml(text, PART.MAIN_TEXT, filename);
  
  if (pos >= 0) {
    const msg = `MALFORMED LINK at position ${pos} for source file "${filename}.md"!`;
    console.error(chalk.blue.bgRed.bold(msg));
  }
}


/**
 *
 */
function validateFtn(text, filename) {
  const pos = text.search(REGEXP.FOOTNOTE_REGEXP);
  validateHtml(text, PART.FOOTNOTES, filename);
  
  if (pos >= 0) {
    const msg = `MALFORMED FOOTNOTES for source file "${filename}.md"!`;
    console.error(chalk.blue.bgRed.bold(msg));
    console.log(text);
  }
}


/**
 *
 */
function validateHtml(str, part, filename) {
  htmlValidate.validateString(str)
    .then((report)=> {
      if (report.valid) return;
      
      console.warn(chalk.black.bgGray.bold(`Issue in ${part} rendering. Source file: "${filename}.md":`));
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
