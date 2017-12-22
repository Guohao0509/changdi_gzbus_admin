var express = require('express');
var router = express.Router();
var domain = require('../conf.js').domain; // http://111.230.129.41:5050
var staticPath = '/public/';

//请求代理模块
var httpProxy = require('./http-proxy.js');

//json 转 excel 的模块
var jsonToExcel = require('../modules/json_to_excel.js');
//上传文件的模块
var upload = require('../modules/upload_file.js');

//门店获取车票订单的Excel;
router.post('/vieworder/getCarOrderExcel', function(req, res) {
    var url = '/vieworder/queryViewOrderListByKeyword?';
    //格式化请求参数
    var reqParam = {
        pagesize: req.body.totalnum,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        keyWords: req.body.keyWords
    }
    //构造新的url
    url += 'offset=0&pagesize=' + reqParam.pagesize + '&startTime=' + reqParam.startTime + '&endTime=' + reqParam.endTime;
	if(req.session.access == 'sourceLogin'){
        url += '&ticketSource=' + req.session.user.ticketSourceId;
    }
    httpProxy(url, {},function(data){
        data = JSON.parse(data);
        var viewOrders = data.data.viewOrders, len = data.data.viewOrders.length;
        for(var i = 0; i < len; i++) {
            //格式化订单创建时间
            if(typeof viewOrders[i].createTime != 'undefined') {
                viewOrders[i].createTime = new Date(Number(viewOrders[i].createTime)).toLocaleString();
            }
            //格式化是否使用优惠券
            if(typeof viewOrders[i].haveCoupon != 'undefined') {
                viewOrders[i].haveCoupon = viewOrders[i].haveCoupon == 'true' ? '使用' : '未使用';
            }
            //格式化出发日期
            if(typeof viewOrders[i].departDate != 'undefined') {
                viewOrders[i].departDate = new Date(Number(viewOrders[i].departDate)).toLocaleDateString();
            }
            //格式化门票状态
            if(typeof viewOrders[i].viewOrderStatus != 'undefined') {
                if (viewOrders[i].viewOrderStatus == 1) {
                    viewOrders[i].viewOrderStatus = '未付费';
                }else if(viewOrders[i].viewOrderStatus == 2) {
                    viewOrders[i].viewOrderStatus = '已付费未使用';
                }else if(viewOrders[i].viewOrderStatus == 3) {
                    viewOrders[i].viewOrderStatus = '已使用';
                }else if(viewOrders[i].viewOrderStatus == 4) {
                    viewOrders[i].viewOrderStatus = '正在退款';
                }else if(viewOrders[i].viewOrderStatus == 5) {
                    viewOrders[i].viewOrderStatus = '已退款';
                }
            }
        }
        if(data.code == 0){
			jsonToExcel({
                name: '直通车订单列表',
                data: viewOrders,
                keyWords: {
                    "viewOrderid": "直通车订单ID",
                    "createTime": "订单创建时间",
                    "viewOrderStatus": "订单状态",
                    "userid": "用户ID",
                    "username": "用户名",
                    "price": "车票价格",
                    "payPrice": "实付价格",
                    "haveCoupon": "是否使用优惠券",
                    "barcode": "票据校验码",
                    "lineid": "线路ID",
                    "linename": "线路名称",
                    "bsid": "班次ID",
                    "drivername": "司机名",
                    "platenum": "车牌号",
                    "departDate": "出发日期",
                    "departTime": "出发时间",
                    "departaddr": "出发地点",
                    "arriveaddr": "到达地点",
                    "drivetime": "行驶时间",
                    "departName": "出发地",
                    "arriveName": "目的地",
                    "ticketSourceId": "票来源ID",
                    "ticketSource": "票来源",
                    "sourcePhone": "票来源客服电话"
                }
            },function(path) {
                res.send({"code": "0","data": {path: path}});
                res.end();
            },function(err) {
                res.send({"code":"-1", "data": "下载失败2"});
                res.end();
            })
		}else {
            res.send({"code":"-1","data":"下载失败1"});
			res.end();
        }
      },function(data){
        res.send(data);
        res.end();
      });
});

