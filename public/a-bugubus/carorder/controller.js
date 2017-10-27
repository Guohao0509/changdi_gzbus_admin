/**
 * @author 郭浩
 * @date 2017-7-11
 * @version 1.0.0
 * @descriptions 直通车订单管理界面的控制器
 */

/**
 * 直通车订单控制器
 */
app.controller('CarOrderListController',['$rootScope','$scope','$http','$tableListService','$myHttpService','$modal','$state',function($rootScope,$scope,$http,$tableListService,$myHttpService,$modal,$state){
    $scope.orderList = {};
    $scope.carorder = {};
    var options = {
        searchFormId:'J_search_form',
        listUrl:'api/vieworder/ticketsource/queryTicketSourceListByKeyword',
        size: '9999',
        multiTable: 'ticketSourceList',
        callback: function(scope, data){
            console.log(scope)
            console.log(data)
            data.sources.unshift({
                ticketSource: "线上",
                ticketSourceId: "线上"
            })
            data.sources.unshift({
                ticketSource: "全部",
                ticketSourceId: null
            })
        }
    };
    $tableListService.init($scope, options);
    $tableListService.get();

    var options = {
        searchFormId:"J_search_form",
        listUrl:"api/vieworder/queryViewOrderListByKeyword", 
        callback: function($scope,data){
            $scope.totalCount = data.totalnum;
            angular.forEach(data.viewOrders,function(item, index){
                if(item.isShow=='true'){
                    item.isShow = true;
                }else if(item.isShow == 'false'){
                    item.isShow = false;
                }
            })
        }
    };
    $tableListService.init($scope, options);
    $tableListService.get();
    $scope.isShow = function(viewOrderid, isShow) {
        $myHttpService.post('api/vieworder/updateViewOrderPictureShow',{viewOrderid:viewOrderid,isShow: isShow},function(data) {
            if(data.code == 0) {
                layer.msg("修改成功",{offset: '100px'});
            }
        })
    }
    $scope.exportToExcel = function(){
        var url = 'files/excel';
        var reqParam = {
            totalnum: $scope.totalCount,
            viewOrderStatus: $scope.orderList.viewOrderStatu,
        }
        if($scope.carorder.tmpOfflineId == '线上'){
            reqParam.ticketsource = encodeURI('线上')
        }
        console.log(reqParam)
        $http.post(url,reqParam).success(function(data){
            window.location.href = data.path;
        }).error(function(e){
            
        });
    }
    $scope.showSourceid = function(){
        
        angular.forEach($scope.ticketSourceList.sources, function(data){
            if(data.ticketSource == $scope.carorder.offline){
                $scope.carorder.tmpOfflineId = data.ticketSourceId;
            }
        });
    }
    $scope.openCarorderImageModal = function(images){
        var showImageModel = $modal.open({
            templateUrl: 'a-bugubus/carorder/showImage.html',
            controller: 'carorderShowImageController',
            size: 'md',
            resolve: {
                imageUrls: function () {
                    return images;
                }
            }
        });
    }
    $scope.openDetailModel = function(item){
        var showDetailModel = $modal.open({
            templateUrl: 'a-bugubus/carorder/detail.html',
            controller: 'carorderDetailController',
            size: 'md',
            resolve: {
                detail: function () {
                    return item;
                }
            }
        });
    }
    $scope.applyRefund = function(item){
        layer.confirm('您确定要退款吗？', {icon: 3, title:'提示'},function(){
            if((item.viewOrderStatus == 2&&item.ticketSource =='线上')||(item.viewOrderStatus == 4 && item.refundTime)){
                var reqParam = {
                    userid: item.userid,
                    openid: 'test',
                    viewOrderid: item.viewOrderid,
                    applyResult: 'true'
                };
                if(item.rechargeid){
                    reqParam.rechargeid = item.rechargeid;
                }
                $myHttpService.post('api/vieworder/applyRefund', reqParam, function(data) {
                    console.log(data)
                    if(data.counponUse){
                        if(!data.couponRefund){
                            layer.alert('退款失败');
                        }
                    }else{
                        layer.alert('正在退款中，请耐心等待');
                    }
                    $state.go('app.carorder.list',{},{reload: true});
                })
            }else if(item.viewOrderStatus == 2&&item.ticketSource !='线上'){
                var reqParam = {
                    viewOrderid: item.viewOrderid
                };
                $myHttpService.post('api/vieworder/offlineTicketsRefund', reqParam, function(data) {
                    layer.msg("退款成功",{offset: '100px'})
                    $state.go('app.carorder.list',{},{reload: true});
                })
            }else {
                layer.msg("此订单无法退款",{offset: '100px'})
            }
        },function(index){
            layer.close(index);
        });
        
    }
    $scope.printTicket = function(data){
        var printTicketModel = $modal.open({
            templateUrl: 'a-bugubus/carorder/printTicket.html',
            controller: 'carorderTicketController',
            size: 'md',
            resolve: {
                ticketInfo: function () {
                    return data;
                }
            }
        });
    }
    $scope.viewOrderStatus=['1','2','3','4','5','0'];
    $scope.selectname = {
        1:'未付费',
        2:'已付费未使用',
        3:'已使用',
        4:'正在退款',
        5:'已退款',
        0:'全部状态'
    };
}]);

