const chalk = require('chalk');
const { marked } = require('marked');
const path = require('path');

const { BasicConvertor } = require('./BasicConvertor');
const { getFtnNameByNumber } = require('../helpers');
const { REGEXP } = require('../const');


/**
 *
 */
class ToJSON extends BasicConvertor {
	/**
	 * @param ftnNumber {string}
	 * @param allPostFtn {FootnotesByFile}
	 * @param rawFtns {Array<string>}
	 * @return {FootnoteItemHtml}
	 */
	static mapFootnote(ftnNumber, allPostFtn, rawFtns) {
		const ftnName = getFtnNameByNumber(ftnNumber);

		const item = allPostFtn.items.find(({ name }) => name === ftnName);
		const rawItem = rawFtns.find((raw) => raw.includes(ftnName));

		const res = REGEXP.FOOTNOTE_PATH.exec(rawItem);
		const slug = res ? path.parse(res[0]).name : null;

		return {
			name: item.name.replace('_', ''),
			slug: slug,
			text: marked.parse(item.text),
			title: item.title
		};
	}
	
	/**/
	processFootnotes(slug) {
		const rawFtns = this.notesMd.split('\n');

		const text = this.notesStartPosition < 0
			? this.rawText
			: this.rawText.slice(0, this.notesStartPosition).trimEnd();

		const allPostFtn = this.footnotesByFile.find(
			({ path }) => path.includes(slug)
		);

		if (!allPostFtn) {
			const msg = `CAN'T FIND FOOTNOTES for source file "${slug}.md"!`;
			console.warn(chalk.blue.bgRed.bold(msg));
			return;
		}

		const notes = Array.from(text.matchAll(REGEXP.FOOTNOTE_LINK_REGEXP))
			.map(([_, ftnNumber]) => ToJSON.mapFootnote(ftnNumber, allPostFtn, rawFtns));

		// console.log('++++++', JSON.stringify(notes, null, 2));
		this.footnotes = notes;
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
