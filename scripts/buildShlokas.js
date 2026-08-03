const { Transform } = require('stream');
const chalk = require('chalk');
const { Marked } = require('marked');
const Vinyl = require('vinyl');
const yaml = require('yaml');

const { preprocessText, postprocessText, createTextRenderer } = require('./markedExt');


const shlokaParserOptions = {
  hooks: {
    preprocess: preprocessText,
    postprocess: postprocessText
  }
};


/**
 * Collects shlokas from all shloka MD files in the stream,
 * then emits a single shlokas.json file on flush.
 *
 * Each shloka source file (`notes/shloka/<slug>.md`) contains the full text of
 * the shloka (Sanskrit transliteration + translation + source) in its body and
 * declares `slug` and `refs` in its YAML frontmatter.
 *
 * @returns {Transform}
 */
function buildShlokas() {
  const parseMetaAndBody = (content) => {
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!match) {
      return { meta: null, body: '' };
    }

    return {
      meta: yaml.parse(match[1].trim()),
      body: match[2] || ''
    };
  };

  /** @type {Map<string, { slug: string, scriptures: Array<{title: string, slug: string}>, verses: Array<{title: string, slug: string}>, text: string, quote: string | null, refsCount: number }>} */
  const shlokasMap = new Map();

  const normalizeRefList = (list) => {
    if (!Array.isArray(list)) return [];
    return list
      .filter((item) => item?.slug && item?.title)
      .map(({ slug, title }) => ({ slug, title }));
  };

  // First indented block (each line begins with 4 spaces) — the Sanskrit transliteration of the shloka.
  const extractFirstQuoteBlock = (body) => {
    const lines = body.split(/\r?\n/);
    const collected = [];

    for (const line of lines) {
      if (line.startsWith('    ')) {
        collected.push(line.slice(4).trim());
      } else if (collected.length > 0) {
        break;
      }
    }

    return collected.length > 0 ? collected.filter(Boolean).join(' / ') : null;
  };

  return new Transform({
    objectMode: true,

    transform(file, encoding, callback) {
      try {
        const content = file.contents.toString();
        const { meta, body } = parseMetaAndBody(content);
        const filePath = file.relative || file.path;

        const slug = meta?.slug;
        if (!slug) {
          console.error(chalk.blue.bgRed.bold(`NO SLUG in shloka file "${filePath}"! Skipped.`));
          callback();
          return;
        }

        // Keep only the first variant when the body has multiple `------`-separated versions.
        // Strip leading blank lines and trailing whitespace, but preserve indentation on
        // the first non-blank line so indented code blocks (verse) are still recognized.
        const text = body
          .split(/\r?\n------\r?\n/)[0]
          .replace(/^(?:[ \t]*\r?\n)+/, '')
          .trimEnd();
        if (!text) {
          console.warn(chalk.black.bgYellow.bold(`Warning: EMPTY BODY in shloka file "${filePath}" (slug: ${slug}). Skipped.`));
          callback();
          return;
        }

        if (!Array.isArray(meta?.refs) || meta.refs.length === 0) {
          console.warn(chalk.black.bgYellow.bold(`Warning: NO REFS in shloka file "${filePath}" (slug: ${slug}).`));
        }

        const scriptures = normalizeRefList(meta?.scriptures);
        const verses = normalizeRefList(meta?.verses);

        // New parser per file: createTextRenderer keeps per-document state
        // (footnote back-link ids).
        const parser = new Marked({ ...shlokaParserOptions, renderer: createTextRenderer() });

        shlokasMap.set(slug, {
          slug,
          scriptures,
          verses,
          text: parser.parse(text),
          quote: extractFirstQuoteBlock(text),
          refsCount: Array.isArray(meta?.refs) ? meta.refs.length : 0
        });

        callback();

      } catch (error) {
        callback(error);
      }
    },

    flush(callback) {
      /** @type {Array<Shloka>} */
      const shlokas = Array.from(shlokasMap.entries())
        .sort(([slugA], [slugB]) => slugA.localeCompare(slugB))
        .map(([, entry]) => ({
          slug: entry.slug,
          scriptures: entry.scriptures,
          verses: entry.verses,
          text: entry.text,
          quote: entry.quote,
          refsCount: entry.refsCount
        }));

      this.push(new Vinyl({
        path: 'shlokas.json',
        contents: Buffer.from(JSON.stringify(shlokas, null, 2))
      }));

      callback();
    }
  });
}


/**/
module.exports = { buildShlokas };
