const gulp = require('gulp');
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const shell = require('gulp-shell');
/**/
const { convertFiles } = require('./scripts/md2html');
const { DIRS } = require('./scripts/const');
const { getDictionaries } = require('./scripts/helpers');

/**
 *
 */
gulp.task('md2html-json', () => {
  return gulp
    .src(DIRS.INPUT + '/**/*.md')
    .pipe(convertFiles(getDictionaries(), true))
    .pipe(
      rename({ extname: '.json' })
    )
    .pipe(gulp.dest(DIRS.JSON_OUTPUT));
});


/**
 *
 */
gulp.task('md2html-html', () => {
  return gulp
    .src(DIRS.INPUT + '/**/*.md')
    .pipe(convertFiles(getDictionaries()))
    .pipe(
      rename({ extname: '.html' })
    )
    .pipe(gulp.dest(DIRS.HTML_OUTPUT));
});


/**
 *
 */
gulp.task('clean-json', shell.task('rm -rf ' + DIRS.JSON_OUTPUT));
gulp.task('clean-html', shell.task('rm -rf ' + DIRS.HTML_OUTPUT));

/**/
gulp.task('sass', () => {
  return gulp
    .src(DIRS.STYLES + '/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(DIRS.HTML_OUTPUT));
});


/**
 *
 */
gulp.task(
  'build-json',
  gulp.series('clean-json', 'md2html-json')
);

/**/
gulp.task(
  'build-html',
  gulp.series('clean-html', gulp.parallel('md2html-html', 'sass'))
);
