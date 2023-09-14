const gulp = require('gulp')

require('./gulp/dev.js')

gulp.task(
  'default', gulp.series(
    'clean:dev',
    gulp.parallel('twig:dev', 'css:dev', 'js:dev', 'assets:dev', 'fonts:dev'),
    gulp.parallel('watch:dev')
  )
)