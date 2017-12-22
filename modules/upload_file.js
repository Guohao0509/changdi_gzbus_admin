var multer = require('multer'); 
var crypto = require('crypto');

var storage = multer.diskStorage({
    //设置上传后文件路径，uploads文件夹会自动创建。
     destination: function (req, file, callback) {
           callback(null, './public/avatar/')
      }, 
    //给上传文件重命名，获取添加后缀名
     filename: function (req, file, callback) {
        var hash = crypto.createHash('md5');
        var fileFormat = (file.originalname).split(".");
        hash.update(file.originalname + Date.now());
        callback(null, hash.digest('hex') + '.'+ fileFormat[fileFormat.length - 1]);
     }
});  
//添加配置文件到muler对象。
var upload = multer({
     storage: storage
}).single('file');

module.exports = upload;