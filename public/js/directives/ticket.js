angular.module('app.directives').directive('ticket', function($document) {
    return {
        restrict: 'A',
        replace: true,
        templateUrl: '../../tpl/blocks/ticket.html',
        scope: {
            ticketInfo: '=',
            // selectDate: '&',
        },
        link: function(scope, element, attrs) {
             var ticket = {
                viewOrderid: scope.ticketInfo.viewOrderid,
                start: scope.ticketInfo.departName,
                end: scope.ticketInfo.arriveName,
                date: scope.ticketInfo.departDate,
                time: scope.ticketInfo.departTime,
                barcode: scope.ticketInfo.barcode, 
                car: scope.ticketInfo.platenum,
                phone: scope.ticketInfo.sourcePhone
            }
            console.log(ticket);
            var date = new Date(Number(ticket.date));
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var day = date.getDate();
            var departDate = year + ' 年 ' + month + ' 月 ' + day + ' 日 ';

            var barcode = document.getElementById('barcodeCanvas');
            // barcode.id = 'barcode';
            // console.log(barcode)
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
                ctx.fillText(ticket.start,230,460);
                ctx.font="20px Arial";
                ctx.fillStyle = '#757575';
                ctx.fillText(ticket.phone,200,1032);
                ctx.drawImage(barcodeImg, 100, 620, 500, 200);
            }

            var btn1 = document.getElementById('btn1');
            btn1.onclick = function () {
                var type = 'png';
                download(type);
            }
            scope.preview = function() { 
                var dataUrl = canvas.toDataURL();  
                var newImg = document.createElement("img");  
                newImg.src = dataUrl;  
                /* document.body.appendChild(newImg);  */  
                /* window.open(newImg.src); */  
                var printWindow = window.open(newImg.src);  
                    // printWindow.document.write();   
                 printWindow.document.write('<img src="'+newImg.src+'" id="ticket"/>')
                 // printWindow.document.appendChild(newImg)
                 setTimeout(function(){
                    printWindow.print();  
                 },0)
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
                var filename = ticket.viewOrderid + '.' + type;
                saveFile(imgdata, filename);
            }
        }
    }
});
