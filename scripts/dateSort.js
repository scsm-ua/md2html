const { ARCHIVE_CHRONOLOGY } = require('./const');

/**
 *
 */
function processPosts(posts) {
	return posts.map(addYearField);
}


/**
 *
 * @param post
 * @returns {*&{meta: (*&{year: (string|null)})}}
 */
function addYearField(post) {
  const [year] = (post.meta?.date || '').split('-');
  
  const isYearOk = year && (
    year <= ARCHIVE_CHRONOLOGY.MAX ||
    year >= ARCHIVE_CHRONOLOGY.MIN
  );
  
  return {
    ...post,
    meta: {
      ...post.meta,
      year: isYearOk ? year : null
    }
  };
}


/**
 *
 */
module.exports = { processPosts };
