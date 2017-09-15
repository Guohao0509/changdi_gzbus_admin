var httpProxy = require('../routes/http-proxy');
var filter = function(req,res,next){
  //检查用户登录情况
  var urlArr = req.originalUrl.split('/');
  //'queryViewOrderListByKeyword?ticketSource=%E7%BA%BF%E4%B8%8A&viewOrderStatus=0&offset=0&pagesize=5';
  var access = [
    '/api/vieworder/ticketsource',
    '/api/vieworder/product'
  ];
  if(req.session.user==undefined){
    res.send({"code":401,"data":"权限不足，用户未登录"})
    res.end();
  }else if(req.session.user.havePower == 0&&urlArr[2] != 'vieworder'){
    //获取完整目录名
      res.send({"code": 403,"data":"您没有权限访问此模块"});
      res.end();
  }else if(req.session.user.havePower == 0&&urlArr[2] == 'vieworder'&&urlArr[3].indexOf('queryViewOrderListByKeyword')>-1&&req.query.ticketSource!= req.session.user.ticketSource){
      res.send({"code": 403,"data":"您没有权限访问此模块"});
      res.end();
  }else{
    var tmpUrl = urlArr.slice(0,4).join('/');
    var serviceUrl;
    if(tmpUrl == access[0]||tmpUrl == access[1]){
      urlArr.splice(2,1);
      serviceUrl = urlArr.join('/');
      serviceUrl = serviceUrl.substring(4,serviceUrl.length);
    }else{
      var url = req.originalUrl;
      serviceUrl =req.originalUrl.substring(4,url.length);
    }
    httpProxy(serviceUrl,req.body,function(data){
      res.send(data);
      res.end();
    },function(data){
      res.send(data);
      res.end();
    });
  }
}
module.exports = filter;
