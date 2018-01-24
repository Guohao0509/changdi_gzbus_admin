angular.module('app.directives').directive('ticket', function($document) {
    return {
        restrict: 'A',
        replace: true,
        templateUrl: '../../tpl/blocks/ticket.html',
        scope: {
            // = 双向数据绑定
            // & 绑定一个方法
            ticketInformation: '=',//接收一个票据对象
        },
        link: function(scope, element, attrs) {
            var ticket = {}, viewTicket = {};
            console.log('ticketInformation')
            console.log(scope.ticketInformation)
            if(scope.ticketInformation.viewOrderid){//车票
                ticket = {
                    viewOrderid: scope.ticketInformation.viewOrderid,//订单ID
                    start: scope.ticketInformation.departName,//出发地
                    startAddr: scope.ticketInformation.departaddr,//出发得详细地址
                    end: scope.ticketInformation.arriveName,//到达地
                    date: scope.ticketInformation.departDate,//出发日期
                    time: scope.ticketInformation.departTime,//出发时间
                    barcode: scope.ticketInformation.ticketCode,//票据校验码
                    car: scope.ticketInformation.platenum,//车牌号
                    phone: scope.ticketInformation.sourcePhone//客服电话
                }
                //格式化一个日期时间
                var date = new Date(Number(ticket.date));
                var year = date.getFullYear();
                var month = date.getMonth() + 1;
                var day = date.getDate();
                var departDate = year + ' 年 ' + month + ' 月 ' + day + ' 日 ';

                //画条形码
                var barcode = element.children('.barcodeCanvas')[0];
                JsBarcode(barcode, ticket.barcode);
                //将画好得canvas转为base64格式
                var imgSrc = barcode.toDataURL();
                var img = new Image();
                //来解决跨域问题
                img.crossOrigin="anonymous";
                //车票得背景图
                img.src = '../../img/ticket.png';
                var barcodeImg = new Image();//创建一个图片，src为base64个格式的条形码
                barcodeImg.src = imgSrc;
                var canvas = element.children('.canvas')[0];
                //将这个canvas转成base64格式，画在另一个canvas上
                var ctx = canvas.getContext('2d');
                //在图片加载完成的时候执行绘制票的回调函数
                img.onload = function() {  
                    ctx.drawImage(img, 0, 0,700,1100);
                    ctx.fillStyle = '#0068B7';
                    ctx.font="bold 40px Arial";
                    ctx.fillText(ticket.start,140,156);
                    ctx.fillText(ticket.end,140,256);
                    ctx.font="26px Arial";
                    ctx.fillText('车牌号：',70, 360);
                    ctx.fillText('出发时间：',70, 410);
                    ctx.fillText('发车地点：',70, 460);
                    ctx.fillText(ticket.car,230, 360);
                    ctx.fillText(departDate,230, 410);
                    ctx.fillText(ticket.time,500,410);
                    ctx.fillText(ticket.startAddr,230,460);
                    ctx.font="20px Arial";
                    ctx.fillStyle = '#757575';
                    ctx.fillText(ticket.phone,200,1032);
                    ctx.drawImage(barcodeImg, 100, 600, 500, 200);
                }
            }else if(scope.ticketInformation.orderid) {//门票
                viewTicket = {
                    orderid: scope.ticketInformation.orderid,//门票的订单
                    couponPrice: scope.ticketInformation.couponPrice,//实付的价格
                    sourcePhone: scope.ticketInformation.sourcePhone,//客服电话
                    ticketCode: scope.ticketInformation.ticketCode,//票据校验码
                    useDate: scope.ticketInformation.useDate,//使用时间
                    viewName: scope.ticketInformation.viewName,//景区的名称
                    viewPriceType: scope.ticketInformation.viewPriceType,//门票的类型
                    ticketPrice: scope.ticketInformation.ticketPrice,//门票的价格
                    viewaddr: scope.ticketInformation.viewaddr//景区的地址
                }
                if(scope.ticketInformation.qrcodeid) {
                    viewTicket.qrcodeid = scope.ticketInformation.qrcodeid;
                }
                //格式化时间
                var date = new Date(Number(viewTicket.useDate));
                var year = date.getFullYear();
                var month = date.getMonth() + 1;
                var day = date.getDate();
                var departDate = year + ' 年 ' + month + ' 月 ' + day + ' 日 ';
                
                //创建条形码
                var barcode = element.children('.barcodeCanvas')[0];
                if(scope.ticketInformation.qrcodeid) {
                    var qrcode = new QRCode(barcode, {
                        text: viewTicket.qrcodeid,
                        width: 128,
                        height: 128,
                        colorDark : "#000000",
                        colorLight : "#ffffff",
                        correctLevel : QRCode.CorrectLevel.H
                    });
                    var barcodeImg = $(barcode).children('img')[0];
                    var img = new Image();
                    img.crossOrigin="anonymous";
                    img.src = '../../img/view_ticket.png';
                    console.log(barcodeImg);
                }else {
                    JsBarcode(barcode, viewTicket.ticketCode);
                    var imgSrc = barcode.toDataURL();
                    var barcodeImg = new Image();
                    barcodeImg.src = imgSrc;
                    var img = new Image();
                    img.crossOrigin="anonymous";
                    img.src = '../../img/view_ticket.png';
                }
                //将条形码转为base64格式然后绘制到底图上
                
                var canvas = element.children('.canvas')[0];
                var ctx = canvas.getContext('2d');
                img.onload = function() {
                    ctx.drawImage(img, 0, 0,700,1100);
                    ctx.fillStyle = '#0068B7';
                    ctx.font="bold 40px Arial";
                    ctx.fillText('景区：',100, 130);
                    ctx.fillText(viewTicket.viewName,220,130);
                    ctx.font="25px Arial";
                    ctx.fillText('景区地址：',100,200);
                    ctx.fillText(viewTicket.viewaddr,230,200);
                    ctx.fillText('使用日期：',100,270);
                    ctx.fillText(departDate,230,270);
                    ctx.fillText('门票类型：',100, 340);
                    ctx.fillText(viewTicket.viewPriceType,230,340);
                    ctx.fillText('门票价格：',100, 410);
                    ctx.fillText(viewTicket.ticketPrice+"  元",230, 410);
                    ctx.fillText('实付价格：',100, 480);
                    ctx.fillText(viewTicket.couponPrice+"  元",230, 480);
                    setTimeout(function(){
                        if(scope.ticketInformation.qrcodeid) {
                            ctx.drawImage(barcodeImg, 200, 550, 300, 300);
                        }else {
                            ctx.drawImage(barcodeImg, 100, 600, 500, 200);
                        }
                    },200)
                    ctx.font="20px Arial";
                    ctx.fillStyle = '#757575';
                    ctx.fillText(viewTicket.sourcePhone,200,1032);
                }
            }
               
            var btn1 = element.children('.btn1')[0];
            btn1.onclick = function() {
                var type = 'png';
                download(type);
            }

            //预览
            scope.preview = function() { 
                var dataUrl = canvas.toDataURL();  
                var newImg = document.createElement("img");  
                newImg.src = dataUrl;  
                //在新的窗口打开浏览器进去图片的预览和打印
                var printWindow = window.open(newImg);
                printWindow.document.write('<img src="'+newImg.src+'" id="ticket"/>')
                printWindow.document.getElementById("ticket").onload = function() {
                    printWindow.print();
                }
            } 
            //图片下载操作,指定图片类型 此方法为百度，原理未知
            function download(type) {
                //设置保存图片的类型
                var imgdata = canvas.toDataURL(type);
                //将mime-type改为image/octet-stream,让浏览器下载
                var fixtype = function (type) {
                    type = type.toLocaleLowerCase().replace(/jpg/i, 'jpeg');
                    var r = type.match(/png|jpeg|bmp|gif/)[0];
                    return 'image/' + r;
                }
                imgdata = imgdata.replace(fixtype(type), 'image/octet-stream');
                //将图片保存到本地
                //判断浏览器类型   
                var myBrowser = function() {  
                    var userAgent = navigator.userAgent;
                    var isOpera = userAgent.indexOf("OPR") > -1; if (isOpera) { return "Opera" };
                    if (userAgent.indexOf("Firefox") > -1){
                        return 'FF'; 
                    }
                    if (userAgent.indexOf("Trident") > -1){
                        return 'IE'; 
                    }
                    if (userAgent.indexOf("Edge") > -1){ 
                        return 'Edge'; 
                    }
                    if (userAgent.indexOf("Chrome") > -1){ 
                        return 'Chrome'; 
                    }
                    if (userAgent.indexOf("Safari") > -1){ 
                        return 'Safari'; 
                    }
                }
                //万恶的兼容性，此方法为百度，原理完全看不懂
                var base64Img2Blob = function(code){
                    var parts = code.split(';base64,');
                    var contentType = parts[0].split(':')[1];
                    var raw = window.atob(parts[1]);
                    var rawLength = raw.length;
                    var uInt8Array = new Uint8Array(rawLength);
                    for (var i = 0; i < rawLength; ++i) {
                      uInt8Array[i] = raw.charCodeAt(i);
                    }

                    return new Blob([uInt8Array], {type: contentType}); 
                }
                var saveFile = function (data, filename) {
                    var link = document.createElement('a');
                    link.href = data;
                    var browser = myBrowser();
                    if( browser == 'IE' || browser == 'Edge'){
                        var blob = base64Img2Blob(data);   
                        window.navigator.msSaveBlob(blob, filename);
                    }else{
                        link.download = filename;
                        var event = document.createEvent('MouseEvents');
                        event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                        link.dispatchEvent(event);
                    }
                }
                var filename;
                if(ticket.viewOrderid){
                    console.log("ticket.viewOrderid");
                    filename = ticket.viewOrderid + '.' + type;
                }else if(viewTicket.orderid){
                    console.log("viewTicket.orderid");
                    filename = viewTicket.orderid + '.' + type;
                }
                console.log(filename)
                saveFile(imgdata, filename);
            }
        }
    }
});