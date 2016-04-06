// ============================================================================
// Contents
// ============================================================================

// 1. Variables
// 2. Clean
// 3. Compile
  // 3.1 HTML/JS
  // 3.2 CSS
  // 3.3 Images
// 4. Watch
// 5. Serve
// 6. Default Task


// ============================================================================
// 1. Variables
// ============================================================================

var gulp = require('gulp');
var $ = require('load-plugins')('gulp-*', { strip: ['gulp'] });

var browserSync = require('browser-sync').create();
var del = require('del');
var exec = require('child_process').exec;
var pngquant = require('imagemin-pngquant');
var runSequence = require('run-sequence').use(gulp);

// Paths
var src = 'src';
var dest = 'dist';

var srcHtml = src + '/*.html';
var srcCss = src + '/assets/css';
var srcJs = src + '/assets/js';
var srcImg = src + '/assets/img';

var destCss = dest + '/assets/css';
var destJs = dest + '/assets/js';
var destImg = dest + '/assets/img';
var destFonts = dest + '/assets/fonts';


// ============================================================================
// 2. Clean
// ============================================================================

gulp.task('clean', function() {
  return del(dest);
});


// ============================================================================
// 3. Compile Tasks
// ============================================================================

gulp.task('compile', ['html', 'css', 'img']);


// 3.1 HTML/JS
// ============================================================================

gulp.task('html', function() {
  var assets = $.useref.assets();

  return gulp.src(srcHtml)
    .pipe(assets)
    .pipe($.if('*.js', $.uglify()))
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe(gulp.dest(dest))
    .pipe(browserSync.stream());
});


// 3.2 CSS
// ============================================================================

gulp.task('css:lint', function() {
  var stylelint = require('stylelint');
  var reporter = require('postcss-reporter');

  return gulp.src(srcCss + '/**/*.css')
    .pipe($.postcss([
      stylelint(),
      reporter({
        clearMessages: true,
        positionless: "last"
      })
    ]))
});

gulp.task('css', ['css:lint'], function() {
  var postcss = require('load-plugins')('postcss-*');
  var lost = require('lost');

  return gulp.src(srcCss + '/styles.css')
    .pipe($.sourcemaps.init())
    .pipe($.postcss([
      require('postcss-import'),
      require('precss'),
      require('postcss-cssnext'),
      require('postcss-vertical-rhythm'),
      lost,
      require('postcss-hexrgba'),
      require('postcss-round-subpixels'),
      require('postcss-pxtorem'),
      require('postcss-reporter')
    ]))
    .pipe($.minifyCss())
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(destCss))
    .pipe(browserSync.stream());
});


// 3.3 Images
// ============================================================================

gulp.task('img', function() {
  return gulp.src(srcImg + '/**/*.+(gif|png|jpg|jpeg|ico|svg)')
    .pipe($.imagemin({
      progressive: true,
      use: [pngquant()]
    }))
    .pipe(gulp.dest(destImg));
});


// ============================================================================
// 4. Watch
// ============================================================================

gulp.task('watch', function() {
  gulp.watch([
    srcHtml,
    srcJs + '/**/*.js'
  ], ['html']);
  gulp.watch([
    srcCss + '/**/*.css',
  ], ['css']);
  gulp.watch(srcImg + '/**/*.+(gif|png|jpg|jpeg|ico|svg)', ['img']);
});


// ============================================================================
// 5. Serve
// ============================================================================

gulp.task('serve', function() {
  browserSync.init({
    server: {
      baseDir: dest
    },
    injectChanges: true,
    notify: false,
    ui: false
  })
});


// ============================================================================
// 6. Default Task (Clean + Compile + Watch + Serve)
// ============================================================================

gulp.task('default', function(callback) {
  runSequence('clean', 'compile', ['watch', 'serve'], callback);
});
