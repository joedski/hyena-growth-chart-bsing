/* eslint no-console: "off" */

'use strict';

const path = require( 'path' );
const fs = require( 'fs' );

const gulp = require( 'gulp' );
const gulpIf = require( 'gulp-if' );
const gutil = require( 'gulp-util' );
const hb = require( 'gulp-hb' );
const less = require( 'gulp-less' );
const sourcemaps = require( 'gulp-sourcemaps' );

const postcss = require( 'gulp-postcss' );
const autoprefixer = require( 'autoprefixer' );
const cssnano = require( 'cssnano' );
const merge = require( 'merge2' );

const source = require( 'vinyl-source-stream' );
const buffer = require( 'vinyl-buffer' );
const browserify = require( 'browserify' );
const buildUtils = require( './gulpscripts/util' );



//////// Settings

const sourceDir = 'client';
const outputDir = 'public';
const scriptsSourceDir = 'app';
const stylesSourceDir = 'styles';
const mainEntry = `${ sourceDir }/${ scriptsSourceDir }/index.js`;

function getPagesDirs() {
  return fs.readdirSync( path.join( '.', 'client', 'pages' ) )
    .map( d => ({
      // page name for reasons.
      pageName: d,
      // Base source path.
      sourceBase: path.join( sourceDir, 'pages', d ),
      // Base dest path fragment, relative to the outputDir.
      destBase: d,
    }) )
    .map( ds => Object.assign( ds, {
      // Source JS file.
      sourceJS: path.join( ds.sourceBase, 'index.js' ),
      // Dest JS file.
      destJS: path.join( `${ds.destBase}_files`, 'app.js' ),
      // Dest HTML file.
      destHTML: path.join( `${ds.destBase}.html` ),
    }))
    .map( ds => Object.assign( ds, {
      // Used by the HTML template.
      destJSRelative: path.relative( path.dirname( ds.destHTML ), ds.destJS ),
    }))
    ;
}

// const pagesDirs = getPagesDirs();

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

	// site_scripts_main( mainEntry, true );
  // pagesEntryPoints.forEach()

  site_scripts_main_all( true );
  site_scripts_html_all( true );
});



//////// Scripts

gulp.task( 'site:scripts', [
	'site:scripts:main',
  'site:scripts:html',
]);

gulp.task( 'site:scripts:main', () => site_scripts_main_all() );

gulp.task( 'site:scripts:html', () => site_scripts_html_all() );

function site_scripts_html_all( watch ) {
  function execTask() {
    const pagesDirs = getPagesDirs();
    const htmlTemplate = fs.readFileSync( path.join( sourceDir, 'templates', 'chart-page.hbs' ) );

    gutil.log( `Building html files for ${pagesDirs.map( d => d.pageName ).join(', ')}`);

    return new buildUtils.FileObjectEmitter({
      files: pagesDirs,
      factory: ( pageDir ) => {
        const file = new gutil.File({
          base: '',
          cwd: '',
          path: pageDir.destHTML,
          contents: htmlTemplate,
        });

        file.data = {
          appPath: pageDir.destJSRelative,
        };

        return file;
      },
    })
    .pipe( hb() )
    .pipe( gulp.dest( outputDir ) )
    ;
  }

  if( ! watch ) return execTask();

  gulp.watch([ `${sourceDir}/**/*` ], execTask );
}

function site_scripts_main_all( watch ) {
  const pagesDirs = getPagesDirs();
  return merge(
    pagesDirs.map( pageDir => site_scripts_main( pageDir, watch ) )
  );
}

// eslint-disable-next-line camelcase
function site_scripts_main( pageDir, watch ) {
	let bundler = browserify( pageDir.sourceJS, {
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
			// .pipe( source( 'app.js' ) )
			.pipe( source( pageDir.destJS ) )
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
