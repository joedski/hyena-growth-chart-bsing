/* eslint no-console: "off" */

'use strict';

const path = require( 'path' );

const gulp = require( 'gulp' );
const gulpIf = require( 'gulp-if' );
const gutil = require( 'gulp-util' );
const less = require( 'gulp-less' );
const sourcemaps = require( 'gulp-sourcemaps' );

const postcss = require( 'gulp-postcss' );
const autoprefixer = require( 'autoprefixer' );
const cssnano = require( 'cssnano' );

const source = require( 'vinyl-source-stream' );
const buffer = require( 'vinyl-buffer' );
const browserify = require( 'browserify' );



//////// Settings

const sourceDir = 'client';
const outputDir = 'public';
const scriptsSourceDir = 'app';
const stylesSourceDir = 'styles';

const buildEnv = process.env.NODE_ENV;



//////// General

gulp.task( 'default', [ 'site' ]);
gulp.task( 'watch', [ 'watch-site' ]);

gulp.task( 'site', [
	'site:assets',
	'site:styles',
	'site:scripts',
]);

gulp.task( 'watch-site', () => {
	gulp.watch([ `${ sourceDir }/assets/**/*` ], [
		'site:assets:site',
	]);

	gulp.watch([ `${ sourceDir }/${ stylesSourceDir }/**/*` ], [
		'site:styles',
	]);

	site_scripts_main( true );
});



//////// Scripts

gulp.task( 'site:scripts', [
	'site:scripts:main'
]);

gulp.task( 'site:scripts:main', () => site_scripts_main() );

// eslint-disable-next-line camelcase
function site_scripts_main( watch ) {
	let bundler = browserify( `${ sourceDir }/${ scriptsSourceDir }/index.js`, {
		debug: buildEnv !== 'production',
		cache: {}, packageCache: {}
	})
		.transform( 'envify' )
		.transform( 'babelify' )
		;

	if( buildEnv === 'production' ) {
		bundler = bundler.transform({ global: true }, 'uglifyify' );
	}

	if( watch ) {
		bundler = bundler.plugin( 'watchify' );
		bundler.on( 'update', execBundle );
		bundler.on( 'log', function() { gutil.log.apply( gutil, [ 'watch:app:scripts:combined/bundler:' ].concat( [].slice.call( arguments, 0 ) ) ); });
	}

	return execBundle();

	function execBundle() {
		let stream = bundler
			.bundle()
			.on( 'error', function( err ) {
				console.error( err.message );
				if( err.codeFrame ) console.error( err.codeFrame );
				this.emit( 'end' );
			})
			.pipe( source( 'app.js' ) )
			.pipe( buffer() )
			;

		if( buildEnv !== 'production' ) {
			stream = stream
				.pipe( sourcemaps.init({ loadMaps: true }) )
				.pipe( sourcemaps.write( './' ) )
				;
		}

		stream = stream
			.pipe( gulp.dest( `${ outputDir }` ) )
			;

		return stream;
	}
}



//////// Assets

gulp.task( 'site:assets', [
	'site:assets:site',
	// 'site:assets:jquery',
	// 'site:assets:bootstrap:scripts',
	'site:assets:bootstrap:fonts',
]);

gulp.task( 'site:assets:site', () => {
	return gulp.src([ `${ sourceDir }/assets/**/*` ])
		.pipe( gulp.dest( `${ outputDir }` ) )
		;
});

gulp.task( 'site:assets:jquery', () => {
	return gulp.src([
		'node_modules/jquery/dist/jquery.min.js',
	], { base: 'node_modules/jquery/dist' })
		.pipe( gulp.dest( `${ outputDir }` ) )
		;
});

gulp.task( 'site:assets:bootstrap:scripts', () => {
	return gulp.src([
		'node_modules/bootstrap/dist/js/bootstrap.min.js',
	], { base: 'node_modules/bootstrap/dist/js' })
		.pipe( gulp.dest( `${ outputDir }` ) )
		;
});

gulp.task( 'site:assets:bootstrap:fonts', () => {
	return gulp.src([ 'node_modules/bootstrap/dist/fonts/**/*' ])
		.pipe( gulp.dest( `${ outputDir }/fonts` ) )
		;
});



//////// Styles

gulp.task( 'site:styles', () => {
	return gulp.src([
		`node_modules/nvd3/build/nv.d3.css`,
		`${ sourceDir }/${ stylesSourceDir }/*.less`,
	])
		.pipe( buildEnv === 'production' ? sourcemaps.init() : gutil.noop() )
		.pipe( gulpIf( /\.less$/, less({
			paths: [
				path.join( __dirname, 'node_modules', 'bootstrap', 'less' )
			],
		})))
		.pipe( postcss([
				autoprefixer({ browsers: [ 'last 2 versions' ] }),
			].concat(
				buildEnv === 'production'
				? [ cssnano({ safe: true }) ]
				: []
		)))
		.on( 'error', function( err ) { console.error( err.message ); console.error( err.codeFrame ); this.emit( 'end' ); })
		.pipe( buildEnv === 'production' ? sourcemaps.write( './' ) : gutil.noop() )
		.pipe( gulp.dest( `${ outputDir }` ) )
		;
});

