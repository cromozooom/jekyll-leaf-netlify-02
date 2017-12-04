	var gulp		= require('gulp'),
		browserSync	= require('browser-sync'),
		sass		= require('gulp-sass'),
		prefix		= require('gulp-autoprefixer'),
		cp			= require('child_process')
		
		path			= require('path'), // Directories here
		critical		= require('critical'),
		pug				= require('gulp-pug'),
		imagemin		= require('gulp-imagemin'),
		sourcemaps		= require('gulp-sourcemaps'),
		gulpif			= require('gulp-if'),
		uncss			= require('gulp-uncss'),
		uglify			= require('gulp-uglify'),
		useref			= require('gulp-useref'),
		babel			= require('gulp-babel');

var jekyll = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';
var messages = {
	jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

// Directories here
var paths = {
	src:		'./src/',
	data:		'./src/_data/',
	img:		'./src/images/',
	sass:		'./src/sass/',
	js:			'./src/js/',
	
	public:		'./_includes/',
	pIMG:		'./_includes/images/',
	pCSS:		'./_includes/css/',
	pJS:		'./_includes/js/',
};

// Compile .pug files and pass in data from json file
// matching file name. index.pug - index.pug.json
gulp.task('includes', function () {
	return gulp.src('./src/includes/*.pug')
	.pipe(pug({pretty: true}))
	.on('error', function (err) {
		process.stderr.write(err.message + '\n');
		this.emit('end');
	})
	.pipe(gulp.dest('./_includes'));
});

// Compile .pug files and pass in data from json file
// matching file name. index.pug - index.pug.json
gulp.task('layout', function () {
	return gulp.src('./src/layouts/*.pug')
	.pipe(pug({pretty: true}))
	.on('error', function (err) {
		process.stderr.write(err.message + '\n');
		this.emit('end');
	})
	.pipe(gulp.dest('./_layouts'));
});


/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
	browserSync.notify(messages.jekyllBuild);
	return cp.spawn( jekyll , ['build'], {stdio: 'inherit'})
		.on('close', done);
});

	/**
	 * Rebuild Jekyll & do page reload
	 */
	gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
		browserSync.reload();
	});

	/**
	 * Wait for jekyll-build, then launch the Server
	 */
	gulp.task('browser-sync', ['sass', 'jekyll-build'], function() {
		browserSync({
			server: {
				baseDir: '_site'
			}
		});
	});

	/**
	 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
	 */
	gulp.task('sass', function () {
		return gulp.src('src/sass/app.scss')
			.pipe(sass({
				includePaths: ['scss'],
				outputStyle: 'compressed',
				onError: browserSync.notify
			}))
			.pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
			.pipe(gulp.dest('css'))
			.pipe(browserSync.reload({stream:true}))
			.pipe(gulp.dest('css'));
	});

	/**
	 * Watch scss files for changes & recompile
	 * Watch html/md files, run jekyll & reload BrowserSync
	 */
	gulp.task('watch', function () {
		gulp.watch('src/sass/*.scss', ['sass', 'jekyll-rebuild']);
		gulp.watch(['src/**/*.pug'], ['includes', 'layout', 'jekyll-rebuild']);
		gulp.watch(['*.html', '_layouts/*.html', '_posts/*'], [ 'jekyll-rebuild']);
		
	});

	/**
	 * Default task, running just `gulp` will compile the sass,
	 * compile the jekyll site, launch BrowserSync & watch files.
	 */
	gulp.task('default', ['includes', 'layout', 'browser-sync', 'watch']);