//门店获取门票订单列表excel
router.post('/vieworder/getTicketSourceViewOrderExcel', function(req, res) {
    var url = '/ticketorder/queryTicketOrderListByKeyword?';
    var reqParam = {
        pagesize: req.body.totalnum,
        startTime: req.body.startTime,
        endTime: req.body.endTime
	}
    //构造新的url
    url += 'offset=0&pagesize=' + reqParam.pagesize + '&startTime='+ reqParam.startTime + '&endTime=' + reqParam.endTime;
    if(req.session.access == 'sourceLogin'){
		url += '&ticketSourceId=' + req.session.user.ticketSourceId;
    }
    httpProxy(url, {} ,function(data){
        data = JSON.parse(data);
        var ticketOrders = data.data.ticketOrders, len = data.data.ticketOrders.length;
        for(var i = 0; i < len; i++) {
            //格式化订单创建时间
            if(typeof ticketOrders[i].createTime != 'undefined') {
                ticketOrders[i].createTime = new Date(Number(ticketOrders[i].createTime)).toLocaleString();
            }
            //格式化是否使用优惠券
            if(typeof ticketOrders[i].haveCoupon != 'undefined') {
                ticketOrders[i].haveCoupon = ticketOrders[i].haveCoupon == 'true' ? '使用' : '未使用';
            }
            //格式化出发日期
            if(typeof ticketOrders[i].useDate != 'undefined') {
                ticketOrders[i].useDate = new Date(Number(ticketOrders[i].useDate)).toLocaleDateString();
            }
            //格式化门票状态
            if(typeof ticketOrders[i].ticketStatus != 'undefined') {
                if (ticketOrders[i].ticketStatus == 1) {
                    ticketOrders[i].ticketStatus = '未付费';
                }else if(ticketOrders[i].ticketStatus == 2) {
                    ticketOrders[i].ticketStatus = '已付费未使用';
                }else if(ticketOrders[i].ticketStatus == 3) {
                    ticketOrders[i].ticketStatus = '已使用';
                }else if(ticketOrders[i].ticketStatus == 4) {
                    ticketOrders[i].ticketStatus = '正在退款';
                }else if(ticketOrders[i].ticketStatus == 5) {
                    ticketOrders[i].ticketStatus = '已退款';
                }
            }
        }
        if(data.code == 0) {
			jsonToExcel({
                name: '景区门票订单列表',
                data: ticketOrders,
                keyWords: {
                    "orderid": "订单ID",
                    "createTime": "订单创建时间",
                    "viewid": "景区ID",
                    "viewName": "景区名称",
                    "viewaddr": "景区地址",
                    "userid": "用户ID",
                    "username": "用户姓名",
                    "phone": "用户手机号",
                    "viewPriceType": "门票类型",
                    "ticketPrice": "票价",
                    "viewCoupon": "门票折扣",
                    "haveCoupon": "是否使用优惠券",
                    "couponPrice": "实付价格",
                    "ticketStatus": "门票状态",
                    "vrelecode": "票据校验码",
                    "useDate": "门票使用时间",
                    "ticketSourceId": "票来源ID",
                    "ticketSource": "票来源",
                    "sourcePhone": "票来源客服电话"
                }
            },function(path) {
                console.log(path)
                res.send({"code": "0","data": {path: path}});
                res.end();
            },function(err) {
                console.log(err);
                res.send({"code":"-1", "data": "下载失败2"});
                res.end();
            })
		}else {
            res.send({"code":"-1","data":"下载失败1"});
			res.end();
        }
    },function(data){
        res.send(data);
        res.end();
    });
});

