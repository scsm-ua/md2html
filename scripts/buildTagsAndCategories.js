const { Transform } = require('stream');
const Vinyl = require('vinyl');
const yaml = require('yaml');


/**
 * Collects unique categories and tags from all MD files in the stream,
 * then emits categories.json and tags.json on flush.
 *
 * @returns {Transform}
 */
function buildTagsAndCategories() {
  /** @type {Map<string, string>} slug -> title */
  const categoriesMap = new Map();
  /** @type {Map<string, string>} slug -> title */
  const tagsMap = new Map();

  return new Transform({
    objectMode: true,

    transform(file, encoding, callback) {
      try {
        const content = file.contents.toString();
        const [rawMeta] = content.split('---\n').filter(Boolean);
        const meta = yaml.parse(rawMeta.trim());

        if (meta?.category?.slug && meta?.category?.title) {
          categoriesMap.set(meta.category.slug, meta.category.title);
        }

        if (Array.isArray(meta?.tags)) {
          for (const tag of meta.tags) {
            if (tag?.slug && tag?.title) {
              tagsMap.set(tag.slug, tag.title);
            }
          }
        }

        callback();

      } catch (error) {
        callback(error);
      }
    },

    flush(callback) {
      const toSorted = (map) =>
        Array.from(map.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([slug, name]) => ({ name, slug }));

      this.push(new Vinyl({
        path: 'categories.json',
        contents: Buffer.from(JSON.stringify(toSorted(categoriesMap), null, 2))
      }));

      this.push(new Vinyl({
        path: 'tags.json',
        contents: Buffer.from(JSON.stringify(toSorted(tagsMap), null, 2))
      }));

      callback();
    }
  });
}


/**/
module.exports = { buildTagsAndCategories };
