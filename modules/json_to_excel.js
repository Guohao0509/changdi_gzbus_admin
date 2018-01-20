var xlsx = require('node-xlsx');
var fs = require('fs');
var path = require('path');
var domain = require('../conf.js').domain + '/';
var jsonToExcel = function(options, success, error) {
    /** option {
     *      name; 生成的excel的名字
     *      keyWords; 字段和关键字的映射表 {key: keyWords,...}
     *      data; 数据信息 [{...},{...}]
     *  }
     */
    //如果option 缺少参数，return err
    if( options.name == null ||
        options.keyWords == null ||
        options.data == null) {
        return error('options is undifind');
    }
    var excel = [];
    var excelTitle = [];
    var excelKey = [];
    //构造标题行
    for(var key in options.keyWords){
        excelTitle.push(options.keyWords[key]);
        excelKey.push(key);
    }
    excel.push(excelTitle);
    excelTitle = null;
    //构造数据行
    for(var i = 0, dataLen = options.data.length; i < dataLen; i++){
        for(var j = 0, keyLen = excelKey.length, excelBody = []; j < keyLen; j++){
            excelBody.push(typeof options.data[i][excelKey[j]] == 'undefined' ? '' : options.data[i][excelKey[j]].toString());
        }
        excel.push(excelBody);
    }
    //生成一个buffer
    var buffer = xlsx.build([{name: options.name, data: excel}]);
    //生成一个随机的文件名 目前是时间戳加随机数
    //可用nodejs  crypto模块来成MD5戳
    var fileName = 'download' + Date.now() + '_' + Math.floor(Math.random()*1000) + '.xlsx';
    //这里的路径有点问题，应该找到全局的静态资源路径，否则不方便拓展
    fs.writeFile('./public/excel/' + fileName, buffer,'binary',function(err){
        if(err) {
            error(err);
        }else {
            console.log(domain + 'excel/' + fileName);
            success(domain + 'excel/' + fileName);
        }
    });
}

module.exports = jsonToExcel;