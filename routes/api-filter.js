//此代理不对用户进行权限校验，通常用于不登录的服务接口
var httpProxy = require('../routes/http-proxy');
var filter = function(req, res, next) { // 定义了一个过滤函数，在应用程序中当做中间件来使用，中间件就是一个函数。
	//获取完整目录名
	var url = req.originalUrl; //var url = req._parsedUrl.pathname;  截取完整目录名
	//截取请求网关后的目录名
	var serviceUrl = url.substring("/spa/api".length, url.length);
	httpProxy(serviceUrl, req.body, function(data) {
		res.send(data);
		res.end();
	}, function(data){
		res.send(data);
		res.end();
	});
}
module.exports = filter;
