const { Transform } = require('stream');
const Vinyl = require('vinyl');
const yaml = require('yaml');


/**
 * Collects scriptures and their verses from all notes MD files in the stream,
 * then emits a single scriptures.json file on flush.
 *
 * Verse–scripture matching is done by slug prefix:
 *   verse slug "bhagavad-gita-1-14" → scripture slug "bhagavad-gita"
 *
 * @returns {Transform}
 */
function buildScriptures() {
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

  const extractFirstItalicSection = (body) => {
    const match = body.match(/(?:^|[\s(>])\*([^*\n][^*]*?)\*(?=$|[\s,.;:!?)}\]])/u);
    if (!match) {
      return null;
    }

    const quote = match[1].trim();
    const wordsCount = quote.split(/[-\s]+/u).filter(Boolean).length;

    return wordsCount > 2 ? quote : null;
  };

  /**
  * @type {Map<string, { title: string, versesMap: Map<string, { title: string, quote: string | null, refsCount: number }> }>}
  * scriptureSlug -> { title, versesMap: verseSlug -> { title, quote, refsCount } }
   */
  const scripturesMap = new Map();

  return new Transform({
    objectMode: true,

    transform(file, encoding, callback) {
      try {
        const content = file.contents.toString();
        const { meta, body } = parseMetaAndBody(content);

        const scriptures = meta?.scriptures;
        const verses = meta?.verses;
        const refs = Array.isArray(meta?.refs) ? meta.refs : [];
        const quote = extractFirstItalicSection(body);

        if (!Array.isArray(scriptures) || !Array.isArray(verses)) {
          callback();
          return;
        }

        for (const scripture of scriptures) {
          if (!scripture?.slug || !scripture?.title) continue;

          if (!scripturesMap.has(scripture.slug)) {
            scripturesMap.set(scripture.slug, {
              title: scripture.title,
              versesMap: new Map()
            });
          }

          const { versesMap } = scripturesMap.get(scripture.slug);

          for (const verse of verses) {
            if (!verse?.slug || !verse?.title) continue;

            // Match verse to scripture by slug prefix to avoid mixing scriptures.
            if (!verse.slug.startsWith(scripture.slug + '-') && verse.slug !== scripture.slug) {
              continue;
            }

            // Strip "Scripture Title " prefix from verse display title.
            const prefix = scripture.title + ' ';
            const displayTitle = verse.title.startsWith(prefix)
              ? verse.title.slice(prefix.length).trim()
              : verse.title;

            versesMap.set(verse.slug, {
              title: displayTitle,
              quote,
              refsCount: refs.length
            });
          }
        }

        callback();

      } catch (error) {
        callback(error);
      }
    },

    flush(callback) {
      const compareVerses = ([, titleA], [, titleB]) => {
        const partsA = titleA.title.split(/[.\-–]/).map(Number);
        const partsB = titleB.title.split(/[.\-–]/).map(Number);
        for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
          const a = partsA[i] ?? 0;
          const b = partsB[i] ?? 0;
          if (a !== b) return a - b;
        }
        return 0;
      };

      const normalizeTitleForSort = (title) => {
        const trimmed = String(title || '').trim();
        const stripped = trimmed.replace(/^[^\p{L}\p{N}]+/u, '');
        return stripped || trimmed;
      };

      /** @type {Array<Scripture>} */
      const scriptures = Array.from(scripturesMap.entries())
        .sort((a, b) => {
          const [, scriptureA] = a;
          const [, scriptureB] = b;
          const titleA = normalizeTitleForSort(scriptureA.title);
          const titleB = normalizeTitleForSort(scriptureB.title);
          const byTitle = titleA.localeCompare(titleB, 'ru', { sensitivity: 'base' });
          if (byTitle !== 0) {
            return byTitle;
          }

          const byOriginalTitle = scriptureA.title.localeCompare(scriptureB.title, 'ru', { sensitivity: 'base' });
          if (byOriginalTitle !== 0) {
            return byOriginalTitle;
          }

          // Keep output deterministic when titles are equal.
          return a[0].localeCompare(b[0]);
        })
        .map(([slug, { title, versesMap }]) => ({
          slug,
          title,
          verses: Array.from(versesMap.entries())
            .sort(compareVerses)
            .map(([slug, verseData]) => ({
              slug,
              title: verseData.title,
              quote: verseData.quote,
              refsCount: verseData.refsCount
            }))
        }));

      this.push(new Vinyl({
        path: 'scriptures.json',
        contents: Buffer.from(JSON.stringify(scriptures, null, 2))
      }));

      callback();
    }
  });
}


/**/
module.exports = { buildScriptures };
