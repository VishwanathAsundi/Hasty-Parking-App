var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
//var notify = require('gulp-notify');
var livereload = require('gulp-livereload');

gulp.task('default', function() {
  livereload.listen();
  var stream = nodemon({
    script: 'app.js',
    ext: 'js'
  });

  stream.on('restart', function(){
    gulp.src('app.js')
    .pipe(livereload()
      //  .pipe(notify('Reloading page, please wait...'))
      );
  }).on('crash', function() {
    console.error('Application has crashed!\n'+error);
 stream.emit('restart', 10); // restart the server in 10 seconds 
});
});
