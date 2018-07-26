var gulp = require('gulp');
var jade = require('gulp-jade'); //jade 為 jade編譯成 html 工具
var sass = require('gulp-sass'); //sass 為 scss編譯成 css 工具
var plumber = require('gulp-plumber'); //plumber 為 出錯不停止編譯 的工具
var postcss = require('gulp-postcss'); //讓 css 依據標準添加 前贅字
var autoprefixer = require('autoprefixer'); //協助 postcss 定位版本
// https://github.com/browserslist/browserslist 版為配置選項和說明
var cleanCSS = require('gulp-clean-css'); // css壓縮工具
var uglify = require('gulp-uglify'); // js壓縮工具
// https://github.com/mishoo/UglifyJS2#compress-options js壓縮對照刪除物件
var mainBowerFiles = require('main-bower-files'); // 抓取套件需匯入的css js
var sourcemaps = require('gulp-sourcemaps'); // 壓縮後可找到原檔案的內容位置 工具
var babel = require('gulp-babel'); // 高階js 編譯成 js 工具
var concat = require('gulp-concat'); // 多檔案合併成單檔工具
var order = require('gulp-order'); // 讓合併檔案先排序 ，配合 gulp-concat

gulp.task('default', ['jade', 'sass', 'bower', 'vendorsJs', 'vendorsCss']); //合併工具流程

// 1.jade 轉成 html
gulp.task('jade', function () {
gulp.src('./*.jade')
.pipe(plumber())
.pipe(jade({}))
.pipe(gulp.dest('./dist/')) //dest()輸出位置
});

// 2.sass 轉成 css
gulp.task('sass', function () {
//先加入延伸套件，css瀏覽器版本選擇
var plugins = [
autoprefixer({
browsers: ['last 1 version']
}),
];

return gulp.src('./style.scss')
.pipe(plumber())
.pipe(sass().on('error', sass.logError)) //以編譯完成 .sync()
.pipe(postcss(plugins)) //添加 前贅字
.pipe(gulp.dest('./'));
});

// 3.監看 scss 編譯 css
// 要監聽會異動的檔案(含原封裝檔案)，有更動就去執行 gulp sass 
gulp.task('watch', function () { 
gulp.watch(['./scss/*.scss','./style.scss'], ['sass']);
});

// 4.壓縮 css (上架版本)
gulp.task('minify-css', () => {
return gulp.src('./*.css')
.pipe(cleanCSS({
compatibility: 'ie8'
}))
.pipe(gulp.dest('./dist/'));
});

// 5.壓縮 js (上架版本)
gulp.task('minify-js', function () {
gulp.src('./*.js')
.pipe(plumber())
.pipe(uglify({
compress: {
drop_console: true //移除 console
}
}))
.pipe(gulp.dest('./dist/'))
});

// 5.將使用套件 js css 取出
gulp.task('bower', function () {
return gulp.src(mainBowerFiles({
"overrides": {
"bootstrap": { // 套件名稱
"main": ["dist/css/bootstrap.min.css",
"dist/js/bootstrap.min.js"
] // 取用的資料夾路徑
},
"Font-Awesome": { // 套件名稱
"main": ["web-fonts-with-css/css/fontawesome-all.min.css",
"svg-with-js/js/fontawesome-all.min.js"
] // 取用的資料夾路徑
}
}
}))
.pipe(gulp.dest('./.temp/vendors'))
});

//將.temp套件需要的js 複製到 使用的資料夾
gulp.task('vendorsJs', ['bower'], function () { //表示需先執行 bower 再執行此工作
return gulp.src('./.temp/vendors/*.js')
.pipe(order([
'jquery.js',
'bootstrap.min.js',
'bootstrap-datepicker.js',
'd3.js'
]))
.pipe(concat("all.js"))
.pipe(gulp.dest('./'))
})

//將.temp套件需要的css 複製到 使用的資料夾
gulp.task('vendorsCss', ['bower'], function () {
return gulp.src('./.temp/vendors/*.css')
.pipe(cleanCSS({
compatibility: 'ie8'
}))
.pipe(concat("all.css"))
.pipe(gulp.dest('./'))
})

//將 js 版本 降版
gulp.task('babel', () =>
gulp.src('.temp/vendors/**/*.js')
.pipe(sourcemaps.init()) // 初始化sourcemaps
.pipe(babel({
presets: ['env']
}))
.pipe(concat('all.js')) //壓縮後檔名
.pipe(sourcemaps.write('.')) //sourcemaps 利用. 切割
.pipe(gulp.dest('./public/js'))
);