/**
 * 直通车订单添加控制器
 */
app.controller('addCarOrderController',['$scope','$http','$state','$tableListService','$myHttpService','$modal',function($scope,$http,$state,$tableListService,$myHttpService,$modal){
    var superUserId = '2017001001001001001001';
    $scope.carorder = {};
    $scope.carorder.userid = superUserId;
    $scope.showTicket = false;
    //数组去重
    function unique(array){ 
        var n = {}, r = [], len = array.length, val, type; 
        for (var i = 0; i < array.length; i++) { 
            val = array[i].check; 
            type = typeof val; 
            if (!n[val]) { 
                n[val] = [type]; 
                r.push(array[i]); 
            } else if (n[val].indexOf(type) < 0) { 
                n[val].push(type); 
                r.push(array[i]); 
            } 
        } 
        return r; 
    }
    var options={
        searchFormId:'J_search_form',
        listUrl:'api/vieworder/ticketsource/queryTicketSourceListByKeyword',
        size: '9999',
        multiTable: 'ticketSourceList',
        callback: function(){
            $scope.carorder.havePower = true;
            $scope.carorder.offline = 0;
            console.log($scope.ticketSourceList);
            if($scope.ticketSourceList){
                angular.forEach($scope.ticketSourceList.sources, function(data){
                    var needSourceId;
                    if(data.needSourceId == '0'){
                        needSourceId = false;
                    }else if(data.needSourceId == '1'){
                        needSourceId = true;
                    }

                    if(data.ticketSource == $scope.carorder.offline){
                        $scope.carorder.needSourceId = needSourceId;
                    }
                });
            }
        }
    };
    $tableListService.init($scope, options);
    $tableListService.get();
    
    $scope.selectedDate = function(departDate) {
        departDate = new Date(departDate);
        var year = departDate.getFullYear();
        var month = departDate.getMonth()+1;
        var day = departDate.getDate();
        var date = year+'-'+month+'-'+day;
        $scope.loadScheduleTable(date,function(data){
            $scope.dateSchedules = data;
        })
    }
    $scope.showSourceid = function(){
        
        angular.forEach($scope.ticketSourceList.sources, function(data){
            var needSourceId;
            if(data.needSourceId == '0'){
                needSourceId = false;
            }else if(data.needSourceId == '1'){
                needSourceId = true;
            }
            if(data.ticketSource == $scope.carorder.offline){
                $scope.carorder.needSourceId = needSourceId;
            }
        });
    }
    $scope.loadScheduleTable = function(date,callback) {
        $myHttpService.post('api/vieworder/product/queryProductBusScheduleDetails',{departDate:date},function(data){
            console.log(data)
            var tmpData = [];
            for(var i = 0; i < data.products.length; i ++){
                if(data.products[i].backbsid){
                    tmpData.push({
                        productType: 0,
                        haveTicket: 1,
                        gobsname: data.products[i].gobsname,
                        gobdid: data.products[i].gobdid,
                        departName: data.products[i].departName,
                        arriveName: data.products[i].arriveName,
                        departaddr: data.products[i].departaddr,
                        departtime: data.products[i].departtime,
                        goPrice: data.products[i].goPrice,
                        viewPrices: data.products[i].viewPrices,
                        drivetime: data.products[i].drivetime,
                        leftTickets: data.products[i].goLeftTickets,
                        totalTickets: data.products[i].goTotalTickets,
                        check: data.products[i].gobsid+'1'
                    });
                    tmpData.push({
                        productType: 0,
                        haveTicket: 0,
                        gobsname: data.products[i].backbsname,
                        gobdid: data.products[i].backbdid,
                        departName: data.products[i].backDepartName,
                        arriveName: data.products[i].backArriveName,
                        departaddr: data.products[i].backDepartaddr,
                        departtime: data.products[i].backDeparttime,
                        goPrice: data.products[i].backPrice,
                        drivetime: data.products[i].drivetime,
                        leftTickets: data.products[i].backLeftTickets,
                        totalTickets: data.products[i].backTotalTickets,
                        check: data.products[i].backbsid+'0'
                    })
                }else{
                    if(data.products[i].haveTicket == 1){
                        data.products[i].check = data.products[i].gobsid+'1';
                    }else{
                         data.products[i].check = data.products[i].gobsid+'0';
                    }
                    tmpData.push(data.products[i]);
                }
            }
            var resultData = unique(tmpData)
            console.log(resultData)
            callback&&callback(resultData);
        },function() {

        })
    }
    
    $scope.$watch('departDate',function(){
        if($scope.departDate){
            $scope.selectedDate($scope.departDate);
        }
        $scope.overDeadLineTime = true;
    })

    $scope.selectSchedule = function(schedule,$index) {
        if(schedule.haveTicket == 1) {
            $scope.orderType = "haveTicket";
            $scope.disabledSelect = $index;
        }
        var dateMs = schedule.departdate;
        var tmpTimeArr = schedule.departtime.split(':');
        var dateMs = dateMs + (Number(tmpTimeArr[0])*60 + Number(tmpTimeArr[1]))*60*1000;
        function checkDeadLineTime(dateMs){
            var deadLineTime = 30*60*1000;
            var currentTime = new Date().getTime();
            if((dateMs - currentTime) < deadLineTime){
                $scope.overDeadLineTime = true;
                return true;
            }else{
                $scope.overDeadLineTime = false;
                return false;
            }
        }
        if(checkDeadLineTime(dateMs)){
            layer.msg('购票时间至出发时间小于30分钟',{offset:'100px'});
            return;
        }
        $scope.carorder.schedule = schedule;
        
    };
    $scope.reset = function() {
        // $scope.carorder = {};
        // $scope.carorder.userid = superUserId;
        $state.go('app.carorder.add',{},{reload: true});
    }
    $scope.submit = function() {
        //默认为1

        var countNum = 1;
        var year = $scope.departDate.getFullYear();
        var month = $scope.departDate.getMonth()+1;
        var day = $scope.departDate.getDate();
        var departDate = year+'-'+month+'-'+day;
        var reqParam = {
            userid: $scope.carorder.userid,
            // count: $scope.carorder.ticketNum,
            ticketSource: $scope.carorder.offline,
            departDate: departDate,
            count: countNum,
            bdid:$scope.carorder.schedule.gobdid,
        }
        if($scope.orderType == "haveTicket") {
            var id = 'select'+$scope.disabledSelect;
            var select = document.getElementById(id);
            reqParam.viewPriceId = select.value;
            console.log(select.value);
            if(select.value == 0){
                layer.msg('请选择票价类型',{offset:'100px'});
                return;
            }
        }
        if(!$scope.carorder.schedule.gobdid){
            reqParam.bdid = $scope.carorder.schedule.backbdid;
        }
        if($scope.carorder.sourceid){
            reqParam.sourceid = $scope.carorder.sourceid;
        }
        if($scope.carorder.havePower){
            angular.forEach($scope.ticketSourceList.sources,function(item, index){
                if($scope.carorder.offline == item.ticketSource){
                    reqParam.ticketSource = item.ticketSourceId;
                }
            })
        }
        console.log('reqParam',reqParam)
        $myHttpService.post('api/vieworder/insertViewOrder',reqParam, function(data){
            layer.msg("添加成功！",{offset: '100px'});
            // $state.go('app.carorder.list',{},{reload: true});
            console.log(data);
            $scope.creatTicket(data);
        })
    }
  
    $scope.creatTicket = function(data){
        $scope.ticket = data.viewOrder;
        $scope.showTicket = true;
    }
    $scope.scheduleTime = {
        opened:false,
        dateOptions:{
            datepickerMode:'day',
            showWeeks: false,
            minMode:'day'
        },
        format:"yyyy-MM-dd",
        clear:function(){
            $scope.regDate = null;
        },
        disabled:function(date, mode) {
            return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
        },
        toggleMin: function() {
            $scope.minDate = $scope.minDate ? null : new Date();
        },
        open:function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.scheduleTime.opened = true;
        }
    };
}]);

