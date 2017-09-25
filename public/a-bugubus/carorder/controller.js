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
            // if(localStorage.getItem('guilvbus_h_p')!='undefined'&&localStorage.getItem('guilvbus_t_s')!='undefined'){
            //     $scope.carorder.havePower = localStorage.getItem('guilvbus_h_p')=='0'?false:true;
                
            //     $scope.ticketSourceName = localStorage.getItem('guilvbus_t_s')
                
            //     angular.forEach($scope.ticketSourceList.sources,function(item, index){
            //         if(localStorage.getItem('guilvbus_t_s') == item.ticketSource){
            //             $scope.carorder.offline = item.ticketSourceId;
            //         }
            //     })
            // }else{
            //     $scope.carorder.havePower = true;
            //     $scope.carorder.offline = 0;
            // }
            // if($scope.ticketSourceList){
            //     angular.forEach($scope.ticketSourceList.sources, function(data){
            //         var needSourceId;
            //         if(data.needSourceId == '0'){
            //             needSourceId = false;
            //         }else if(data.needSourceId == '1'){
            //             needSourceId = true;
            //         }
            //         if(data.ticketSource == $scope.carorder.offline){
            //             $scope.carorder.needSourceId = needSourceId;
            //         }
            //     });
            // }
        }
    };
    $tableListService.init($scope, options);
    $tableListService.get();
    // console.log($rootScope.session_user.havePower)
    // if($rootScope.session_user.havePower == 0&&$rootScope.session_user.ticketSource){
    //    $scope.orderList.ticketSource = $rootScope.session_user.ticketSource;
    // }
    if(localStorage.getItem('guilvbus_h_p')!='undefined'&&localStorage.getItem('guilvbus_t_s')!='undefined'){
        $scope.orderList.havePower = localStorage.getItem('guilvbus_h_p')=='0'?false:true;
        $scope.orderList.ticketSource = localStorage.getItem('guilvbus_t_s');
        // $scope.orderList.ticketSource = $rootScope.ticketSource_user;
        $rootScope.havePower_user = $scope.orderList.havePower;
        $('#ticketSource').val(localStorage.getItem('guilvbus_t_s'));
        $scope.carorder.tmpOfflineId = localStorage.getItem('guilvbus_t_s');
    }else{
        $scope.orderList.havePower = true;
        $rootScope.havePower_user = true;
    }
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
            ticketsource: $scope.orderList.ticketSource
        }
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
    var options={
        searchFormId:'J_search_form',
        listUrl:'api/vieworder/ticketsource/queryTicketSourceListByKeyword',
        size: '9999',
        multiTable: 'ticketSourceList',
        callback: function(){
            if(localStorage.getItem('guilvbus_h_p')!='undefined'&&localStorage.getItem('guilvbus_t_s')!='undefined'){
                $scope.carorder.havePower = localStorage.getItem('guilvbus_h_p')=='0'?false:true;
                
                $scope.ticketSourceName = localStorage.getItem('guilvbus_t_s_n')
                
                angular.forEach($scope.ticketSourceList.sources,function(item, index){
                    if(localStorage.getItem('guilvbus_t_s') == item.ticketSourceId){
                        $scope.carorder.offline = item.ticketSourceId;
                    }
                })
            }else{
                $scope.carorder.havePower = true;
                $scope.carorder.offline = 0;
            }
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
            $scope.dateSchedules = data.products;
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
            callback&&callback(data);
        },function() {

        })
    }


    $scope.$watch('departDate',function(){
        if($scope.departDate){
            $scope.selectedDate($scope.departDate);
        }
        $scope.overDeadLineTime = true;
    })

    $scope.selectSchedule = function(schedule) {
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
        
    }
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
        if(!$scope.carorder.schedule.gobdid){
            reqParam.bdid = $scope.carorder.schedule.backbdid;
        }
        if($scope.carorder.sourceid){
            reqParam.sourceid = $scope.carorder.sourceid;
        }
        console.log(reqParam)
        if($scope.carorder.havePower){
            angular.forEach($scope.ticketSourceList.sources,function(item, index){
                if($scope.carorder.offline == item.ticketSource){
                    reqParam.ticketSource = item.ticketSourceId;
                }
            })
        }
        $myHttpService.post('api/vieworder/insertViewOrder',reqParam, function(data){
            layer.msg("添加成功！",{offset: '100px'});
            // $state.go('app.carorder.list',{},{reload: true});
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