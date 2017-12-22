/**
 * @author Guohao
 * @date 2017-11-18
 * @version 1.0.0
 * @descriptions 景区订单管理的控制器
 */
app.controller('ViewOrderController',['$scope','$http','$state','$myHttpService','$tableListService','$modal',function($scope,$http,$state,$myHttpService,$tableListService,$modal){
    $scope.isShowApk = false;
	var options = {
        searchFormId:"J_search_form",
        listUrl:"api/ticketorder/queryTicketOrderListByKeyword"
    };
    $tableListService.init($scope, options);
    $tableListService.get();
    
    $scope.checkTicket = function(orderid) {
        $myHttpService.post('api/ticketorder/offlineCheckUserDoorTicket',{orderid:orderid},function(data) {
            layer.msg('验票成功')
            $state.go("app.vieworder.list",{},{reload: true});
        })
    }
    $scope.downloadApp = function() {
        $scope.isShowApk = !$scope.isShowApk;
    }
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
    // $scope.startDateOption = {
    //     opened:false,
    //     dateOptions:{
    //         datepickerMode:'day',
    //         showWeeks: false,
    //         minMode:'day'
    //     },
    //     format:"yyyy-MM-dd",
    //     disabled:function(date, mode) {
    //         return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
    //     },
    //     toggleMin: function() {
    //         $scope.minDate = $scope.minDate ? null : new Date();
    //     },
    //     open:function($event) {
    //         $event.preventDefault();
    //         $event.stopPropagation();
    //         $scope.startDateOption.opened = true;
    //     }
    // };
    // $scope.endDateOption = {
    //     opened:false,
    //     dateOptions:{
    //         datepickerMode:'day',
    //         showWeeks: false,
    //         minMode:'day'
    //     },
    //     format:"yyyy-MM-dd",
    //     disabled:function(date, mode) {
    //         return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
    //     },
    //     toggleMin: function() {
    //         $scope.minDate = $scope.minDate ? null : new Date();
    //     },
    //     open:function($event) {
    //         $event.preventDefault();
    //         $event.stopPropagation();
    //         $scope.endDateOption.opened = true;
    //     }
    // };
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

app.controller('downloadExcelController', ['$scope', '$myHttpService', '$modalInstance', 'totalnum', '$filter','$tableListService',function($scope, $myHttpService, $ExcelModel, totalnum, $filter,$tableListService) {
    $scope.ok = function () {
        $ExcelModel.close();
    };
    var options = {
        searchFormId:"J_search_form",
        listUrl:"api/ticketorder/queryTicketOrderListByKeyword"
    };
    $tableListService.init($scope, options);
    $tableListService.get();
    $scope.export = function() {
        var reqParam = {
            startTime: $filter('date')($scope.startDate,'yyyy-MM-dd'),
            endTime: $filter('date')($scope.endDate,'yyyy-MM-dd'),
            totalnum: 99999
        }
        $myHttpService.post('api/ticketorder/getViewOrderExcel',reqParam,function(data) {
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