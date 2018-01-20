//schedule 定时任务的模块
var schedule = require('node-schedule');
var fse = require('fs-extra');
//在每周日晚上0点清除图片;
var clearFile = function() {
  console.log('func of clearFile is working');
  //在每周的礼拜天的晚上0点0分0秒清除上传的图片文件和生成的excel文件
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