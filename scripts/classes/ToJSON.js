const { marked } = require('marked');
const path = require('path');

const { BasicConvertor } = require('./BasicConvertor');
const { getFootnoteId } = require('../helpers');
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
	static mapFootnote(footnote_id, allPostFtn, rawFtns) {
		const item = allPostFtn.items.find(({ name }) => name === footnote_id);
		const rawItem = rawFtns.find((raw) => raw.includes(footnote_id));

		const footnote_filepath_match = REGEXP.FOOTNOTE_PATH.exec(rawItem);
		let footnote_filename = null;
		if (footnote_filepath_match) {
			footnote_filename = path.parse(footnote_filepath_match[0]).name;
		}

		return {
			// Fixes html element id.
			name: getFootnoteId(footnote_id),
			// TODO: filename = slug?
			slug: footnote_filename,
			text: marked.parse(item.text),
			title: item.title
		};
	}
	
	/**/
	processFootnotes() {
		const rawFtns = this.notesMd.split('\n');

		const text = this.notesStartPosition < 0
			? this.rawText
			: this.rawText.slice(0, this.notesStartPosition).trimEnd();

		const allPostFtn = this.footnotesByFile.find(
			({ path }) => path.includes(`${this.filename}.md`)
		);

		if (!allPostFtn) return;

		// Some footnotes could be repeated in text.
		const uniqueIds = [
			...new Set(
				Array.from(text.matchAll(REGEXP.FOOTNOTE_LINK_REGEXP), ([_, id]) => id)
			)
		];

		this.footnotes = uniqueIds.map((footnote_id) =>
			ToJSON.mapFootnote(footnote_id, allPostFtn, rawFtns)
		);
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
