var xlsx = require('node-xlsx');
var fs = require('fs');
var path = require('path');
var domain = require('../conf.js').domain + '/';
var jsonToExcel = function(options, success, error) {
    /** option {
     *      String name; 生成的excel的名字
     *      Object keyWords; 字段和关键字的映射表 {key: keyWords,...}
     *      Array  data; 数据信息 [{...},{...}]
     *  }
     */
    if( options.name == null ||
        options.keyWords == null ||
        options.data == null) {
        return error('options is undifind');
    }
    var excel = [];
    var excelTitle = [];
    var excelKey = [];
    for(var key in options.keyWords){
        excelTitle.push(options.keyWords[key]);
        excelKey.push(key);
    }
    excel.push(excelTitle);
    excelTitle = null;
    for(var i = 0, dataLen = options.data.length; i < dataLen; i++){
        for(var j = 0, keyLen = excelKey.length, excelBody = []; j < keyLen; j++){
            excelBody.push(typeof options.data[i][excelKey[j]] == 'undefined' ? '' : options.data[i][excelKey[j]].toString());
        }
        excel.push(excelBody);
    }
    var buffer = xlsx.build([{name: options.name, data: excel}]);
    var fileName = 'download' + Date.now() + '_' + Math.floor(Math.random()*1000) + '.xlsx';
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