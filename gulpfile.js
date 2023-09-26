const gulp = require('gulp'),
  concat = require('gulp-concat'),
  terser = require('gulp-terser'),
  minify_html = require('gulp-minify-html'),
  webserver = require('gulp-webserver'),
  clean = require('gulp-clean')

var DEBUG = true

const srcDir = 'src/source/'
const buildDir = 'src/source/build/'

gulp.task('set-prod', cb => {
  DEBUG = false
  cb()
})

gulp.task('delete-build-folder', () => {
  return gulp.src(buildDir, { read: false, allowEmpty: true }).pipe(clean())
})

gulp.task('concat', () => {  
  const files = [
    'public/jsfxr.js',
    'public/jsfxrsequencer.js',
    'public/audio.js',
    'public/levels.js',
    'public/common.js',
    'public/game.js'
  ].map((v => srcDir + v))
  
  return gulp.src(files)
    .pipe(concat('index.js'))
    .pipe(gulp.dest(buildDir))
})

gulp.task('minify-js', () => {
  return gulp.src(buildDir + 'index.js')
    .pipe(terser({
      mangle: { toplevel: true }
    }))
    .pipe(gulp.dest(buildDir))
})

gulp.task('copy-html', () => {
  return gulp.src(srcDir + 'release/index.html')
    .pipe(gulp.dest(buildDir))
})

gulp.task('minify-html', () => {
  return gulp.src(buildDir + 'index.html')
    .pipe(minify_html({ collapseWhitespace: true }))
    .pipe(gulp.dest(buildDir))
})

gulp.task('copy-dist', () => {
  return gulp.src(buildDir + '*')
    .pipe(gulp.dest('./dist/target'))
})

gulp.task('build-debug', gulp.series(
  'delete-build-folder',
  'concat',
  'copy-html'
))

gulp.task('build-release', gulp.series(
  'set-prod',
  'delete-build-folder',
  'concat',
  'minify-js',
  'copy-html',
  'minify-html',
  'copy-dist'
))

gulp.task('serve', () => {
  return gulp.src(buildDir)
    .pipe(webserver({
      debugger: { enable: false },
      open: true,
      livereload: true
    }))
})

gulp.task('watch', () => {
  gulp.watch(srcDir, gulp.series('build-debug'))
})

gulp.task('run-debug', gulp.series('build-debug', 'serve', 'watch'))

gulp.task('default', gulp.series('run-debug'))
