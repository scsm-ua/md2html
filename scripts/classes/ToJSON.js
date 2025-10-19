const chalk = require('chalk');
const path = require('path');

const { BasicConvertor } = require('./BasicConvertor');
const { REGEXP } = require('../const');


/**
 *
 */
class ToJSON extends BasicConvertor {
	/**
	 * @param note {string}
	 * @param postSlug {string}
	 * @return {FootnoteRef | null}
	 */
	static mapFootnote = (note, postSlug) => {
		if (!note) return null;
		const res = REGEXP.FOOTNOTE_PATH.exec(note);
		
		if (!res) return null;
		const slug = path.parse(res[0]).name;
		
		if (!res[0] || !slug) {
			const msg =
				`CAN'T EXTRACT FOOTNOTE SLUG from "${note}" for source file "${postSlug}.md"!`;
			
			console.warn(chalk.blue.bgRed.bold(msg));
			return null;
		}
		
		return { raw: note, slug };
	}
	
	/**/
	processFootnotes(slug) {
		this.footnotes = this.notesStartPosition < 0
			? null
			:	this.notesMd.split('\n')
				.map((note) => ToJSON.mapFootnote(note, slug))
				.filter(Boolean);
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
