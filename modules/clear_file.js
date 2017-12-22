//schedule
var schedule = require('node-schedule');
var fse = require('fs-extra');
//在每周日晚上0点清除图片;
var clearFile = function() {
    console.log('func of clearFile is working');
    schedule.scheduleJob({hour: 0, minute: 0, dayOfWeek: 0}, function(){
        fse.emptyDir('./public/avatar', function(err){
          if(err){
            console.log(err);
          }else{
            console.log('avatar is empty');
          }
        })
        fse.emptyDir('./public/excel', function(err){
          if(err){
            console.log(err)
          }else {
            console.log('excel is empty');
          }
        })
    });
}

module.exports = clearFile;