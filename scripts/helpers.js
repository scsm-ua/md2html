const chalk = require('chalk');
const fs = require('fs');
/**/
const { DIRS, FILES } = require('./const');

/**
 *
 */
function readSlugList(name) {
  const str = fs.readFileSync(DIRS.ARCHIVE + '/' + name).toString();
  return Object.keys(JSON.parse(str));
}

/**
 *
 */
function getDictionaries() {
  return {
    categories: readSlugList(FILES.ARCHIVE.CATEGORIES),
    tags: readSlugList(FILES.ARCHIVE.TAGS)
  }
}


/**
 *
 */
function validateMeta(meta, { categories, tags }) {
  if (!('category' in meta)) {
    const msg = `Warning: File "${meta.slug}.md" has no category`;
    console.warn(chalk.black.bgYellow.bold(msg));
    
  } else if (!categories.includes(meta.category.slug)) {
    const msg = `File "${meta.slug}.md" has unknown category slug "${meta.category.slug}"!`;
    console.error(chalk.blue.bgRed.bold(msg));
    throw new Error("Encountered unknown category!");
  }
  
  if (!('tags' in meta) || !meta.tags.length) {
    const msg = `Warning: File "${meta.slug}.md" has no tags`;
    console.warn(chalk.black.bgYellow.bold(msg));
  }
  
  const invalidTag = meta.tags?.find((tag) => !tags.includes(tag.slug));

  if (invalidTag) {
    const msg = `File "${meta.slug}.md" has unknown tag "${invalidTag.slug}"!`;
    console.error(chalk.blue.bgRed.bold(msg));
    throw new Error("Encountered unknown tag!");
  }
}

/**/
module.exports = {
  getDictionaries,
  validateMeta
};
