const format = require('html-format');
const yaml = require('yaml');

/**/
const { REGEXP } = require('../const');
const { toIsoDateWithTimezone } = require('../helpers');

/**/
const articleNumberRegEx = /^(\d+\.)\s/;
const recordCodeRegEx = /19[78]\d\.[01]\d\.[0-3]\d(\.[A|a|B|b|C|c|D|d]\d){1,4}(\.[A|a|B|b|C|c|D|d])?$/;

/**/
const ARCHIVE_CHRONOLOGY = {
	MAX: 1987,
	MIN: 1973
};

/**
 * Abstract class.
 */
class BasicConvertor {
	footnotes; 						// {Array<FootnoteItemHtml>}
	footnotesByFile;				// {FootnotesByFile}
	meta;							// {MetaProcessed}
	notesMd;						// {string} notes in 'md' format.
	notesStartPosition;				// {number} position, where the article notes begin.
	rawText;						// {string} title + textMd + notesMd.
	textHtml;						// {string} article main text as HTML string.
	title;							// {string} article title.
	
	/**
	 * @param date {string}
	 * @return {string}
	 */
	static extractYear(date) {
		const [year] = (date || '').split('-');
		const isYearOk = year && (
			year <= ARCHIVE_CHRONOLOGY.MAX ||
			year >= ARCHIVE_CHRONOLOGY.MIN
		);
		return isYearOk ? year : null;
	}
	
	/**/
	constructor(dataString, textParser, footnotesByFile) {
		const [rawMeta, rawText] = dataString.split('---\n')
			.filter(Boolean)
			.map((s) => s.trim());
		
		this.rawText = rawText;
		this.footnotesByFile = footnotesByFile;
		this.notesStartPosition = rawText.search(REGEXP.FOOTNOTES_BEGINNING_REGEXP);
		const meta = yaml.parse(rawMeta);
		
		// Order matters!
		this.extractNotes();
		this.processFootnotes(meta.slug);
		this.extractText(textParser);
		this.processMeta(meta);
		this.processTitle(this.extractTitle());
	}
	
	/**
	 * @param textParser - MarkedJS parser object.
	 */
	extractText(textParser) {
		const text = this.notesStartPosition < 0
			? this.rawText
			: this.rawText.slice(0, this.notesStartPosition).trimEnd();
		
		this.textHtml = format(textParser.parse(text));
	}
	
	/**/
	extractNotes() {
		this.notesMd = this.notesStartPosition < 0
			? ''
			: this.rawText.slice(this.notesStartPosition);
	}
	
	/**/
	extractTitle() {
		return format(
			this.rawText.slice(0, this.rawText.indexOf('\n')).replace('#', '')
		);
	}
	
	/**/
	processTitle(title) {
		let result = title;
		
		// Some titles contain article serial number which is subject to remove, e.g.
		// "131. Необходимость и разновидности дикши"
		const articleNumber = articleNumberRegEx.exec(result);
		
		if (articleNumber && articleNumber[1]) {
			result = result.replace(articleNumber[1], '').trim();
		}
		
		// Some titles are suffixed with recording code, which must prefix the title, e.g.
		// "Необходимость и разновидности дикши. 1982.02.15.A2"
		// should become
		// "1982.02.15.A2. Необходимость и разновидности дикши."
		const recordCode = recordCodeRegEx.exec(result);
		
		if (recordCode && recordCode[0]) {
			result = result.replace(recordCode[0], '');
			result = recordCode[0] + '. ' + result;
		}
		
		// Remove trailing period.
		this.title = result.trim().replace(/\.$/, '');
	}
	
	/**
	 * @param data {MetaParsed}
	 */
	processMeta(data) {
		const { author, category, links, slug, tags } = data;
		const audio = links?.find(({ href }) => href.trimEnd().endsWith('.mp3'));
		
		const audioSrc = audio?.href || null;
		const date = extractDate(this.title, tags);
		const _tags = tags?.map(({ slug }) => slug);
		
		this.meta = {
			audioSrc,
			author,
			category: category.slug,
			date: date,
			footnotes: this.footnotes,
			language: 'ru',
			slug,
			tags: _tags || null,
			updated: toIsoDateWithTimezone(new Date()),
			year: BasicConvertor.extractYear(date)
		};
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
	 * Abstract private method.
	 */
	processFootnotes() {
		throw new ReferenceError('Method "processFootnotes" has NOT been implemented!');
	};
}


/**
 *
 */
function extractDate(title, tags) {
	const res = REGEXP.FULL_DATE_REGEXP.exec(title);
	if (res && res[1]) return res[1].replaceAll('.', '-'); // 1982.01.25 -> 1982-01-25
	
	const tag = tags?.find((item) => REGEXP.DATE_REGEXP.test(item.slug));
	return tag
		? tag.slug.replaceAll('.', '-') // 1982-01
		: null;
}

/**/
module.exports = {
	BasicConvertor,
	extractDate // remove from here
};
