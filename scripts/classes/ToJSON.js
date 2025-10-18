const chalk = require('chalk');
const path = require('path');

const { BasicConvertor } = require('./BasicConvertor');
const { REGEXP } = require('../const');

/**
 * @typedef {Object} FootnoteRef
 * @property {string} raw
 * @property {string} slug
 */

/**
 *
 */
class ToJSON extends BasicConvertor {
	footnotes; // {Array<FootnoteRef> | null}
	
	/**/
	processFootnotes() {
		this.footnotes = this.notesStartPosition < 0
			? null
			:	this.notesMd.split('\n')
				.map(this.mapFootnote)
				.filter(Boolean);
	}
	
	/**
	 * @param note {string}
	 * @return {FootnoteRef | null}
	 */
	mapFootnote = (note) => {
		if (!note) return null;
		const res = REGEXP.FOOTNOTE_PATH.exec(note);
		
		if (!res) return null;
		const slug = path.parse(res[0]).name;
		
		if (!res[0] || !slug) {
			const msg =
				`CAN'T EXTRACT FOOTNOTE SLUG from "${note}" for source file "${this.meta.slug}.md"!`;
			
			console.warn(chalk.blue.bgRed.bold(msg));
			return null;
		}
		
		return { raw: note, slug };
	}
	
	/**
	 * Public method.
	 * @return {string} - stringified JSON output, formatted.
	 */
	convert() {
		return JSON.stringify({
			meta: this.meta,
			title: this.title,
			text: this.textHtml,
			footnotes: this.footnotes
		}, null, 2);
	}
}

/**/
module.exports = { ToJSON };