// 景区端获取门票订单的Excel;
router.post('/ticketorder/getViewOrderExcel', function(req, res) {
    var url = '/ticketorder/queryTicketOrderListByKeyword?';
    var keyWords = {
        "orderid": "订单ID",
        "createTime": "订单创建时间",
        "viewid": "景区ID",
        "viewName": "景区名称",
        "viewaddr": "景区地址",
        "userid": "用户ID",
        "username": "用户姓名",
        "phone": "用户手机号",
        "name":"游客姓名",
        "userPhone":"游客手机号",
        "viewPriceType": "门票类型",
        "ticketPrice": "票价",
        "viewCoupon": "门票折扣",
        "haveCoupon": "是否使用优惠券",
        "couponPrice": "实付价格",
        "ticketStatus": "门票状态",
        "vrelecode": "票据校验码",
        "useDate": "门票使用时间",
        "ticketSourceId": "票来源ID",
        "ticketSource": "票来源",
        "sourcePhone": "票来源客服电话"
    }
    var reqParam = {
        pagesize: req.body.totalnum,
        startTime: req.body.startTime,
        endTime: req.body.endTime
	}
    //构造新的url
    url += 'offset=0&pagesize=' + reqParam.pagesize + '&startTime='+ reqParam.startTime + '&endTime=' + reqParam.endTime;
    if(req.session.access == 'viewLogin'){
        url += '&viewid=' + req.session.user.viewid;
        delete keyWords.viewCoupon;
        delete keyWords.haveCoupon;
        delete keyWords.couponPrice;
        delete keyWords.viewCoupon;
        delete keyWords.ticketPrice;
        delete keyWords.viewPriceType;
    }
    httpProxy(url, {} ,function(data){
        data = JSON.parse(data);
        var ticketOrders = data.data.ticketOrders, len = data.data.ticketOrders.length;
        for(var i = 0; i < len; i++) {
            //格式化订单创建时间
            if(typeof ticketOrders[i].createTime != 'undefined') {
                ticketOrders[i].createTime = new Date(Number(ticketOrders[i].createTime)).toLocaleString();
            }
            //格式化是否使用优惠券
            if(typeof ticketOrders[i].haveCoupon != 'undefined') {
                ticketOrders[i].haveCoupon = ticketOrders[i].haveCoupon == "true" ? '使用' : '未使用';
            }
            //格式化出发日期
            if(typeof ticketOrders[i].useDate != 'undefined') {
                ticketOrders[i].useDate = new Date(Number(ticketOrders[i].useDate)).toLocaleDateString();
            }
            //格式化门票状态
            if(typeof ticketOrders[i].ticketStatus != 'undefined') {
                if (ticketOrders[i].ticketStatus == 1) {
                    ticketOrders[i].ticketStatus = '未付费';
                }else if(ticketOrders[i].ticketStatus == 2) {
                    ticketOrders[i].ticketStatus = '已付费未使用';
                }else if(ticketOrders[i].ticketStatus == 3) {
                    ticketOrders[i].ticketStatus = '已使用';
                }else if(ticketOrders[i].ticketStatus == 4) {
                    ticketOrders[i].ticketStatus = '正在退款';
                }else if(ticketOrders[i].ticketStatus == 5) {
                    ticketOrders[i].ticketStatus = '已退款';
                }
            }
        }
        if(data.code == 0) {
			jsonToExcel({
                name: '景区门票订单列表',
                data: data.data.ticketOrders,
                keyWords: keyWords
            },function(path) {
                console.log(path)
                res.send({"code": "0","data": {path: path}});
                res.end();
            },function(err) {
                console.log(err);
                res.send({"code":"-1", "data": "下载失败2"});
                res.end();
            })
		}else {
            res.send({"code":"-1","data":"下载失败1"});
			res.end();
        }
      },function(data){
        res.send(data);
        res.end();
      });
});

//获取收益excel
router.post('/profit/getProfitExcel', function(req, res) {
    var url = '/trade/queryDayStatistics?';
    var reqParam = {
        pagesize: req.body.totalnum,
        startTime: req.body.startTime,
        endTime: req.body.endTime
	}
    //构造新的url
    url += 'offset=0&pagesize=' + reqParam.pagesize + '&startDate='+ reqParam.startTime + '&endDate=' + reqParam.endTime;
    httpProxy(url, {} ,function(data){
        data = JSON.parse(data);
        var rows = data.data.rows, len = data.data.rows.length;
        for(var i = 0; i < len; i++) {
            //格式化日期
            if(typeof rows[i].countTime != 'undefined') {
                rows[i].countTime = new Date(Number(rows[i].countTime)).toLocaleDateString();
            }
           
        }
        if(data.code == 0) {
			jsonToExcel({
                name: '收益列表',
                data: rows,
                keyWords: {
                    countTime: '时间',
                    monthTicketMon: '包车收益',
                    rechargeOrderMon: '直通车收益',
                    doorOrderMon: '门票收益',
                    dayTotalMon: '日总收益',
                    sumlimit: '时间段总收益',
                    hisTotalMon: '历史总收益'
                }
            },function(path) {
                console.log(path)
                res.send({"code": "0","data": {path: path}});
                res.end();
            },function(err) {
                console.log(err);
                res.send({"code":"-1", "data": "下载失败2"});
                res.end();
            })
		}else {
            res.send({"code":"-1","data":"下载失败1"});
			res.end();
        }
      },function(data){
        res.send(data);
        res.end();
      });
});