app.controller('carorderTicketController', ['$scope', '$modalInstance', 'ticketInfo',function($scope, $printTicketModel, ticketInfo) {
    $scope.ticket = ticketInfo;
    $scope.ok = function () {
        $printTicketModel.close();
    };
}]);

app.controller('carorderDetailController', ['$scope', '$modalInstance', 'detail',function($scope, $showDetailModel, detail) {
    $scope.detail = detail;
    $scope.ok = function () {
        $showDetailModel.close();
    };
}]);

app.controller('uploadImageController',['$rootScope','$scope','$http','$state','$stateParams','$myHttpService',function($rootScope,$scope,$http,$state,$stateParams,$myHttpService){
    $scope.imgUrls = [];
    $scope.sendImgUrls = [];
    $scope.isLoadImage = false;
    $scope.uploadByForm = function(callback) {
        if($scope.imgUrls.length > 3){
            layer.msg("最多添加3张！",{offset: '100px'});
            return 
        }
        //用form 表单直接 构造formData 对象; 就不需要下面的append 方法来为表单进行赋值了。
        var formData = new FormData($("#myForm")[0]);
        // var host = "192.168.5.183:4000";
        var file = document.getElementById("file_upload").files[0]
        if(file.type.indexOf('image/') == -1){
            layer.msg('上传的文件类型必须是png、jpg或jpeg图片');
            return;
        }
        if(file.size > 1024*1000){
            layer.msg('上传的图片必须小于1M')
            return;
        }
        var url = "files/image";
        $.ajax({
            url: url,
            type: 'POST',
            data: formData,
            //必须false才会避开jQuery对 formdata 的默认处理,XMLHttpRequest会对 formdata 进行正确的处理
            processData: false,
            //必须false才会自动加上正确的Content-Type
            contentType: false,
            success: function (data) {
                if(data.code == -1){
                    layer.msg('请选择图片格式(.jpg/.jpeg/.png)文件',{offset: '100px'});
                    return;
                }
                $scope.isLoadImage = true;
                $scope.sendImgUrls.push(data.newPath);
                // var tmpArr = data.newPath.split('/');
                // tmpArr[2] = host;
                // var tmpStr = tmpArr.join('/');
                // console.log(tmpStr)
                $scope.imgUrls.push(data.newPath);
                $scope.$apply();
            },
            error: function (data) {
            }
        });
    }
    $scope.submit = function () {
        var reqParam = {
            viewOrderid: $stateParams.id,
        }
        if($scope.sendImgUrls[0]){
            reqParam.hieone = $scope.sendImgUrls[0];
        }
        if($scope.sendImgUrls[1]){
            reqParam.hietwo = $scope.sendImgUrls[1];
        }
        if($scope.sendImgUrls[2]){
            reqParam.hiethree = $scope.sendImgUrls[2];
        }
        $myHttpService.post('api/vieworder/updateViewOrderPhoto',reqParam, function(data){
            layer.msg("添加成功！",{offset: '100px'})
            // var reqParam = {
            //     deleteImages: $scope.sendImgUrls
            // }
            // $scope.deleteImage(reqParam);
            $state.go('app.carorder.list',{},{reload: true});
        })
    }
    // $scope.deleteImage = function(deleteImages){
    //     $myHttpService.post('files/deleteImage',deleteImages,function(data){
    //     },function(){
    //     });
    // };
}]);
app.controller('carorderShowImageController', ['$scope', '$modalInstance', 'imageUrls',function($scope, $showImageModel, imageUrls) {

    $scope.imgUrls = imageUrls;
    $scope.ok = function () {
        $showImageModel.close();
    };
}]);