const { ARCHIVE_CHRONOLOGY } = require('./const');

/**
 *
 */
function sortPostsByDate(dataArray) {
  const years = new Map(); // Posts with valid and relevant date. See ARCHIVE_CHRONOLOGY constant.
  const other = new Set(); // Other posts.
  const posts = [];
  
  // Separates posts by year and year validity.
  // Weird date cases are: null, '1987.00'.
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
  
  // Sorts posts of each year by date. Posts without day or invalid date are placed in the end of the set.
  years.forEach((recordSet, year, map) => {
    const wrongDate = new Set();
    const records = new Set();
    // console.log('+++++++', year, recordSet.size); // To check the length of each year.
    
    recordSet.forEach((rec) => {
      const [y, m, d] = rec.meta.date.split('-');
      const isDateOk = d && !Number.isNaN(Date.parse(rec.meta.date));
      isDateOk ? records.add(rec) : wrongDate.add(rec);
    });
    
    const arr = Array.from(records);
    arr.sort((a, b) =>
      Date.parse(a.meta.date) - Date.parse(b.meta.date)
    );
    
    posts.push([...arr, ...Array.from(wrongDate)]);
  });
  
  // In the end of sorted posts we place post of irrelevant dates.
  posts.push(Array.from(other));
  // console.log('+++++++', null, other.size); // To check the length of irrelevant.
  
  const result = addYearField(posts);
  // result.forEach((post, idx) => {
  //   console.log(post.meta.date, idx);
  // });
  
  return result;
}


/**
 * Adds `year` field to each post meta.
 */
function addYearField(posts) {
  return posts
    .flatMap((x) => x)
    .map((post) => {
      const [y] = (post.meta?.date || '').split('-');
      const isYearOk = y && (
        y <= ARCHIVE_CHRONOLOGY.MAX ||
        y >= ARCHIVE_CHRONOLOGY.MIN
      );
      
      return {
        ...post,
        meta: {
          ...post.meta,
          year: isYearOk ? y : null
        }
      };
    });
}


/**
 *
 */
module.exports = { sortPostsByDate };
