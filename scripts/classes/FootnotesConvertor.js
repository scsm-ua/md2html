const chalk = require('chalk');
const format = require('html-format');
const yaml = require('yaml');

/**
 * @typedef FtnMeta
 * @property {Array<string>} refs - References to markdown source files where it's been used.
 * @property {string} slug
 * @property {Array<Tag> | void} tags
 */

/**
 *
 */
class FootnotesConvertor {
	meta;								// {FtnMeta}
	textHtml;						// {string} footnote's main text as HTML string.
	
	/**/
	constructor(dataString, textParser) {
		const [meta, text] = dataString.trimStart().split('---\n')
			.filter(Boolean)
			.map((s) => s.trim());
		
		this.meta = yaml.parse(meta);
		this.validateMeta(this.meta);
		this.textHtml = format(textParser.parse(text));
	}
	
	/**/
	validateMeta(meta) {
		if (!('slug' in meta)) {
			console.error(chalk.blue.bgRed.bold('NO SLUG found in footnote file!'));
			throw new Error('Undefined slug!');
		}
		
		if (!('refs' in meta) || !meta.refs.length) {
			const msg = `Warning: NO REFS in footnote file "${meta.slug}.md".`;
			console.warn(chalk.black.bgYellow.bold(msg));
		}
	}
	
	/**
	 * Public method.
	 */
	getMeta() {
		return this.meta;
	}
	
	/**
	 * Public method.
	 */
	getText() {
		return this.textHtml;
	}
	
	/**
	 * Public method.
	 * @return {string}
	 */
	convert() {
		return JSON.stringify({
			meta: this.meta,
			text: this.textHtml
		}, null, 2);
	}
}

/**/
module.exports = { FootnotesConvertor };
