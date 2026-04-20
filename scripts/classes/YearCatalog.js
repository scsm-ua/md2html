/**/
const UNKNOWN_MONTH = '00';

/**
 * @typedef {Object<Month, MonthRecord>} MonthsMap
 */

/**
 * @typedef {Object<string | null, YearRecord>} YearsMap
 */

/**
 * @typedef {'00' | '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '10' | '11' | '12'} Month
 */

/**
 * @typedef {string | null} YearString
 */


/**
 * @class MonthRecord
 */
class MonthRecord {
	/**
	 * @param {Month} month
	 */
	constructor(month) {
		/** @type {Month} */
		this.month = month;
		
		/** @type {Array<PostShort>} */
		this.records = [];
	}
}

/**
 * @class YearRecord
 */
class YearRecord {
	/**
	 * @private
	 * @type {MonthsMap}
	 */
	static #emptyMonthMap = YearRecord.#createEmptyMonthsMap();
	
	/**
	 * @private
	 * @returns {MonthsMap}
	 */
	static #createEmptyMonthsMap() {
		/** @type {MonthsMap} */
		const monthsMap = {
				[UNKNOWN_MONTH]: new MonthRecord(/** @type {Month} */ UNKNOWN_MONTH)
			};
		
		Array(12)
			.fill(null)
			.forEach((_, idx) => {
				const monthNumber = idx + 1;
				/** @type {Month} */
				const month = (monthNumber < 10 ? `0${monthNumber}` : monthNumber + '');
				monthsMap[month] = new MonthRecord(month);
			});
		
		return monthsMap;
	}
	
	/**
	 * @private
	 * @param {any} x
	 */
	static #makeCopy(x) {
		return JSON.parse(JSON.stringify(x));
	}
	
	/**
	 * @param {YearString} year
	 */
	constructor(year) {
		/** @type {YearString} */
		this.year = year;
		/** @type {MonthsMap} */
		this.months = YearRecord.#makeCopy(YearRecord.#emptyMonthMap);
	}
}

/**
 * @class YearCatalog
 */
class YearCatalog {
	/**
	 * @param {YearString} year
	 */
	constructor(year) {
		/** @type {YearString} */
		this.year = year;
		/** @type {Array<MonthRecord>} */
		this.months = [];
	}
}

/**/
module.exports = {
	MonthRecord,
	UNKNOWN_MONTH,
	YearCatalog,
	YearRecord
}
