//直通车订单控制器
app.controller('CarOrderListController',['$rootScope','$scope','$http','$tableListService','$myHttpService','$modal','$state',function($rootScope,$scope,$http,$tableListService,$myHttpService,$modal,$state){
    $scope.orderList = {};//订单列表
    $scope.carorder = {};//车票
    var options = {//加载票据来源
        searchFormId:'J_search_form',
        listUrl:'api/vieworder/ticketsource/queryTicketSourceListByKeyword',
        size: '9999',
        multiTable: 'ticketSourceList',
        callback: function(scope, data){
            
            
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

    var options = {//加载车票订单列表
        searchFormId:"J_search_form",
        listUrl:"api/vieworder/queryViewOrderListByKeyword", 
        // orderBy: {
        //     orderByName: 'DEPARTDATE',
        //     orderByType: 'desc'
        // },
        callback: function($scope,data){
            
            $scope.totalCount = data.totalnum;//订单总数，用于获取ecxel
            angular.forEach(data.viewOrders,function(item, index){//string to boolean 不知道为何
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
    console.log($scope);
    $scope.viewOrderStatus=['1','2','3','4','5','0']; //车订单状态
    $scope.selectname = { // 车订单状态对应的字段
        1:'未付费',
        2:'已付费未使用',
        3:'已使用',
        4:'正在退款',
        5:'已退款',
        0:'全部状态'
    };
    //用户选择是否显示
    $scope.isShow = function(viewOrderid, isShow) {
        $myHttpService.post('api/vieworder/updateViewOrderPictureShow',{viewOrderid:viewOrderid,isShow: isShow},function(data) {
            if(data.code == 0) {
                layer.msg("修改成功",{offset: '100px'});
            }
        })
    }
    //下载excel
    $scope.exportToExcel = function(){
        var url = 'api/vieworder/getCarOrderExcel';
        var reqParam = {//用于下载excel的配置项
            ticketsource:  $scope.carorder.tmpOfflineId,//票据来源
            totalnum: $scope.totalCount,//总数
            viewOrderStatus: $scope.orderList.viewOrderStatu,//状态
        }
        if($scope.carorder.tmpOfflineId == '线上'){
            reqParam.ticketsource = encodeURI('线上')
        }
        
        $http.post(url,reqParam).success(function(data){
            window.location.href = data.path;//下载
        }).error(function(e){
            
        });
    }
    //将ticketSource转化为Id
    $scope.showSourceid = function(){
        angular.forEach($scope.ticketSourceList.sources, function(data){
            if(data.ticketSource == $scope.carorder.offline){
                $scope.carorder.tmpOfflineId = data.ticketSourceId;
            }
        });
    }
    //验票按钮绑定的验票功能
    $scope.checkTicket = function(viewOrderid) {
        layer.confirm('您确定要验票吗？', {icon: 3, title:'提示'},function(){
            $myHttpService.post('api/vieworder/offlineCheckUserTicket', {viewOrderid:viewOrderid}, function(data) {
                layer.alert(viewOrderid+"已验票");
                $state.go('app.carorder.list',{},{reload: true});
            })
        },function(index){
            layer.close(index);
        });
    }
    //打开车订单图片的模态框
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
    //打开车订单详情的模态框
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
    
    $scope.openDownloadCarOrderExcelModel = function(){
        var CarOrderExcelModel = $modal.open({
            templateUrl: 'a-bugubus/carorder/carOrderExcel.html',
            controller: 'downloadCarOrderExcelController',
            size: 'md',
            resolve: {
                totalnum: function () {
                    return $scope.pageResponse.totalnum;
                }
            }
        });
    }
    //车订单退款 分支为线上/线下
    $scope.applyRefund = function(item){
        layer.confirm('您确定要退款吗？', {icon: 3, title:'提示'},function(){
            //线上
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
                    
                    if(data.counponUse){
                        if(!data.couponRefund){
                            layer.alert('退款失败');
                        }
                    }else{
                        layer.alert('正在退款中，请耐心等待');
                    }
                    $state.go('app.carorder.list',{},{reload: true});
                })
                //线下
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
    //打印车票按钮绑定 功能打开车票模态框
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
}]);

//直通车订单添加控制器
app.controller('addCarOrderController',['$scope','$rootScope','$http','$state','$tableListService','$myHttpService','$modal',function($scope,$rootScope,$http,$state,$tableListService,$myHttpService,$modal){
    var superUserId = '2017001001001001001001';//用于线下下订单的超级用户
    $scope.carorder = {};//订单对象
    $scope.carorder.userid = superUserId;//绑定超级用户到订单对象
    $scope.showTicket = false;//控制是否显示打印车票界面
    $scope.carorder.schedule = [];
    //数组去重
    var options={//票据来源的请求配置
        searchFormId:'J_search_form',
        listUrl:'api/vieworder/ticketsource/queryTicketSourceListByKeyword',
        size: '9999',
        multiTable: 'ticketSourceList',
        callback: function(){
            $scope.carorder.havePower = true;
            $scope.carorder.offline = 0;
            if($scope.session_user.ticketSource){
                $scope.carorder.offline = $scope.session_user.ticketSource
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
    //选择日期
    $scope.selectedDate = function(departDate) {
        console.log('')
        departDate = new Date(departDate);
        var year = departDate.getFullYear();
        var month = departDate.getMonth()+1;
        var day = departDate.getDate();
        var date = year+'-'+month+'-'+day;
        //加载对应日期的排班信息
        $scope.loadScheduleTable(date,function(data){
             //判断时间是否显示过期排班的函数
            $scope.checkIsEnable = function(item) {
                var dateMs = departDate.getTime();
                if(dateMs < item.startDate||dateMs > item.endDate){
                    return false;
                }
                return true;
            }
            angular.forEach(data.busDetails,function(el){
                el.isEnable = $scope.checkIsEnable(el)&&(el.isShow == 1? true: false);
            })
            $scope.dateSchedules = data.busDetails;
        })
    }
    //格式化运营时间的日期格式
    $scope.formatWeeks = function(item){
        for (var i = item.weeks.length - 1,tmpVal = '',tmpName = '星期',tmpSell; i >= 0; i--) {
            tmpVal += item.weeks[i].week;
            tmpName += item.weeks[i].bwname.slice(2, 3) + (i > 0 ? '/' : '');
        }
        return tmpName;
    }
    //将ticketSource to Id
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
    //加载排班数据
    $scope.loadScheduleTable = function(date,callback) {
        var options = {
            searchFormId:"J_search_form",
            listUrl:"api/product/queryProductBusScheduleDetails",
            form: {
                name: 'departDate',
                value: date
            },
            callback: function(scope,data){
                for(var i = 0; i < data.busDetails.length; i++) {
                    //判断排班是否再当天运营
                    for(var k = 0, tmp = ''; k < data.busDetails[i].weeks.length; k++){
                        tmp += data.busDetails[i].weeks[k].week;
                    }
                    if((tmp.indexOf($scope.departDate.getDay()+1) != -1 )&&$scope.departDate.getTime()>data.busDetails[i].startDate&&$scope.departDate.getTime()<data.busDetails[i].endDate+24*60*60*1000) {
                        data.busDetails[i].isDisplay = true;
                    }else {
                        data.busDetails[i].isDisplay = false;
                    }

                    //点击勾选，再次点击取消的逻辑
                    for(var j = 0; j < $scope.carorder.schedule.length; j++) {
                        if(data.busDetails[i].bdid == $scope.carorder.schedule[j].bdid) {
                            data.busDetails[i].checked = true;
                        }
                    }
                }
            }
        };
        $tableListService.init($scope, options);
        $tableListService.get();
    }
    //监听所选时间的变化执行的函数，用于加载排班数据
    $scope.$watch('departDate',function(){
        if($scope.departDate){
            $scope.selectedDate($scope.departDate);
        }
        $scope.carorder.schedule = [];
        $scope.overDeadLineTime = true;
    })
    //选择具体排班
    $scope.selectSchedule = function(schedule,$index) {
        if(schedule.checked == true) {
            schedule.checked = false;
            for(var i = 0; i < $scope.carorder.schedule.length; i++){
                if($scope.carorder.schedule[i].bsid == schedule.bsid) {
                    $scope.carorder.schedule.splice(i,1);
                }
            }
            return
        }
        schedule.checked = true;
        $scope.carorder.schedule.push(schedule);
    };
    $scope.min = function(item) {
        if(item.count <=1 ){
            return;
        }
        item.count -= 1
    }
    $scope.add = function(item) {
        if(item.count >= item.leftTickets) {
            return;
        }
        item.count = Number(item.count) + 1;
    }
    $scope.reset = function() {
        $state.go('app.carorder.add',{},{reload: true});
    }
    //提交
    $scope.submit = function() {
        //默认为1
        var countNum = 1;
        var year = $scope.departDate.getFullYear();
        var month = $scope.departDate.getMonth()+1;
        var day = $scope.departDate.getDate();
        var departDate = year+'-'+month+'-'+day;
        var reqParam = {
            userid: $scope.carorder.userid,
            ticketSource: $scope.carorder.offline,
            departDate: departDate,
            bdids: []
        }
        for(var i = 0; i < $scope.carorder.schedule.length; i++) {
            reqParam.bdids.push($scope.carorder.schedule[i].bdid + '&' +  $scope.carorder.schedule[i].count) 
        }
        if(reqParam.bdids.length == 0) {
            return layer.msg('请添加排班');
        }
        if($scope.carorder.name){
            reqParam.name = $scope.carorder.name;
        }
        if($scope.carorder.userPhone){
            reqParam.userPhone = $scope.carorder.userPhone;
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
        if($rootScope.session_user.access == 'systemUser' && reqParam.ticketSource == 0){
            layer.msg('请选票据来源',{offset:'100px'});
            return;
        }
        console.log(reqParam)
        $myHttpService.post('api/vieworder/insertViewOrder',reqParam, function(data){
            layer.msg("添加成功！",{offset: '100px'});
            console.log(data)
            $scope.creatTicket(data);
        })
    }
    //控制是否显示打印票的函数
    $scope.creatTicket = function(data){
        // $scope.ticket = data.viewOrders;s
        $scope.tickets = data.viewOrders;
        $scope.totalMoney = 0;
        for(var i = 0; i < data.viewOrders.length; i++) {
            $scope.totalMoney += data.viewOrders[i].payPrice*100;
        }
        $scope.totalMoney/=100;
        $scope.showTicket = true;
    }
    //时间选择器的配置
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

//车票模态框的控制器
app.controller('carorderTicketController', ['$scope', '$modalInstance', 'ticketInfo',function($scope, $printTicketModel, ticketInfo) {
    $scope.ticket = ticketInfo;
    $scope.ok = function () {
        $printTicketModel.close();
    };
}]);

//车订单详情的控制器
app.controller('carorderDetailController', ['$scope', '$modalInstance', 'detail',function($scope, $showDetailModel, detail) {
    $scope.detail = detail;
    $scope.ok = function () {
        $showDetailModel.close();
    };
}]);

//上传图片界面的控制器
app.controller('uploadImageController',['$rootScope','$scope','$http','$state','$stateParams','$myHttpService',function($rootScope,$scope,$http,$state,$stateParams,$myHttpService){
    $scope.imgUrls = [];
    $scope.sendImgUrls = [];
    $scope.isLoadImage = false;
    $scope.uploadByForm = function(callback) {
        if($scope.imgUrls.length > 3){
            layer.msg("最多添加3张！",{offset: '100px'});
            return;
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
            layer.msg('上传的图片必须小于1M');
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
            $state.go('app.carorder.list',{},{reload: true});
        })
    }
}]);

//车票图片显示模态框的控制器
app.controller('carorderShowImageController', ['$scope', '$modalInstance', 'imageUrls',function($scope, $showImageModel, imageUrls) {

    $scope.imgUrls = imageUrls;
    $scope.ok = function () {
        $showImageModel.close();
    };
}]);

//门票订单控制器
app.controller('ViewOrderListController',['$scope','$http','$state','$myHttpService','$tableListService','$modal',function($scope,$http,$state,$myHttpService,$tableListService,$modal){
    $scope.orderList = {};//订单列表
    $scope.carorder = {};//门票
    var options = {//加载票据来源
        searchFormId:'J_search_form',
        listUrl:'api/vieworder/ticketsource/queryTicketSourceListByKeyword',
        size: '9999',
        multiTable: 'ticketSourceList',
        callback: function(scope, data){
            
            
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
    var options = {//配置加载门票的接口
        searchFormId:"J_search_form",
        listUrl:"api/vieworder/queryTicketOrderListByKeyword"
    };
    $tableListService.init($scope, options);
    $tableListService.get();
    
    //时间选择框的配置
    $scope.viewOrder = {
        opened:false,
        dateOptions:{
            datepickerMode:'day',
            showWeeks: false,
            minMode:'day'
        },
        format:"yyyy-MM-dd",
        clear:function(){
            $scope.newTime = null;
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
            $scope.viewOrder.opened = true;
        }
    };
    //退款的控制器 分支 线上/线下
    $scope.applyRefund = function(item){
        layer.confirm('您确定要退款吗？', {icon: 3, title:'提示'},function(){
            if(item.ticketSource != '线上'){
                $myHttpService.post('api/vieworder/ticketorder/offlineDoorTicketsRefund',{orderid:item.orderid},function(data){
                    
                    layer.msg('退款成功')
                    $state.go('app.carorder.view_list',{},{reload: true});
                },function(err) {
                    
                })
            }else{
                var reqParam = {
                    userid: item.userid,
                    openid: 'test',
                    viewOrderid: item.viewOrderid,
                    applyResult: 'true'
                }
                $myHttpService.post('api/vieworder/ticketorder/applyDoorTicketRefund',reqParam,function(data){
                    
                    layer.msg('退款成功')
                    $state.go('app.carorder.view_list',{},{reload: true});
                },function(err) {
                    
                })
            }
        },function(index){
            layer.close(index);
        });
    }
    $scope.showSourceid = function(){
        angular.forEach($scope.ticketSourceList.sources, function(data){
            if(data.ticketSource == $scope.carorder.offline){
                $scope.carorder.tmpOfflineId = data.ticketSourceId;
            }
        });
    }
    //打印车票按钮 打开打印车票的模态框
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
    $scope.openDownloadTicketExcelModel = function(){
        var TicketOrderExcelModel = $modal.open({
            templateUrl: 'a-bugubus/carorder/ticketOrderExcel.html',
            controller: 'downloadTicketOrderExcelController',
            size: 'md',
            resolve: {
                totalnum: function () {
                    return $scope.pageResponse.totalnum;
                }
            }
        });
    }
}]);

//线下添加门票的控制器
app.controller('addViewOrderController',['$scope','$rootScope','$http','$state','$tableListService','$myHttpService','$modal',function($scope,$rootScope,$http,$state,$tableListService,$myHttpService,$modal){
    var superUserId = '2017001001001001001001';//用于线下添加门票绑定的用户
    $scope.carorder = {};
    $scope.carorder.userid = superUserId;
    $scope.showTicket = false;
    $scope.addViewOrder = [];
    var options={//票据来源的配置
        searchFormId:'J_search_form',
        listUrl:'api/vieworder/ticketsource/queryTicketSourceListByKeyword',
        size: '9999',
        multiTable: 'ticketSourceList',
        callback: function(){
            $scope.carorder.havePower = true;
            $scope.carorder.offline = 0;
            if($scope.session_user.ticketSource){
                $scope.carorder.offline = $scope.session_user.ticketSource
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
    var options2 = {//加载景区列表
        searchFormId:"D_search_form",
        listUrl:"api/vieworder/queryViewInfoListByKeyword",
        callback: function(scope,data){
            for(var i = 0; i < data.viewInfos.length; i++) {
                for(var j = 0; j < $scope.addViewOrder.length; j++) {
                    if(data.viewInfos[i].viewid == $scope.addViewOrder[j].viewid) {
                        data.viewInfos[i].checked = true;
                    }
                }
            }
        }
    };
    $tableListService.init($scope, options2);
    $tableListService.get();
    //ticketSource to Id
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
   //打开选贼门票时的用户须知模态框
    $scope.openViewUserModel = function(notice){
        var ViewUserModel = $modal.open({
            templateUrl: 'a-bugubus/view/view_user.html',
            controller: 'checkViewUserController',
            size: 'md',
            resolve: {
                notice: function () {
                    return notice;
                }
            }
        });
    }
    //选择门票
    $scope.selectView = function(item) {
        console.log(item);
        if(item.checked == true) {
            item.checked = false;
            for(var i = 0; i < $scope.addViewOrder.length; i++) {
                if(item.viewid == $scope.addViewOrder[i].viewid) {
                    $scope.addViewOrder.splice(i, 1);
                }
            }
            return;
        }
        item.checked = true;
        $scope.addViewOrder.push(item);
    };
    $scope.min = function(item) {
        if(item.count <=1 ){
            return;
        }
        item.count -= 1
    }
    $scope.add = function(item) {
        item.count = Number(item.count) + 1;
    }
    $scope.submit = function() {
        //默认为1
        if($scope.departDate == null){
            return layer.msg('请选择日期')
        }
        if($scope.addViewOrder == null){
            return layer.msg('请选择门票')
        }
        if($scope.carorder.needSourceId&&$scope.carorder.sourceid == null){
            return layer.msg('请填写来源票ID')
        }
        var countNum = 1;
        var year = $scope.departDate.getFullYear();
        var month = $scope.departDate.getMonth()+1;
        var day = $scope.departDate.getDate();
        var departDate = year+'-'+month+'-'+day;
        var reqParam = {
            userid: $scope.carorder.userid,
            // count: $scope.carorder.ticketNum,
            useDate: departDate,
            viewPriceIds: []
        }
        for(var i = 0; i < $scope.addViewOrder.length; i++) {
            reqParam.viewPriceIds.push($scope.addViewOrder[i].viewPrices[0].viewPriceId + '&' +  $scope.addViewOrder[i].count) 
        }
        if($scope.carorder.sourceid){
            reqParam.sourceid = $scope.carorder.sourceid;
        }
        if($scope.carorder.name){
            reqParam.name = $scope.carorder.name;
        }
        if($scope.carorder.userPhone){
            reqParam.userPhone = $scope.carorder.userPhone;
        }
        if($scope.carorder.havePower){
            angular.forEach($scope.ticketSourceList.sources,function(item, index){
                if($scope.carorder.offline == item.ticketSource){
                    reqParam.ticketSourceId = item.ticketSourceId;
                }
            })
        }
        if($rootScope.session_user.access == 'systemUser' && reqParam.ticketSource == 0){
            layer.msg('请选票据来源',{offset:'100px'});
            return;
        }
        console.log(reqParam)
        $myHttpService.post('api/vieworder/insertTicketOrder',reqParam, function(data){
            layer.msg("添加成功！",{offset: '100px'});
            // $state.go('app.carorder.list',{},{reload: true});
            console.log(data)
            $scope.creatTicket(data);
        })
    }
    //购票完成之后打赢车票
    $scope.creatTicket = function(data){
        $scope.tickets = data.ticketOrders;
        $scope.totalMoney = 0;
        for(var i = 0; i < data.ticketOrders.length; i++) {
            $scope.totalMoney += data.ticketOrders[i].couponPrice*100;
        }
        $scope.totalMoney/=100;
        $scope.showTicket = true;
    }
    //配置时间选择项
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

//用户须知模态框
app.controller('checkViewUserController',['$scope','$http','$state','$myHttpService','notice','$modalInstance',function($scope,$http,$state,$myHttpService,notice,$ViewUserModel){
    $scope.notice = notice;
    $scope.ok = function () {
        $ViewUserModel.close();
    };
}]);

//下载车票excel模态框
app.controller('downloadCarOrderExcelController', ['$scope', '$myHttpService', '$modalInstance', 'totalnum', '$filter',function($scope, $myHttpService, $CarOrderExcelModel, totalnum, $filter) {
    $scope.ok = function () {
        $CarOrderExcelModel.close();
    };
    $scope.export = function() {
        if($scope.startDate == undefined || $scope.endDate == undefined) {
            layer.msg('请选择正确的时间段')
            return;
        }
        var reqParam = {
            startTime: $filter('date')($scope.startDate,'yyyy-MM-dd'),
            endTime: $filter('date')($scope.endDate,'yyyy-MM-dd'),
            totalnum: 99999
        }
        console.log(reqParam);
        $myHttpService.post('api/vieworder/getCarOrderExcel',reqParam,function(data) {
            // console.log(data)
            window.location.href = data.path;
        })
    }
    $scope.startDateOption = {
        opened:false,
        dateOptions:{
            datepickerMode:'day',
            showWeeks: false,
            minMode:'day'
        },
        format:"yyyy-MM-dd",
        disabled:function(date, mode) {
            return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
        },
        toggleMin: function() {
            $scope.minDate = $scope.minDate ? null : new Date();
        },
        open:function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.startDateOption.opened = true;
        }
    };
    $scope.endDateOption = {
        opened:false,
        dateOptions:{
            datepickerMode:'day',
            showWeeks: false,
            minMode:'day'
        },
        format:"yyyy-MM-dd",
        disabled:function(date, mode) {
            return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
        },
        toggleMin: function() {
            $scope.minDate = $scope.minDate ? null : new Date();
        },
        open:function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.endDateOption.opened = true;
        }
    };
}]);

//下载门票excel模态框
app.controller('downloadTicketOrderExcelController', ['$scope', '$myHttpService', '$modalInstance', 'totalnum', '$filter',function($scope, $myHttpService, $TicketOrderExcelModel, totalnum, $filter) {
    $scope.ok = function () {
        $TicketOrderExcelModel.close();
    };
    $scope.export = function() {
        if($scope.startDate == undefined || $scope.endDate == undefined) {
            layer.msg('请选择正确的时间段')
            return;
        }
        var reqParam = {
            startTime: $filter('date')($scope.startDate,'yyyy-MM-dd'),
            endTime: $filter('date')($scope.endDate,'yyyy-MM-dd'),
            totalnum: 99999
        }
        console.log(reqParam);
        $myHttpService.post('api/vieworder/getTicketSourceViewOrderExcel',reqParam,function(data) {
            window.location.href = data.path;
        })
    }
    $scope.startDateOption = {
        opened:false,
        dateOptions:{
            datepickerMode:'day',
            showWeeks: false,
            minMode:'day'
        },
        format:"yyyy-MM-dd",
        disabled:function(date, mode) {
            return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
        },
        toggleMin: function() {
            $scope.minDate = $scope.minDate ? null : new Date();
        },
        open:function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.startDateOption.opened = true;
        }
    };

    $scope.endDateOption = {
        opened:false,

        dateOptions:{
            datepickerMode:'day',
            showWeeks: false,
            minMode:'day'
        },
        format:"yyyy-MM-dd",

        disabled:function(date, mode) {
            return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
        },
        toggleMin: function() {
            $scope.minDate = $scope.minDate ? null : new Date();
        },
        open:function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.endDateOption.opened = true;
        }

    };
}]);