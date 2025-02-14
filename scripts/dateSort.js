const { ARCHIVE_CHRONOLOGY } = require('./const');

/**
 *
 */
function sortPostsByDate(dataArray) {
  const years = new Map(); // Posts with valid and relevant date. See ARCHIVE_CHRONOLOGY constant.
  const other = new Set(); // Other posts.
  
  // Separates posts by year and year validity.
  // Weird date cases are those exceeding the known year range and null.
  dataArray.forEach((post) => {
    const { date } = post.meta;
    if (!date) return other.add(post);
    
    const [y] = date.split('-');
    if (y > ARCHIVE_CHRONOLOGY.MAX || y < ARCHIVE_CHRONOLOGY.MIN) {
      return other.add(post);
    }
    
    const yearRecord = years.get(y) || (function() {
      years.set(y, new Set());
      return years.get(y);
    } ());
    
    yearRecord.add(post);
  });
  
  const yearArr = Array.from(years)
    // Sorts by year.
    // a: [yearString, Set<posts>]; b: [yearString, Set<posts>];
    .sort((a, b) => a[0] - b[0])
    .map(precessPostsByYear);
  
  /*const result =*/
  return yearArr.flat(2)
    .concat(Array.from(other))
    .map(addYearField);
  
  // result.forEach((post, idx) => {
  //   console.log(post.meta.year, post.meta.date, idx);
  // });
  // return result;
}


/**
 * @param year { String }
 * @param posts { Set<post> }
 * @returns { Array<post> }
 */
function precessPostsByYear([year, posts]) {
  const aYear = new Map();
  
  posts.forEach((post) => {
    const [y, m, d] = post.meta.date.split('-');
    
    const monthRecord = aYear.get(m) || (function() {
      aYear.set(m, new Set());
      return aYear.get(m);
    } ());
    
    monthRecord.add(post);
  });
  
  return sortMapOfPosts(aYear);
}


/**
 * Sorts months and included posts.
 * @param mapOfMonths { Map<month, Set<post>> }. month ['01'...'12'].
 * @returns { Array<post> }
 */
function sortMapOfPosts(mapOfMonths) {
  const UNKNOWN_MONTH = '00';
  const incorrectMonth = Array.from(mapOfMonths.get(UNKNOWN_MONTH) || []);
  mapOfMonths.delete(UNKNOWN_MONTH);
  
  const postsArr = Array.from(mapOfMonths)
    .sort((a, b) => a[0] - b[0])
    .map(sortPostsOfMonth);
  
  return postsArr.concat(incorrectMonth);
}


/**
 * Sorts posts by date. Items with incorrect date tail the output.
 * @param month { String }
 * @param posts { Set<post> }
 * @returns { Array<post> }
 */
function sortPostsOfMonth([month, posts]) {
  const correctDate = [];
  const incorrectDate = [];
  
  posts.forEach((post) => {
    const [y, m, d] = post.meta.date.split('-');
    if (!d || d === '00') {
      incorrectDate.push(post);
    } else {
      correctDate.push(post);
    }
  });
  
  correctDate.sort((a, b) =>
    Date.parse(a.meta.date) - Date.parse(b.meta.date)
  );
  
  return correctDate.concat(incorrectDate);
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
module.exports = { sortPostsByDate };
