const chalk = require('chalk');
const { execSync } = require('child_process');
const fs = require('fs');
const getSlug = require('speakingurl');
const path = require('path');
const { Transform } = require('stream');
const yaml = require('yaml');

/**/
const { ARCHIVE_CHRONOLOGY, AUTHOR_VERSIONS, REGEXP, AUTHOR} = require('./const');

/**/
const AUDIO_FILE_EXT = 'mp3';
const MP3_FOLDER_NAME = 'Audio_MP3';

/**
 *
 */
function convertDoc() {
	return new Transform({
		objectMode: true,

		transform(file, encoding, callback) {
			try {
				file.contents = Buffer.from(doc2md(file.path));
				this.push(file);
				callback();

			} catch (error) {
				callback(error);
			}
		}
	});
}

/**
 *
 */
function doc2md(filePath) {
	// Define file format by its extension.
	const { ext } = getFileName(filePath);
	
	const fileType = ext.slice(1).toLowerCase();
	
	const markdown = execSync(
		`pandoc "${filePath}" -f ${fileType} -t markdown --wrap=none`
	);
	
	
	
	console.log('Reading file:', filePath);
	createMeta(filePath);

	// console.log(markdown.toString());
	//
	// const markdown = execSync("pandoc -f docx -t markdown", { input: contents });
	// console.log(markdown.toString());
	return Buffer.from(markdown.toString(), 'utf-8');
}

/**
 *
 */
function createMeta(filePath) {
	const { ext, name } = getFileName(filePath);
	const date = extractDate(filePath);
	validateYear(date?.slice(0, 4), name, ext);
	
	const path2mp3 = path2mp3file(filePath);
	const dataStr = yaml.stringify({
		author: AUTHOR,
		date: date,
		slug: createSlug(name),
		...(checkMP3Exists(path2mp3, name, ext) && {
			audioSrc: path2mp3
		})
	});
	
	const meta = '---\n' + dataStr + '---\n';
	
	console.log(name, meta);
}

/**
 *
 * @param fileName
 * @returns {string|null}
 */
function extractDate(fileName) {
	const dateRes = REGEXP.FULL_DATE_REGEXP.exec(fileName);
	if (dateRes && dateRes[1]) return dateRes[1].replaceAll('.', '-'); // 1982.01.25 -> 1982-01-25
	
	const yearRes = REGEXP.RECORD_YEAR_REGEXP.exec(fileName);
	return (yearRes && yearRes[0]) || null;
}

/**
 *
 */
function createSlug(fileName) {
	let text = fileName;
	const author = AUTHOR_VERSIONS.find((a) => text.includes(a));

	if (author) {
		text = text.replace(author, '');
	}
	
	return getSlug(text.replaceAll('_', ' '));
}

/**
 * Builds path to the corresponding audio file.
 */
function path2mp3file(filePath) {
	const { name } = getFileName(filePath);
	const LEVELS_UP = 1;
	const parts = filePath.split('/').slice(0, -LEVELS_UP);
	
	const audioPathParts = [...parts, MP3_FOLDER_NAME, name + '.' + AUDIO_FILE_EXT];
	return audioPathParts.join('/');
}

/**
 * Checks that the corresponding audio file exists.
 */
function checkMP3Exists(path2mp3, name, ext) {
	if (fs.existsSync(path2mp3)) return true;
	
	const msg = `Warning: NO AUDIO FILE found for text "${name}${ext}".`;
	console.warn(chalk.black.bgYellow.bold(msg));
}

/**
 *
 */
function validateYear(year, fileName, fileExt) {
	if (!year) {
		const msg = `Warning: NO YEAR extracted for file "${fileName}${fileExt}".`;
		console.warn(chalk.black.bgYellow.bold(msg));
	}
	if (
		Number(year) > ARCHIVE_CHRONOLOGY.MAX ||
		Number(year) < ARCHIVE_CHRONOLOGY.MIN
	) {
		const msg = `Warning: IMPROPER YEAR "${year}" for file "${fileName}${fileExt}".`;
		console.warn(chalk.black.bgYellow.bold(msg));
	}
}

/**
 *
 * @param filePath {string}
 * @returns {{ext: string, name: string}}
 */
function getFileName(filePath) {
	const ext = path.extname(filePath);
	
	return {
		ext: ext,
		name: path.basename(filePath, ext)
	}
}

/**
 *
 */
module.exports = { convertDoc };
