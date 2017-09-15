var express = require('express');
var router = express.Router();
var xlsx = require('node-xlsx');
var path = require('path')
var request = require('superagent');
var fs = require('fs');
var formidable = require('formidable');
var fse = require('fs-extra');
// var domain = 'http://192.168.5.183:4000';
// var host = 'http://192.168.5.223:8080';
var domain = require('../config.json').domain;
var host = require('../config.json').host;

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
//删除已经上传至服务的图片
// router.post('/deleteImage', function(req, res){
// 	var tmpImgsArr = req.body.deleteImages;
// 	console.log(tmpImgsArr)
// 	if(tmpImgsArr[0]){
// 		for(var img of tmpImgsArr){
// 			var tmp  = img.split('/');
// 			img = tmp[tmp.length-1];
// 			console.log(img);
// 			deleteImage(img);
// 		}
// 	}else{
// 		res.send({
// 			"msg": 'image is not exist',
// 			"code": '0'
// 		});
// 	}
// 	function deleteImage(image){
// 		var imgPath = './public/avatar/'+image;
// 		fse.ensureFile(imgPath).then(() => {
// 			fse.remove(imgPath, err => {
// 			  	if (err) {
// 			  		return console.error(err);
// 			  	}
// 			  	console.log('delete'+image+'success!');
// 			})
// 		}).catch(err => {
// 		 	console.error(err)
// 		})
// 	}
// })
//excel导出
router.post('/excel', function(req, res) {
	var api = '/'+ require('../config.json').projectName +'/web/vieworder/queryViewOrderListByKeyword';
	var fileName = 'download' + new Date().getTime() + '_' + Math.floor(Math.random()*1000) + '.xlsx';
	var basePath = './public/excel/' + fileName;
	var excelTitleConfig = {
		viewOrderid: '订单号',
		ticketSource: '来源',
		username: '用户名',
		drivername: '司机名',
		linename: '线路名',
		departDate: '发班日期',
		departTime: '发班时间',
		price: '票价',
		payPrice: '实付',
		viewOrderStatus: '订单状态',
		haveCoupon: '是否使用优惠券',
		bsid: '班次ID',
		barcode: '条形码编号'
	}
	var reqParam = {
		pagesize: req.body.totalnum
	}
	if(req.body.ticketsource){
		reqParam.ticketSource = req.body.ticketsource;
	}else{
		reqParam.ticketSource = '';
	}
	if(req.body.viewOrderStatus){
		 reqParam.viewOrderStatus = req.body.viewOrderStatus;
	}else{
		reqParam.viewOrderStatus = '0';
	}
	var url = host + api + '?ticketSource='+reqParam.ticketSource+'&viewOrderStatus='+reqParam.viewOrderStatus+'&offset=0'+'&pagesize='+reqParam.pagesize;

	request.post(url).send({}).end(function(error,response){
		if(response.body.code !=0){
			res.send({"code":"-1","data":"下载失败"});
			res.end();
			return 
		}
		var excelData = response.body.data.viewOrders;
		var excel = [];
		var excelTitle = [];
		var excelKey = [];
		for(var key in excelTitleConfig){
			excelTitle.push(excelTitleConfig[key]);
			excelKey.push(key);
		}
		excel.push(excelTitle);
		for(var i = 0; i < excelData.length; i++){
			var excelBody = [];
			for(var j = 0; j < excelKey.length; j++){
				var k = excelKey[j];
				if(k == 'departDate' && excelData[i][k]){
					excelData[i][k] = new Date(Number(excelData[i][k])).toLocaleDateString();
				}
				if(k == 'viewOrderStatus'){
					switch (excelData[i][k]) {
						case 1:
							excelData[i][k] = '未付费';
							break;
						case 2:
							excelData[i][k] = '已付费';
							break;
						case 3:
							excelData[i][k] = '已使用';
							break;
						case 4:
							excelData[i][k] = '正在退款';
							break;
						case 5:
							excelData[i][k] = '已退款';
							break;
						default:
							break;
					}
				}
				if(excelData[i][k] && excelData[i][k] == 'true'){
					excelData[i][k] = '是';
				}else if(excelData[i][k] && excelData[i][k] == 'false'){
					excelData[i][k] = '否';
				}
				//这里写的不好
				if(excelData[i][k]){
					excelBody.push(excelData[i][k].toString());
				}else{
					excelBody.push('');
				}
			}
			excel.push(excelBody);
		}
		var buffer = xlsx.build([{name: "直通车订单表", data: excel}]);
		fs.writeFile(basePath, buffer,'binary',function(){
			res.send({
				"path": domain+'/excel/'+ fileName,
				"code": '0'
			})
			res.end();
		});
	});
});
module.exports = router;
