const gulp = require('gulp');
const jsoncombinearray = require('gulp-jsoncombine-array');
const rename = require('gulp-rename');
const shell = require('gulp-shell');
/**/
const { convertFtnFiles } = require('./scripts/footnotes2html');
const { convertTextFiles } = require('./scripts/text2html');
const { buildTagsAndCategories } = require('./scripts/buildTagsAndCategories');
const { buildShlokas } = require('./scripts/buildShlokas');
const { DIRS, FILES, GLOBS } = require('./scripts/const');
const { getDictionaries } = require('./scripts/helpers');
const { groupPostsByYears } = require('./scripts/groupPostsByYears');

/**
 *
 */
gulp.task('text-json', () => {
  return gulp
    // follow: true — follow symlink.
    .src(GLOBS.POSTS, { follow: true })
    .pipe(convertTextFiles(getDictionaries()))
    .pipe(
      rename({ extname: '.json' })
    )
    .pipe(jsoncombinearray(FILES.COLLECTIONS.POSTS, (dataArray) =>
      Buffer.from(
        JSON.stringify(dataArray, null, 2)
      )
    ))
    .pipe(gulp.dest(DIRS.OUTPUT.JSON));
});


/**
 *
 */
gulp.task('ftn-json', () => {
  return gulp
    // follow: true — follow symlink.
    .src(GLOBS.NOTES, { follow: true })
    .pipe(convertFtnFiles())
    .pipe(
      rename({ extname: '.json' })
    )
    .pipe(jsoncombinearray(FILES.COLLECTIONS.FOOTNOTES, (dataArray) =>
      Buffer.from(JSON.stringify(dataArray, null, 2))
    ))
    .pipe(gulp.dest(DIRS.OUTPUT.JSON));
});


/**
 * Combines concise posts info into groups by years and months.
 */
gulp.task('build-grouped', () => {
  return gulp
    .src(DIRS.OUTPUT.JSON + '/' + FILES.COLLECTIONS.POSTS)
    .pipe(groupPostsByYears())
    .pipe(
      rename({ basename: FILES.COLLECTIONS.YEAR_GROUPED })
    )
    .pipe(gulp.dest(DIRS.OUTPUT.JSON));
});


/**
 * Generates shlokas.json from shloka notes MD source files.
 */
gulp.task('build-shlokas', () => {
  return gulp
    .src(GLOBS.SHLOKAS, { follow: true })
    .pipe(buildShlokas())
    .pipe(gulp.dest(DIRS.OUTPUT.JSON));
});


/**
 * Generates categories.json and tags.json from metadata in MD source files.
 */
gulp.task('build-tags-and-categories', () => {
  return gulp
    .src(GLOBS.POSTS, { follow: true })
    .pipe(buildTagsAndCategories())
    .pipe(gulp.dest(DIRS.OUTPUT.JSON));
});


/**
 *
 */
gulp.task('update-source', shell.task('yarn upgrade archive'));

/**
 *
 */
gulp.task('clean-json', shell.task('rm -rf ' + DIRS.OUTPUT.JSON));


/**
 *
 */
gulp.task(
  'build-json',
  gulp.series('clean-json', 'text-json', 'ftn-json', 'build-tags-and-categories', 'build-shlokas', 'build-grouped')
);

