const chalk = require('chalk');
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
		this.processFootnotes(meta.slug);
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
		const { author, category, links, slug, tags, audio, date } = data;
		const audio_link = links?.find(({ href }) => href.trimEnd().endsWith('.mp3'));
		
		let audioSrc;
		if (audio?.mp3) {
			// Temporary hardcode.
			audioSrc = `/ru/${audio.mp3}`;
		} else {
			audioSrc = audio_link?.href || null;
		}
		const date_str = extractDate(this.title, tags, date);
		const _tags = tags?.map(({ slug }) => slug);
		
		this.meta = {
			audioSrc,
			author,
			category: category?.slug || null,
			date: date_str,
			language: 'ru',
			slug,
			tags: _tags || null,
			updated: toIsoDateWithTimezone(new Date()),
			year: BasicConvertor.extractYear(date_str)
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
function extractDate(title, tags, date_obj) {
	const res = REGEXP.FULL_DATE_REGEXP.exec(title);
	if (res && res[1]) return res[1].replaceAll('.', '-'); // 1982.01.25 -> 1982-01-25

	if (date_obj?.year) {
		const m = date_obj.month ? String(date_obj.month).padStart(2, '0') : '00';
		const d = date_obj.day ? String(date_obj.day).padStart(2, '0') : '00';
		return `${date_obj.year}-${m}-${d}`;
	}
	
	const tag = tags?.find((item) => REGEXP.DATE_REGEXP.test(item.slug));
	return tag
		? tag.slug.replaceAll('.', '-') // 1982-01
		: null;
}

/**/
module.exports = { BasicConvertor };
