const gulp = require('gulp');
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const shell = require('gulp-shell');
/**/
const { convertFiles } = require('./scripts/md2html');
const { DIRS } = require('./scripts/const');


/**
 *
 */
gulp.task('md2html-prod', () => {
  return gulp
    .src(DIRS.INPUT + '/**/*.md')
    .pipe(convertFiles(true))
    .pipe(
      rename({ extname: '.json' })
    )
    .pipe(gulp.dest(DIRS.PROD_OUTPUT));
});


/**
 *
 */
gulp.task('md2html-test', () => {
  return gulp
    .src(DIRS.INPUT + '/**/*.md')
    .pipe(convertFiles())
    .pipe(
      rename({ extname: '.html' })
    )
    .pipe(gulp.dest(DIRS.TEST_OUTPUT));
});


/**
 *
 */
gulp.task('clean', shell.task('rm -rf ' + DIRS.OUTPUT));

/**/
gulp.task('sass', () => {
  return gulp
    .src(DIRS.STYLES + '/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(DIRS.TEST_OUTPUT));
});


/**
 *
 */
gulp.task(
  'build-prod',
  gulp.series('clean', gulp.parallel('md2html-prod', 'sass'))
);

/**/
gulp.task(
  'build-test',
  gulp.series('clean', gulp.parallel('md2html-test', 'sass'))
);
