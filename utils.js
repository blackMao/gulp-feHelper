var jfogs = require('jfogs');
var request = require('request');
var JavaScriptObfuscator = require('javascript-obfuscator');
var Q = require('q');

/**
 * jfogs编译
 * @param content 待编译内容
 * @param options 配置
 */
function jfogsCompile(content, options) {
    var defferred = Q.defer();
    var result = jfogs.obfuscate(content, options);

    if(result) {
        defferred.resolve(result);
    }else {
        defferred.reject(result);
    }

    return defferred.promise;
}

/**
 * javascript-obfuscator
 * @param content 文件内容
 * @param option 配置
 */
function jsObCompile(content, option) {
    var defferred = Q.defer();
    var obfuscationResult = JavaScriptObfuscator.obfuscate(content, option);
    var code = obfuscationResult.getObfuscatedCode();

    if(code) {
        defferred.resolve(code);
    }else {
        defferred.reject(code);
    }

    return defferred.promise;
}

/**
 * 发送FE-HELPER请求
 * @param {*} form 
 * https://www.baidufe.com/fehelper
 */
function postFeHelper(form) {
    var defferred = Q.defer();
    var url = "https://www.baidufe.com/fehelper/compress";

    request.post({
        url: url, 
        rejectUnauthorized: false,
        form: form
    }, function(err,httpResponse,body){
    
        if(httpResponse.statusCode == 200) {
            defferred.resolve(body);
        }else {
            defferred.reject(err);
        }
    });

    return defferred.promise;
}

module.exports = {
    jfogsCompile: jfogsCompile,
    jsObCompile: jsObCompile,
    postFeHelper: postFeHelper
};
