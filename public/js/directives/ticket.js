angular.module('app.directives').directive('ticket', function($document) {
    return {
        restrict: 'A',
        replace: true,
        templateUrl: '../../tpl/blocks/ticket.html',
        scope: {
            ticketInformation: '=',
            // selectDate: '&',
        },
        link: function(scope, element, attrs) {
            var ticket = {}, viewTicket = {};
            if(scope.ticketInformation.barcode){//车票
                ticket = {
                    viewOrderid: scope.ticketInformation.viewOrderid,
                    start: scope.ticketInformation.departName,
                    startAddr: scope.ticketInformation.departaddr,
                    end: scope.ticketInformation.arriveName,
                    date: scope.ticketInformation.departDate,
                    time: scope.ticketInformation.departTime,
                    barcode: scope.ticketInformation.barcode, 
                    car: scope.ticketInformation.platenum,
                    phone: scope.ticketInformation.sourcePhone
                }
                
                console.log(ticket);
                var date = new Date(Number(ticket.date));
                var year = date.getFullYear();
                var month = date.getMonth() + 1;
                var day = date.getDate();
                var departDate = year + ' 年 ' + month + ' 月 ' + day + ' 日 ';

                var barcode = document.getElementById('barcodeCanvas');
                
                JsBarcode('#barcodeCanvas',ticket.barcode);

                var imgSrc = barcode.toDataURL();
                var img = new Image();
                img.crossOrigin="anonymous";
                img.src = '../../img/ticket.png';
                var barcodeImg = new Image();
                barcodeImg.src = imgSrc;
                var canvas = document.getElementById('canvas');
                var ctx = canvas.getContext('2d');
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
            }else if(scope.ticketInformation.ticketCode) {//门票
                viewTicket = {
                    orderid: scope.ticketInformation.orderid,
                    sourcePhone: scope.ticketInformation.sourcePhone,
                    ticketCode: scope.ticketInformation.ticketCode,
                    useDate: scope.ticketInformation.useDate,
                    viewName: scope.ticketInformation.viewName,
                    viewPriceType: scope.ticketInformation.viewPriceType,
                    ticketPrice: scope.ticketInformation.ticketPrice,
                    couponPrice: scope.ticketInformation.couponPrice
                }
                console.log(scope.ticketInformation);
                var date = new Date(Number(viewTicket.useDate));
                var year = date.getFullYear();
                var month = date.getMonth() + 1;
                var day = date.getDate();
                var departDate = year + ' 年 ' + month + ' 月 ' + day + ' 日 ';

                var barcode = document.getElementById('barcodeCanvas');
                // barcode.id = 'barcode';
                // console.log(barcode)
                JsBarcode('#barcodeCanvas',viewTicket.ticketCode);

                var imgSrc = barcode.toDataURL();
                var img = new Image();
                img.crossOrigin="anonymous";
                img.src = '../../img/view_ticket.png';
                var barcodeImg = new Image();
                barcodeImg.src = imgSrc;
                var canvas = document.getElementById('canvas');
                var ctx = canvas.getContext('2d');
                img.onload = function() {  
                    ctx.drawImage(img, 0, 0,700,1100);
                    ctx.fillStyle = '#0068B7';
                    ctx.font="bold 40px Arial";
                    ctx.fillText('景区：',100, 160);
                    ctx.fillText(viewTicket.viewName,220,160);
                    ctx.font="33px Arial";
                    ctx.fillText('使用日期：',100,280);
                    ctx.fillText(departDate,270,280);
                    ctx.fillText('门票类型：',100, 400);
                    ctx.fillText(viewTicket.viewPriceType,270,400);
                    ctx.fillText('价格：',390, 400);
                    ctx.fillText(viewTicket.ticketPrice+"  元",500, 400);
                    ctx.drawImage(barcodeImg, 100, 600, 500, 200);
                    ctx.font="20px Arial";
                    ctx.fillStyle = '#757575';
                    ctx.fillText(viewTicket.sourcePhone,200,1032);
                }
            }
            

            var btn1 = document.getElementById('btn1');
            btn1.onclick = function () {
                var type = 'png';
                download(type);
            }
            scope.preview = function() { 
                console.log('打印票')
                var dataUrl = canvas.toDataURL();  
                var newImg = document.createElement("img");  
                newImg.src = dataUrl;  
                /* document.body.appendChild(newImg);  */  
                /* window.open(newImg.src); */  
                var printWindow = window.open(newImg);
                    // printWindow.document.write();   
                printWindow.document.write('<img src="'+newImg.src+'" id="ticket"/>')
                 // printWindow.document.appendChild(newImg)

                printWindow.document.getElementById("ticket").onload = function() {
                    console.log('打印');
                    printWindow.print();
                }
                console.log('打印完成')
            } 
            //图片下载操作,指定图片类型
            function download(type) {
                //设置保存图片的类型
                var imgdata = canvas.toDataURL(type);
                //将mime-type改为image/octet-stream,强制让浏览器下载
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
                    filename = ticket.viewOrderid + '.' + type;
                }else if(viewTicket.orderid){
                    filename = ticket.orderid + '.' + type;
                }
                saveFile(imgdata, filename);
            }
        }
    }
});