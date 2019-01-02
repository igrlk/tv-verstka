var gulp         = require('gulp'),
    gulpChanged  = require('gulp-changed'),
    stylus       = require('gulp-stylus'), 
    browserSync  = require('browser-sync'),
    concat       = require('gulp-concat'),
    uglify       = require('gulp-uglifyjs'),
    cssnano      = require('gulp-cssnano'),
    rename       = require('gulp-rename'),
    del          = require('del'),
    imagemin     = require('gulp-imagemin'),
    pngquant     = require('imagemin-pngquant'),
    cache        = require('gulp-cache'),
    autoprefixer = require('gulp-autoprefixer'),
    pug          = require('gulp-pug');

gulp.task('pug', function buildHTML() {
  return gulp.src('app/pug/**/*.pug')
  .pipe(gulpChanged('app', {hasChanged: gulpChanged.compareContents}))
  .pipe(pug({
    pretty: true
  }))
  .pipe(gulp.dest('app'))
});

gulp.task('stylus', function() { 
    return gulp.src('app/stylus/**/*.styl') 
    .pipe(stylus({
        'include css': 'true'
    }))
    .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {cascade: true}))
    .pipe(gulp.dest('app/css')) 
    .pipe(browserSync.reload({stream: true})) 
}); 

gulp.task('scripts', function() {
    return gulp.src([
        'app/libs/jquery.min.js',
        'app/libs/jquery.fancybox.min.js',
        'app/libs/jquery.sticky-kit.js',
        'app/libs/owl.carousel.min.js',
        'app/libs/jquery.nice-select.min.js',
        'app/libs/jquery.nicescroll.min.js',
        // 'app/libs/masonry.pkgd.min.js',
        'app/libs/jquery-ui.min.js',
        'app/libs/jquery.touch-punch.min.js',
        // 'app/libs/jquery.maskedinput.min.js',
        // 'app/libs/jquery.touchSwipe.min.js',
    ])
    .pipe(concat('libs.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('app/js'));
});

gulp.task('css-libs', ['stylus'], function(){
    return gulp.src('app/css/libs.css')
    .pipe(cssnano())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('app/css'));
});

gulp.task('browser-sync', function() { 
    browserSync({
        open: false, 
        server: { 
            baseDir: 'app' 
        },
        browser: 'chrome',
        notify: false 
    }); 
}); 

gulp.task('clean', function() {
    return del.sync('dist');
});

gulp.task('cache-clear', function() {
    return cache.clearAll();
});

gulp.task('img', function() {
    return gulp.src('app/img/**/*')
    .pipe(cache(imagemin({
        interlaced: true,
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        une: [pngquant()]
    })))
    .pipe(gulp.dest('dist/img'));
});

gulp.task('watch', ['browser-sync', 'css-libs', 'scripts'], function() { 
    gulp.watch('app/pug/**/*.pug', ['pug']);
    gulp.watch('app/stylus/**/*.styl', ['stylus']); 
    gulp.watch('app/*.html', browserSync.reload); 
    gulp.watch('app/js/**/*.js', browserSync.reload); 
});

// 'img' before 'pug'
gulp.task('build', ['clean', 'cache-clear', 'img', 'pug', 'stylus', 'scripts'], function() {
    
    var buildCss = gulp.src([
        'app/css/main.css',
        'app/css/libs.min.css'
    ])
    .pipe(gulp.dest('dist/css'));
    
    var buildFonts = gulp.src('app/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'));
    
    var buildJs = gulp.src('app/js/**/*')
    .pipe(gulp.dest('dist/js'));
    
    var buildHtml = gulp.src('app/*.html')
    .pipe(gulp.dest('dist'));
});