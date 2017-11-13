'use strict';
const gulp = require('gulp');
const fs = require('fs-extra');
const path = require('path');
const gulpSequence = require('gulp-sequence');
const uglify = require('gulp-uglify');
const co = require('co');
const babel = require('gulp-babel');
const yargs = require('yargs');
const del = require('del');
const sourceMaps = require('gulp-sourcemaps');
const preprocess = require('gulp-preprocess');
const gulpUtil = require('gulp-util');
const less = require('gulp-less');
const rename = require('gulp-rename');
const through = require('through2');
const acorn = require('acorn');
const CWD = process.cwd();
const NODE_MODULE_PATH=path.join(CWD,'node_modules');
const DISTPATH = path.join(CWD, 'dist');
let isDevelopment = process.env.NODE_ENV === 'development',
    isProduction = !isDevelopment;
const configs = {
    js: {
        src: '**/*.js',
        cwd: path.join(CWD, 'src'),
        dist: DISTPATH
    },
    less: {
        src: '**/*.less',
        cwd: path.join(CWD, 'src'),
        dist: DISTPATH
    },
    style:{
        src:path.join(CWD,'src/style'),
        dist:path.join(CWD,'dist/style')
    },
    wxml: {
        src: '**/*.wxml',
        cwd: path.join(CWD, 'src'),
        dist: DISTPATH
    }
};
gulp.task('clean', (done) => {
    try {
        // del.sync(DISTPATH);
    } catch (e) { }
    done();
});
/**
 * @引入npm模块需要写以下特殊注释
 *    //# npm [npm模块js路径] [目标路径，会copy到dist下的这个目录当中] [变量名称]
 */
gulp.task('js', (done) => {
    let packageJson = fs.readJsonSync(path.join(CWD, 'package.json'));
    let src = gulp.src([configs.js.src], {
        cwd: configs.js.cwd
    });
    if (isDevelopment) {
        src = src.pipe(sourceMaps.init());
    }
    src = src.pipe(preprocess({
        context: {
        }
    })); //js内宏定义
    src = src.pipe(babel({
        presets: ['env'],
        plugins: [
            'transform-decorators-legacy',
            'transform-object-rest-spread'
        ]
    })).on('error', (err) => {
        console.log(err);
    });
    src = src.pipe(through.obj(function (file, enc, cb) {
        let content = file.contents.toString();
        let copyList=[];
        acorn.parse(content,{
            onComment:function(block,text,start,end){
                if(/^\#\s+npm/.test(text)){
                    let matched=text.match(/\#\s*npm\s+(.+)\s+(.+)\s+(.+)/);
                    if(matched){
                        let npmPath=path.join(NODE_MODULE_PATH,matched[1]),
                            targetPath=path.join(DISTPATH,matched[2],path.basename(npmPath)),
                            relativePath=path.join(CWD,'src',matched[2],path.basename(npmPath));
                        console.log('will copy file ',npmPath,targetPath);
                        // content.replace(text,);
                        let relative=path.relative(path.dirname(file.path),relativePath);
                        content=content.replace(new RegExp('\\/\\/\s*'+text),`let ${matched[3]}=require('${relative}');`);
                        // console.log(matched[3]);
                        copyList.push({
                            varName:matched[3],
                            npmPath,
                            targetPath,
                            relativePath
                        });
                    }
                }
            }
        });
        copyList.forEach((item)=>{
            fs.copySync(item.npmPath,item.targetPath);
        });
        file.contents=new Buffer(content);
        this.push(file);
        cb();
    }));
    if (isDevelopment) {
        src = src.pipe(sourceMaps.write());
    }
    if (isProduction) {
        src = src.pipe(uglify({
            compress: {
                drop_console: isProduction
            }
        }));
    }
    return src.pipe(gulp.dest(path.join(DISTPATH))).on('end', () => {
    }).on('error', (err) => {
        console.log(err);
    });
});
gulp.task('style', done => {
    let stream = gulp.src(configs.less.src, {
        cwd: configs.less.cwd
    });
    return co(function* () {
        yield new Promise(resolve => {
            stream = stream.pipe(less())
                .pipe(rename(path => {
                    path.extname = '.wxss';
                }))
                .pipe(gulp.dest(configs.less.dist)).on('end',resolve);
        });
        fs.copySync(configs.style.src,configs.style.dist);
    });
});
gulp.task('wxml', done => {
    return gulp.src(configs.wxml.src, {
        cwd: configs.wxml.cwd
    }).pipe(gulp.dest(configs.wxml.dist))
});
gulp.task('app', done => {
    return gulp.src(path.join(CWD, 'src/app.*'))
        .pipe(gulp.dest(DISTPATH));
});
gulp.task('default', done => {
    gulpSequence('clean', 'js', 'style', 'wxml', 'app')(done);
});

