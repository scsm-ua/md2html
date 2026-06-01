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
  /**
   * @type {Map<string, { title: string, versesMap: Map<string, string> }>}
   * scriptureSlug -> { title, versesMap: verseSlug -> verseDisplayTitle }
   */
  const scripturesMap = new Map();

  return new Transform({
    objectMode: true,

    transform(file, encoding, callback) {
      try {
        const content = file.contents.toString();
        const [rawMeta] = content.split('---\n').filter(Boolean);
        const meta = yaml.parse(rawMeta.trim());

        const scriptures = meta?.scriptures;
        const verses = meta?.verses;

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

            versesMap.set(verse.slug, displayTitle);
          }
        }

        callback();

      } catch (error) {
        callback(error);
      }
    },

    flush(callback) {
      const compareVerses = ([, titleA], [, titleB]) => {
        const partsA = titleA.split(/[.\-–]/).map(Number);
        const partsB = titleB.split(/[.\-–]/).map(Number);
        for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
          const a = partsA[i] ?? 0;
          const b = partsB[i] ?? 0;
          if (a !== b) return a - b;
        }
        return 0;
      };

      const scriptures = Array.from(scripturesMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([slug, { title, versesMap }]) => ({
          slug,
          title,
          verses: Array.from(versesMap.entries())
            .sort(compareVerses)
            .map(([slug, title]) => ({ slug, title }))
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
