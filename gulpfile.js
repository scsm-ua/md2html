const fs = require('fs');
/**/
const gulp = require('gulp');
const path = require('path');
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
/**/
const { convertFiles } = require('./scripts/md2html');
const { DIRS, INPUT_FILES } = require('./scripts/config');


/**
 *
 */
gulp.task('md2html', () => {
  return gulp
    .src(DIRS.INPUT + '/' + INPUT_FILES[0])
    .pipe(convertFiles())
    .pipe(
      rename({
        extname: '.html'
      })
    )
    .pipe(gulp.dest(DIRS.OUTPUT));
});

/**
 *
 */
gulp.task('sass', () => {
  return gulp
    .src(DIRS.STYLES + '/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(DIRS.OUTPUT));
});

/**
 *
 */
gulp.task('build-test', gulp.parallel('md2html', 'sass'));
