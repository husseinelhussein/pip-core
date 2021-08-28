const {series, parallel, watch, src, dest, lastRun} = require('gulp');
const {config} = require('dotenv');
const {resolve} = require("path");
const ts = require('gulp-typescript');
const nodemon = require('gulp-nodemon');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const cleaner = require('gulp-clean');
const tsProject = ts.createProject('tsconfig.json');
const source = [
  "src/**/*.ts",
  "!src/**/*.gitignore",
  "!src/**/test/",
  "!src/**/test/**/*"
];
const other_files = [
  "src/**/*",
  "!src/**/*.ts",
  "!src/**/*.gitignore",
  "!src/**/test/",
  "!src/**/test/**/*"
];
const dst = "built";
config({ path: resolve(__dirname, "../.env") });
const PORT = process.env.APP_PORT || 5000;
const HOST = process.env.APP_HOST || "http://localhost";

function clean(){
  const files = [
    dst + '/database/migrations/*',
    dst + '/database/seeders/*',
    dst + '/lib/test/assets/database/migrations/*',
    dst + '/lib/test/assets/database/seeders/*',
  ];
  return src(files, {read: false})
      .pipe(cleaner());
}

/**
 * Compile typescript to javascript
 *
 * @return {*}
 */
function compile() {
  return src(source)
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(sourcemaps.write())
    .pipe(dest(dst))
}

/**
 * Copy empty directories
 *
 * @return {*}
 */
function copy() {
  return src(other_files, {dot: true})
      .pipe(dest(dst))
}


/**
 * watch for file typescript files changes
 */
function watchFiles(){
  const additional = ['./*','./.*', '!' + dst];
  const to_watch = additional.concat(source);
  console.log('to watch', to_watch);
  return watch(to_watch, compile);
}

/**
 * Starts the server and restarts on changes
 *
 * @return {*}
 */
function serve(done){
  const stream = nodemon({
    watch: [dst],
    ext: 'js',
    exec: "node --inspect=9229 -r ./node_modules/ts-node/register ./src/main.ts",
    env: {
      "NODE_ENV": "development"
    },
    done: done,
    delay: "100"
  });
  stream
    .on('restart', function () {
      console.log('restarted!')
    })
    .on('crash', function() {
      console.error('Application has crashed!\n');
      // restart the server in 10 seconds
      stream.emit('restart', 1)
    });
}
function browser(){
  browserSync.init(null, {
    proxy: HOST + ":" + PORT,
    files: [dst + "/**/*"],
    browser: "chrome",
    port: 7000,
  });
}

exports.compile = series(clean,compile,copy);
exports.default = series(clean,compile,copy, parallel(watchFiles, serve));
exports.watch = series(clean,compile,copy, parallel(watchFiles, serve));