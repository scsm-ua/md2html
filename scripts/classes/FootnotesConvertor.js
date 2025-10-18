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
	static convertToHtml({ meta, text }) {
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
	 * @param isJsonMode {boolean}
	 * @return {string}
	 */
	convert(isJsonMode) {
		const args = {
			meta: this.meta,
			text: this.textHtml
		};
		
		return isJsonMode
			? JSON.stringify(args, null, 2)
			: FootnotesConvertor.convertToHtml(args);
	}
}

/**/
module.exports = { FootnotesConvertor };
