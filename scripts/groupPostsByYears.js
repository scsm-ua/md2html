const fs = require('fs');
const { Transform } = require('stream');

const { DIRS, FILES } = require('./const');
const { UNKNOWN_MONTH, YearRecord } = require('./classes/YearCatalog');

/**
 *
 */
function groupPostsByYears() {
	return new Transform({
		objectMode: true,
		
		transform(file, encoding, callback) {
			try {
				const path = DIRS.FIXTURES + '/' + FILES.COLLECTIONS.YEARS;
				const yearsStr = fs.readFileSync(path).toString();
				const years = JSON.parse(yearsStr)
					.map((/** @type {Year} */ y) => y.value);
				
				const result = processAllPosts(
					JSON.parse(file.contents.toString()),
					years
				);
				
				file.contents = Buffer.from(
					JSON.stringify(result, null, 2)
				);
				this.push(file);
				callback();
				
			} catch (error) {
				callback(error);
			}
		}
	});
}

/**
 * @param docs {Array<Post>}
 * @param years {Array<number>}
 * @return {Array<YearCatalog>}
 */
function processAllPosts(docs, years) {
	const yearsMap = createEmptyYearsMap(years.sort());
	
	docs.forEach((doc) => {
		const [y, m] = (doc.meta.date || '').split('-');
		let year = y === '' ? null : y;
		const month = m === '' || m === void 0 ? UNKNOWN_MONTH : m;
		
		if (!yearsMap[year]) {
			year = null;
		}
		
		yearsMap[year].months[month].records.push(mapShortPostDoc(doc));
	});
	
	return sortItems(yearsMap);
}

/**
 * @param {Array<number>} years
 * @return {YearsMap}
 */
function createEmptyYearsMap(years) {
	/** @type {YearsMap} */
	const yearsMap = {};
	
	years.forEach((y) => {
		const year = typeof y === 'number' || typeof y === 'string' ? '' + y : null;
		yearsMap[year] = new YearRecord(year);
	});
	
	return yearsMap;
}

/**
 * @param {Post} doc
 * @return {GroupedYearsPostShort}
 */
function mapShortPostDoc(doc) {
	const { meta, title } = doc;
	const { audio, author, category, recordId, slug } =
		/** @type {MetaProcessed} */meta;
	
	return {
		audio: audio ? { src: audio.src, duration: audio.duration } : null,
		author,
		...(category ? { hasCategory: true } : {}),
		recordId,
		slug,
		title
	};
}

/**
 * @property {YearsMap} yearsMap
 * @return {Array<YearCatalog>}
 */
function sortItems(yearsMap) {
	/** @type {Array<YearRecord>} */
	const result = [];
	
	Object.entries(yearsMap).forEach(([label, record]) =>
		result.push(record)
	);
	
	result.sort((/** @type {YearRecord} */ a, /** @type {YearRecord} */ b) => a.year - b.year);
	result.push(result.shift()); // This puts 'null' year to the end.
	return result.map(sortMonths);
}

/**
 * @param {YearRecord}
 * @return {YearCatalog}
 */
function sortMonths({ months, year }) {
	/** @type {Array<MonthRecord>} */
	const result = [];
	
	Object.entries(months).forEach(([label, record]) => result.push(record));
	
	result.sort((/** @type {MonthRecord} */ a, /** @type {MonthRecord} */ b ) =>
		a.month && b.month && a.month.localeCompare(b.month)
	);
	result.push(result.shift()); // This puts '00' month to the end.
	
	return {
		// Set `0000` for import upsert update by year. `null` not working for that.
		year: year ?? '0000',
		months: result.map(handleMonth).filter(Boolean)
	};
}

/**
 * @param {MonthRecord} item
 * @return {MonthRecord|null}
 */
function handleMonth(item) {
	if (item.records.length === 0) return null;
	
	item.records.sort((/** @type {GroupedYearsPostShort} */ a, /** @type {GroupedYearsPostShort} */ b) =>
		typeof a.slug === 'string' &&
		typeof b.slug === 'string' &&
		a.slug.localeCompare(b.slug)
	);
	
	return item;
}

/**/
module.exports = { groupPostsByYears };