// 景区端登录 过滤数据;
router.post('/ticketorder/queryTicketOrderListByKeyword', function(req, res) {
    var url = req.originalUrl.substring(4,req.originalUrl.length);
	if(req.session.access == 'viewLogin'){
        //构造新的url
        url += '&viewid=' + req.session.user.viewid;
    }
    httpProxy(url,req.body,function(data){
        res.send(data);
        res.end();
    },function(data){
        res.send(data);
        res.end();
    });
});

//上传图片
router.post('/file/uploadFile', function(req, res) {
    upload(req, res, function (err) {
        if(err) {
            res.send({"code":"-1","data":"上传失败"});
			res.end();
        }else {
            res.send(domain + '/' + req.file.filename);
            res.end();
        }
    })
});

//门店登录，获取票据来源
router.post('/vieworder/ticketsource/queryTicketSourceListByKeyword', function(req, res) {
    var url = req.originalUrl.substring(14,req.originalUrl.length);
    httpProxy(url,req.body,function(data){
        res.send(data);
        res.end();
    },function(data){
        res.send(data);
        res.end();
    });
});

//门店登录，对门票进行退票 线上
router.post('/vieworder/ticketorder/applyDoorTicketRefund', function(req, res) {
    var url = req.originalUrl.substring(14,req.originalUrl.length);
    httpProxy(url,req.body,function(data){
        res.send(data);
        res.end();
    },function(data){
        res.send(data);
        res.end();
    });
});

//门店登录，对门票进行退票 线下
router.post('/vieworder/ticketorder/offlineDoorTicketsRefund', function(req, res) {
    var url = req.originalUrl.substring(14,req.originalUrl.length);
    httpProxy(url,req.body,function(data){
        res.send(data);
        res.end();
    },function(data){
        res.send(data);
        res.end();
    });
});

//门店登录， 对线下添加票据请求进行转发
router.post('/vieworder/product/queryProductBusScheduleDetails', function(req, res) {
    var url = req.originalUrl.substring(14,req.originalUrl.length);
    httpProxy(url,req.body,function(data){
        res.send(data);
        res.end();
    },function(data){
        res.send(data);
        res.end();
    });
});

//门店登录，对车票订单订单列表数据进行过滤
router.post('/vieworder/queryViewOrderListByKeyword', function(req, res) {
    var url = req.originalUrl.substring(4,req.originalUrl.length);
    if(req.session.access == 'sourceLogin'){
		url += '&ticketSource=' + req.session.user.ticketSourceId;
    }
    //构造新的url
    httpProxy(url,req.body,function(data){
        res.send(data);
        res.end();
    },function(data){
        res.send(data);
        res.end();
    });
});

//门店登录，对门票订单列表数据进行过滤
router.post('/vieworder/queryTicketOrderListByKeyword', function(req, res) {
    var url = req.originalUrl.substring(4,req.originalUrl.length);
    if(req.session.access == 'sourceLogin'){
        url += '&ticketSourceId=' + req.session.user.ticketSourceId;
    }
    //构造新的url
    httpProxy(url,req.body,function(data){
        res.send(data);
        res.end();
    },function(data){
        res.send(data);
        res.end();
    });
});

//api接口的访问过滤
router.post('/*', function(req, res) {
    var url = req.originalUrl;
    if(req.session.access == 'handletoken'){//如果是系统用户，则可以访问所有接口
        url = url.substring(4,url.length);
		httpProxy(url,req.body,function(data){
            res.send(data);
            res.end();
        },function(data){
            res.send(data);
            res.end();
        });
    }else if(req.session.access == 'viewLogin'){ //如果是景区用户，则可以访问门店相关接口
        if(url.indexOf('api/ticketorder') != -1) {
            url = url.substring(4,url.length);
            httpProxy(url,req.body,function(data){
                res.send(data);
                res.end();
            },function(data){
                res.send(data);
                res.end();
            });
        }else {
            res.send({"code":402,"data":"您没有权限访问此模块"})
            res.end();
        }
    }else if(req.session.access == 'sourceLogin'){ //如果是门店用户，则可以访问门店相关接口
        if(url.indexOf('api/vieworder') != -1) {
            url = url.substring(4,url.length);
            httpProxy(url,req.body,function(data){
                res.send(data);
                res.end();
            },function(data){
                res.send(data);
                res.end();
            });
        }else {
            res.send({"code":402,"data":"您没有权限访问此模块"})
            res.end();
        }
    }
});

module.exports = router;