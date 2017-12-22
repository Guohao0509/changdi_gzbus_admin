var express = require('express');
var router = express.Router();
var xlsx = require('node-xlsx');
var path = require('path')
var request = require('superagent');
var fs = require('fs');
var formidable = require('formidable');
var fse = require('fs-extra');
var domain = require('../conf.js').domain;
var host = require('../conf.js').host;

//上传图片

router.post('/image', function(req, res) {
	var TITLE = 'upload';
	var AVATAR_UPLOAD_FOLDER = '/avatar/';
  	var form = new formidable.IncomingForm();   //创建上传表单
  	form.encoding = 'utf-8';        //设置编辑
  	form.uploadDir = 'public' + AVATAR_UPLOAD_FOLDER;     //设置上传目录
 	form.keepExtensions = true;     //保留后缀
  	form.maxFieldsSize = 2 * 1024 * 1024;   //文件大小

  	form.parse(req, function(err, fields, files) {
		if (err) {
	  		res.send({"code":-1,"data":"上传失败，请重新上传"});
		 	return;
		}

		var extName = '';  //后缀名
		switch (files.fulAvatar.type) {
	  		case 'image/pjpeg':
				extName = 'jpg';
				break;
	  		case 'image/jpeg':
				extName = 'jpg';
				break;
	  		case 'image/png':
				extName = 'png';
				break;
	  		case 'image/x-png':
				extName = 'png';
				break;
		}

		if(extName.length == 0){
	  		res.send({"code":-1,"data":"上传失败，请重新上传"})
	  		return;
		}

		var avatarName = TITLE + '_' + new Date().getTime() + '_' + Math.floor(Math.random()*1000) + '.' + extName;
		//图片写入地址；
		var newPath = form.uploadDir + avatarName;
		//显示地址；
		var showUrl = domain + AVATAR_UPLOAD_FOLDER + avatarName;
		try{
		    fs.renameSync(files.fulAvatar.path, newPath);
		}catch(e){
			console.log(e);
		}
		  //重命名
		res.json({
		  	"newPath":showUrl
		});
		res.end();
  	});
});

module.exports = router;
