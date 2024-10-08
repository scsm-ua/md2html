const gulp = require('gulp');
const jsoncombinearray = require('gulp-jsoncombine-array');
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const shell = require('gulp-shell');
/**/
const { convertFtnFiles } = require('./scripts/footnotes2html');
const { convertTextFiles } = require('./scripts/text2html');
const { convertTags } = require('./scripts/convertTags');
const { DIRS, FILES } = require('./scripts/const');
const { getDictionaries } = require('./scripts/helpers');

/**
 *
 */
gulp.task('text-json', () => {
  return gulp
    .src(DIRS.INPUT + '/**/*.md')
    .pipe(convertTextFiles(getDictionaries(), true))
    .pipe(
      rename({ extname: '.json' })
    )
    .pipe(jsoncombinearray(FILES.COLLECTIONS.POSTS, (dataArray) =>
      Buffer.from(JSON.stringify(dataArray, null, 4))
    ))
    .pipe(gulp.dest(DIRS.JSON_OUTPUT));
});


/**
 *
 */
gulp.task('text-html', () => {
  return gulp
    .src(DIRS.INPUT + '/**/*.md')
    .pipe(convertTextFiles(getDictionaries()))
    .pipe(
      rename({ extname: '.html' })
    )
    .pipe(gulp.dest(DIRS.HTML_OUTPUT));
});


/**
 *
 */
gulp.task('ftn-json', () => {
  return gulp
    .src(DIRS.TEMP_INPUT + '/**/*.md')
    .pipe(convertFtnFiles(true))
    .pipe(
      rename({ extname: '.json' })
    )
    .pipe(jsoncombinearray(FILES.COLLECTIONS.FOOTNOTES, (dataArray) =>
      Buffer.from(JSON.stringify(dataArray, null, 4))
    ))
    .pipe(gulp.dest(DIRS.JSON_OUTPUT));
});

/**
 *
 */
gulp.task('ftn-html', () => {
  return gulp
    .src(DIRS.TEMP_INPUT + '/**/*.md')
    .pipe(convertFtnFiles())
    .pipe(
      rename({ extname: '.html' })
    )
    .pipe(gulp.dest(DIRS.HTML_OUTPUT));
});


/**
 *
 */
gulp.task('html-single', () => {
  return gulp
    .src(
      [
        '/04-vrindavan-zhit-odnoy-semyey-s-bogom' +
        '/041_1982-01-19-b1_sridharmj_zemlya_samopojertvovaniya.md',
        '/07-lichnost-i-dar-chaitanyi-v-poezii-vaishnavov' +
        '/119-1982-05-09-b2-dlya-mahaprabhu-kazhdyj-holm-byl-govardhanom-a-kazhdyj-les-vrindavanom.md',
        '/14-kak-poznat-i-uvidet-boga' +
        '/204-1982-03-30-b2-krishnu-mozhet-prinyat-lish-tot-kto-svoboden-ot-zavisti.md',
        '/64-shrila-sridhar-maharaj-o-svoey-biografii-lichnosti-i-duhovnom-opyte' +
        '/992-1981-03-12-a1-bog-pomogaet-iskrennim-iskatelyam-istiny-o-miltone-i-vordsvorte.md',
        '/71-o-vazhnosti-rasprostraneniya-ucheniya-shrily-sridhara-maharaja/1134-1982-07-02-a4-shrila-shridhar-maharadzh-delaet-sokrovennye-istiny-o-soznanii-krishny-bolee-otchetlivymi.md'
        // '/75-poeziya-shrily-b-r-sridhara-maharaja-v-ispolnenii-shrily-b-s-govindy-maharaja/1145-shri-shri-dajita-dasa-dashakam.md'
      ].map((path) => DIRS.INPUT + path)
    )
    .pipe(convertTextFiles(getDictionaries()))
    .pipe(
      rename({ extname: '.html' })
    )
    .pipe(gulp.dest(DIRS.TEST_OUTPUT));
});


/**
 *
 */
gulp.task('build-tags', () => {
  return gulp
    .src(DIRS.ARCHIVE + '/**/*.json')
    .pipe(convertTags())
    .pipe(gulp.dest(DIRS.JSON_OUTPUT));
});


/**
 *
 */
gulp.task('update-source', shell.task('yarn upgrade archive'));

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
  gulp.series('clean-json', 'text-json', 'build-tags')
);

/**/
gulp.task(
  'build-html',
  gulp.series('clean-html', 'text-html', 'sass')
);

/**/
gulp.task(
  'html-test',
  gulp.series(
    gulp.parallel('sass', 'html-single'),
    shell.task(
      `cp ${DIRS.HTML_OUTPUT}/${FILES.STYLES.CSS} ${DIRS.OUTPUT}`
    )
  )
);
