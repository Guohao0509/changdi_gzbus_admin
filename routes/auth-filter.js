var httpProxy = require('../routes/http-proxy');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/login', function(req, res, next) {
  //设置权限检查禁止浏览器缓存数据
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", 0);
  //完成用户的登陆
  var user = {};
  var serviceUrl ='/system/login.htm';
  var option = {
    username:req.query.username,
    password:req.query.password
  }
  httpProxy(serviceUrl,option,function(data){
    console.log(data);
    user = JSON.parse(data).data.systemUser;
    req.session.user = user;
    res.send({
      "code":0,
      "data":user
    });
  },function(data){
    res.send(data);
    res.end();
  });

});
router.get('/check', function(req, res, next) {
  //设置权限检查禁止浏览器缓存数据
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", 0);
  if(req.session.user==undefined){
    res.send({
      "code":0,
      "data":null
    });
  }else{
    res.send({
      "code":0,
      "data":req.session.user
    });
  }
});
router.get('/logout', function(req, res, next) {
  //设置权限检查禁止浏览器缓存数据
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", 0);
  req.session.user = undefined;
  res.send({
    "code":0,
    "data":null
  });
});
module.exports = router;
