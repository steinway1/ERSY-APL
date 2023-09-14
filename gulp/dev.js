// Plugins
const gulp = require('gulp')
const data = require('gulp-data')
const path = require('path')
const fs = require('fs')
const clean = require('gulp-clean')
const changed = require('gulp-changed')
const server = require('gulp-server-livereload');
// HTML
const fileInclude = require('gulp-file-include')
const prettyHtml = require('gulp-pretty-html')
// Twig
const twig = require('gulp-twig')
// CSS
const sass = require('gulp-sass')(require('sass'))
const sassGlob = require('gulp-sass-glob')
const sourceMaps = require('gulp-sourcemaps')
const groupMedia = require('gulp-group-css-media-queries');
// JS
const webpack = require('webpack-stream')
// Other
const plumber = require('gulp-plumber')
const notify = require('gulp-notify')

// Utils
const settings = {
  fileInclude: { prefix: '@@', basepath: '@file' },
  server: { livereload: true, open: true },
  assets: { verbose: true }
}
const setPlumberNotify = (errorTitle) => {
  return {
    errorHandler: notify.onError({
      title: errorTitle,
      message: 'ERROR <%= error.message %>',
      sound: false
    })
  }
}


// Root
const root = {
  src: {
    _: './src/',
    html: './src/html/*.html',
    scss: './src/scss/*.scss',
    js: './src/js/*.js',
    assets: './src/assets/**/*',
    fonts: './src/fonts/*',
    templates: './src/templates/*.twig',
    data: './src/templates/data/'
  },
  dev: {
    _: './dev/',
    html: './dev/html/',
    css: './dev/css/',
    js: './dev/js/',
    assets: './dev/assets/',
    fonts: './dev/fonts/'
  }
}



// Tasks
gulp.task('include:dev',
  () => {
    return gulp
      .src(root.src.html)
      .pipe(changed(root.dev.html, { hasChanged: changed.compareContents }))
      .pipe(plumber(setPlumberNotify('HTML')))
      .pipe(fileInclude(settings.fileInclude))
      .pipe(gulp.dest(root.dev.html))
  }
)

gulp.task('twig:dev',
  () => {
    return gulp
      .src(root.src.templates, `!${root.src._}templates/test-backup.twig`)
      .pipe(changed(root.dev._))
      .pipe(plumber(setPlumberNotify('TWIG')))
      .pipe(data(function (file) {
        return JSON.parse(fs.readFileSync(`${root.src.data}data.json`));
      }))
      .pipe(data(function (file) {
        return JSON.parse(fs.readFileSync(`${root.src.data}items.json`));
      }))
      .pipe(data(function (file) {
        return JSON.parse(fs.readFileSync(root.src.data + path.basename(file.path) + '.json'));
      }))
      .pipe(twig())
      .pipe(prettyHtml())
      .pipe(gulp.dest(root.dev._))
  }
)

gulp.task('css:dev',
  () => {
    return gulp
      .src(root.src.scss)
      .pipe(changed(root.dev.css))
      .pipe(plumber(setPlumberNotify('SCSS')))
      .pipe(sourceMaps.init())
      .pipe(sassGlob())
      .pipe(sass())
      .pipe(groupMedia())
      .pipe(sourceMaps.write())
      .pipe(gulp.dest(root.dev.css))
  }
)

gulp.task('js:dev',
  () => {
    return gulp
      .src(root.src.js)
      .pipe(changed(root.dev.js))
      .pipe(plumber(setPlumberNotify('JAVASCRIPT')))
      // .pipe(babel())
      // .pipe(webpack(require('./../webpack.config.js')))
      .pipe(fileInclude())
      .pipe(gulp.dest(root.dev.js))
  }
)

gulp.task('assets:dev',
  () => {
    return gulp
      .src(root.src.assets)
      .pipe(changed(root.dev.assets))
      .pipe(gulp.dest(root.dev.assets))
  }
)

gulp.task('fonts:dev',
  () => {
    return gulp
      .src(root.src.fonts)
      .pipe(changed(root.dev.fonts))
      .pipe(gulp.dest(root.dev.fonts))
  }
)

gulp.task('clean:dev', (done) => {
  if (fs.existsSync(root.dev._)) {
    return gulp
      .src(root.dev._, { read: false })
      .pipe(clean({ force: true }))
  }
  done()
}
)

gulp.task('watch:dev',
  () => {
    gulp.watch('./src/templates/**/*.twig', gulp.parallel('twig:dev')),
      gulp.watch('./src/scss/**/*.scss', gulp.parallel('css:dev')),
      gulp.watch('./src/js/**/*.js', gulp.parallel('js:dev')),
      gulp.watch('./assets/**/*', gulp.parallel('assets:dev'))
  }
)

gulp.task('server:dev',
  () => {
    return gulp
      .src('./dev/')
      .pipe(server(settings.server))
  }
)