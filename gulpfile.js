const gulp  	    = require('gulp'),
	   sass 		    = require('gulp-sass'),
	   browserSync  = require('browser-sync'),
	   concat 	    = require('gulp-concat'),
	   terser 	    = require('gulp-terser'),
	   cssnano 	    = require('gulp-cssnano'),
	   concatCss    = require('gulp-concat-css'),
	   rename 	    = require('gulp-rename'),
	   clean 	    = require('gulp-clean'),
	   autoprefixer = require('gulp-autoprefixer'),
	   sourcemaps   = require('gulp-sourcemaps');

// ===========================
// Компиляция SASS
// ===========================	  

gulp.task('sass', () => {
	gulp.src('app/sass/**/*.+(sass|scss)')
		.pipe(sourcemaps.init())
		.pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
		.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7']))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('app/css'))
		.pipe(browserSync.stream());
});

// ===========================
// Live reload
// ===========================	

gulp.task('watch', ['sass'], () => {
	browserSync.init({
		server: {
			baseDir: 'app'
		},
		notify: false
	});

	gulp.watch('app/sass/**/*.+(sass|scss)', ['sass']);
	gulp.watch('app/**/*.+(html|js)', browserSync.reload);
});

// ===========================
// Конкатенация библиотек
// ===========================

gulp.task('concat-js', () => {
	gulp.src([
		'node_modules/vue/dist/vue.min.js',
		'node_modules/lodash/lodash.min.js',
		'node_modules/jquery/dist/jquery.min.js',
		'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.min.js',
		'node_modules/canvas-confetti/dist/confetti.browser.js',
		'node_modules/pouchdb/pouchdb.min.js'
	])
	.pipe(concat('libs.min.js'))
	.pipe(terser())
	.pipe(gulp.dest('app/js'));
});

gulp.task('concat-css', () => {
	gulp.src([
		'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.min.css'
	])
	.pipe(concatCss('libs.min.css'))
	.pipe(cssnano())
	.pipe(gulp.dest('app/css'));
});

gulp.task('concat-all', ['concat-js', 'concat-css']);

// ===========================
// Минификация своих CSS / JS
// ===========================

gulp.task('js-min', () => {
	gulp.src('app/js/main.js')
		.pipe(terser())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('app/js'));
});

gulp.task('css-min', () => {
	gulp.src('app/css/styles.css')
		.pipe(cssnano())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('app/css'));
});

gulp.task('all-min', ['js-min', 'css-min']); 

// ===========================
// Подготовить проект
// ===========================

gulp.task('init', ['sass', 'concat-all']);

// ===========================
// Очистить папку build
// ===========================

gulp.task('clean', () => {
	gulp.src('dist/*', {read: false})
	  	.pipe(clean());
});

// ===========================
// Собрать проект
// ===========================

gulp.task('build', ['clean', 'sass', 'concat-all', 'all-min'], () => {
	gulp.src('app/css/**/*')
		.pipe(gulp.dest('dist/css'));

	gulp.src('app/fonts/**/*')
		.pipe(gulp.dest('dist/fonts'));
		
	gulp.src('app/js/**/*')
		.pipe(gulp.dest('dist/js'));	

	gulp.src('app/img/**/*')
		.pipe(gulp.dest('dist/img'));
		
	gulp.src(['app/*.html', 'app/*.php', 'favicon.*'])
		.pipe(gulp.dest('dist'));	
});

// ===========================
// Переименовать оптимизированные картинки и удалить исходники
// ===========================

gulp.task('img-rr', () => {
	gulp.src('app/img/**/*-min.*')
		.pipe(rename((opt, file) => {
			opt.basename = opt.basename.slice(0, -4);
			gulp.src('app/img/**/' + file)
				.pipe(clean());
			gulp.src(file.history[0], {read: false})
				.pipe(clean());
			return opt;		
		}))
		.pipe(gulp.dest('app/img'));
});