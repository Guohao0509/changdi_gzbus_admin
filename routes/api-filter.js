var httpProxy = require('../routes/http-proxy');
var filter = function(req,res,next){
  //检查用户登录情况
  var urlArr = req.originalUrl.split('/');
  //'queryViewOrderListByKeyword?ticketSource=%E7%BA%BF%E4%B8%8A&viewOrderStatus=0&offset=0&pagesize=5';
  var access = [
    '/api/vieworder/ticketsource',
    '/api/vieworder/product',
    '/api/vieworder/ticketorder'
  ];
  
  function checkeAccess(reqUrl, key){
    var accessApi = {
      viewLogin: ['api/ticketorder/queryTicketOrderListByKeyword','api/ticketorder/offlineCheckUserDoorTicket'],
      sourceLogin: [
        'api/vieworder/ticketsource/queryTicketSourceListByKeyword',
        'api/vieworder/queryViewOrderListByKeyword',
        'api/vieworder/updateViewOrderPictureShow',
        'api/vieworder/applyRefund',
        'api/vieworder/offlineTicketsRefund',
        'api/vieworder/product/queryProductBusScheduleDetails',
        'api/vieworder/insertViewOrder',
        'api/vieworder/updateViewOrderPhoto',
        'api/vieworder/queryTicketOrderListByKeyword',
        'api/vieworder/queryViewInfoListByKeyword',
        'api/vieworder/insertTicketOrder',
        'api/vieworder/ticketorder/applyDoorTicketRefund',
        'api/vieworder/ticketorder/offlineDoorTicketsRefund',
        'files/excel',
        'files/image'
      ]
    };
    for(var i = 0; i < accessApi[key].length; i ++){
      if(reqUrl.indexOf(accessApi[key][i]) != -1){
        return true;
      }
    }
  }
  if(req.session.user==undefined){
    res.send({"code":401,"data":"权限不足，用户未登录"});
    res.end();
  }else{
    //判断请求是否在上述的表中
    if((req.session.access == 'viewLogin' || req.session.access == 'sourceLogin')&&checkeAccess(req.originalUrl, req.session.access)){
      var tmpUrl = urlArr.slice(0,4).join('/');
      var serviceUrl;
      if(tmpUrl == access[0]||tmpUrl == access[1]||tmpUrl == access[2]){
        urlArr.splice(2,1);
        serviceUrl = urlArr.join('/');
        serviceUrl = serviceUrl.substring(4,serviceUrl.length);
      }else{
        var url = req.originalUrl;
        serviceUrl =req.originalUrl.substring(4,url.length);
      }
      if(serviceUrl.indexOf('ticketorder/queryTicketOrderListByKeyword') != -1){
        serviceUrl = serviceUrl+'&viewid=' + req.session.user.viewid;
      }
      if(serviceUrl.indexOf('vieworder/queryViewOrderListByKeyword') != -1){
        var myQuery = 'ticketSource='+req.session.user.ticketSourceId;
        // serviceUrl = serviceUrl.replace(/ticketSource=(\d){0,}/,myQuery);
        serviceUrl = serviceUrl + '&' + myQuery;
      }else if(serviceUrl.indexOf('vieworder/queryTicketOrderListByKeyword') != -1){
        var myQuery = 'ticketSourceId='+req.session.user.ticketSourceId;
        // serviceUrl = serviceUrl.replace(/ticketSource=(\d){0,}/,myQuery);
        serviceUrl = serviceUrl + '&' + myQuery;
      }
      if(serviceUrl.indexOf('vieworder/insertViewOrder') != -1){
        req.body.ticketSource = req.session.user.ticketSourceId;
      }
      
      httpProxy(serviceUrl,req.body,function(data){
        res.send(data);
        res.end();
      },function(data){
        res.send(data);
        res.end();
      });
    }else if(req.session.access == 'handletoken'){
      var tmpUrl = urlArr.slice(0,4).join('/');
      var serviceUrl;
      if(tmpUrl == access[0]||tmpUrl == access[1]||tmpUrl == access[2]){
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
    }else{
      res.send({"code":402,"data":"您没有权限访问此模块"})
      res.end();
    }
  }
}
module.exports = filter;
