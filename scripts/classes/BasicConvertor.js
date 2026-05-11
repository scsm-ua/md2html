const chalk = require('chalk');
const format = require('html-format');
const yaml = require('yaml');

/**/
const { REGEXP } = require('../const');

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
		const [yearStr] = (date || '').split('-');
		const year = Number(yearStr);
		const isYearOk = year && (
			year <= ARCHIVE_CHRONOLOGY.MAX ||
			year >= ARCHIVE_CHRONOLOGY.MIN
		);
		return isYearOk ? yearStr : null;
	}

	/**/
	constructor(dataString, textParser, footnotesByFile, filename) {
		const [rawMeta, rawText] = dataString.split('---\n')
			.filter(Boolean)
			.map((s) => s.trim());
		
		this.rawText = rawText;
		this.footnotesByFile = footnotesByFile;
		this.filename = filename;
		this.notesStartPosition = rawText.search(REGEXP.FOOTNOTES_BEGINNING_REGEXP);
		const meta = yaml.parse(rawMeta);
		
		// Order matters!
		this.extractNotes();
		this.processFootnotes();
		this.extractText(textParser);
		this.processMeta(meta);
		this.processTitle(meta.title ?? this.extractTitle() ?? meta.record_id ?? '');
		
		if (!this.title) {
			const msg = `Error: NO TITLE in file "${this.filename}.md".`;
			console.error(chalk.blue.bgRed.bold(msg));
		}
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
		const firstLine = this.rawText.slice(0, this.rawText.indexOf('\n'));
		if (!firstLine.trimStart().startsWith('# ')) return null;
		return format(firstLine.replace('# ', ''));
	}
	
	/**/
	processTitle(title) {
		let result = title.trim();
		
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
		const { author, category, legacy, record_id, slug, tags, audio, date } = data;
		const _tags = tags?.map(({ slug }) => slug);
		
		this.meta = {
			audio,
			author,
			category: category?.slug || null,
			date,
			language: 'ru',
			record_id: record_id || null,
			slug,
			tags: _tags || null,
			topic_idx: legacy?.index || null,
			updated: new Date().toISOString(),
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

/**/
module.exports = { BasicConvertor };
