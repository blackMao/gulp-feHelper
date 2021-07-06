var through = require('through2');
var utils = require('./utils.js');

var jfogsOpt = {
    prefix:'sm',
    type: 'reverse',
    breakout: true
};

var jsObOpt = {
    compact: true,
    debugProtection: false,
    debugProtectionInterval: false,
    disableConsoleOutput: false,
    rotateStringArray: true,
    selfDefending: true,
    stringArray: true,
    stringArrayEncoding: 'base64',
    stringArrayThreshold: 0.75,
    unicodeEscapeSequence: false,

    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: false,
    deadCodeInjectionThreshold: 0.4,
    renameGlobals: false,
    transformObjectKeys: true
};

/**
 * 压缩HTML
 */
function compressHtml(file, encode, cb) {
	var contents = file.contents.toString(encode);

	utils.postFeHelper({
        language: 'html',
        content: contents
    }).then(function(content){
        file.contents = new Buffer(content, encode);
        cb(null, file, encode);
    }, function(err){
        console.log(err);
    });
}

/**
 * 压缩CSS
 */
function compressCss(file, encode, cb) {
	var contents = file.contents.toString(encode);

	utils.postFeHelper({
        language: 'css',
        content: contents
    }).then(function(content){
        file.contents = new Buffer(content, encode);
        cb(null, file, encode);
    }, function(err){
        console.log(err);
    });
}

/**
 * 压缩JS
 */
function compressJs(file, encode, cb, options) {
	var contents = file.contents.toString(encode);

	if(options.mix) {
	    utils.jfogsCompile(contents, options.jfogs).then(function(content){
	        return utils.jsObCompile(content, options.jObfuscator);
	    }).then(function(content){
	        file.contents = new Buffer(content, encode);
	        cb(null, file, encode);
	    }, function(err){
	        console.log(err);
	    });
	}else {
		cb(null, file, encode);
	}
}

module.exports = function uglifyJs(options){
    var newOptions = {
		language: options.language ? options.language : 'js',
		mix: options.mix == true ? true : false,
		jfogs: options.obfuscator ? (options.jfogs ? options.jfogs : jfogsOpt) : jfogsOpt,
		jObfuscator: options.obfuscator ? (options.jObfuscator ? options.jObfuscator : jsObOpt) : jsObOpt,
	};

    // 创建stream对象，每个文件都会经过这个stream对象
    var stream = through.obj(function(file, encode, cb){
        switch(newOptions.language) {
        	case "html":
        		compressHtml(file, encode, cb);
        		break;
        	case "css":
        		compressCss(file, encode, cb);
        		break;
        	case "js":
        		compressJs(file, encode, cb, newOptions);
        		break;
        }
    });

    // 返回stream对象
    return stream;
};
