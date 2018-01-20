/**
 * @author Guohao
 * @date 2017-11-18
 * @version 1.0.0
 * @descriptions 景区订单管理的控制器
 */
app.controller('ViewOrderController',['$scope','$http','$state','$myHttpService','$tableListService','$modal',function($scope,$http,$state,$myHttpService,$tableListService,$modal){
	var options = {
        searchFormId:"J_search_form",
        listUrl:"api/ticketorder/queryTicketOrderListByKeyword"
    };
    $tableListService.init($scope, options);
    $tableListService.get();
    
    //用于验票
    $scope.checkTicket = function(orderid) {
        $myHttpService.post('api/ticketorder/offlineCheckUserDoorTicket',{orderid:orderid},function(data) {
            layer.msg('验票成功')
            $state.go("app.vieworder.list",{},{reload: true});
        })
    }
    //显示二维码
    $scope.isShowApk = false;//是否显示二维码
    $scope.downloadApp = function() {
        $scope.isShowApk = !$scope.isShowApk;
    }
    //订单有效期
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
    //打开下载excel的模态框
    $scope.openDownloadExcelModel = function(){
        var ExcelModel = $modal.open({
            templateUrl: 'a-bugubus/vieworder/downloadExcel.html',
            controller: 'downloadExcelController',
            size: 'md',
            resolve: {
                totalnum: function () {
                    return $scope.pageResponse.totalnum;
                }
            }
        });
    }
}]);

//下载excel的模态框
app.controller('downloadExcelController', ['$scope', '$myHttpService', '$modalInstance', 'totalnum', '$filter','$tableListService',function($scope, $myHttpService, $ExcelModel, totalnum, $filter,$tableListService) {
    //确认关闭
    $scope.ok = function () {
        $ExcelModel.close();
    };
    //导出excel
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
        $myHttpService.post('api/ticketorder/getViewOrderExcel',reqParam,function(data) {
            window.location.href = data.path;
        })
    }
    //根据时间筛选进行导出excel
    //开始时间
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
    //结束时间
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