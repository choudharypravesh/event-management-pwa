var gulp = require('gulp');
var uglify = require('gulp-uglify');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync');
var gulp = require('gulp');
var path = require('path');
var swPrecache = require('sw-precache');

var paths = {
    src: './dist'	
};

gulp.task('service-worker', function (callback) {
    swPrecache.write(path.join(paths.src, '/sw.js'), {
        staticFileGlobs: [
            paths.src + '/scripts*',
            paths.src + '/stylesheets/*',
            paths.src + '/images/*'
        ],
        importScripts: [
            'scripts/vendors/sw-toolbox.js',
            'scripts/toolbox-script.js'
        ],
        stripPrefix: paths.src
    }, callback);
});

gulp.task('minify', function () {
    gulp.src('js/main.js')
        .pipe(uglify())
        .pipe(gulp.dest('build'));
});

gulp.task('processCSS', function () {
    gulp.src('styles/main.css')
        .pipe(sourcemaps.init())
        .pipe(autoprefixer())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('build'));
});

gulp.task('default', ['serve']);

gulp.task('watch', function () {
    gulp.watch('styles/*.css', ['processCSS']);
    gulp.watch('js/*.js', ['minify']);
});

gulp.task('serve', ['processCSS', 'minify'], function () {
    browserSync.init({
        server: '.',
        port: 3000
    });
    gulp.watch('styles/*.css', ['processCSS']).on('change', browserSync.reload);
    gulp.watch('js/*.js', ['minify']).on('change', browserSync.reload);
    gulp.watch('*.html').on('change', browserSync.reload);
});
