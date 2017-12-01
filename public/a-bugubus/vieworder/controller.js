/**
 * @author Guohao
 * @date 2017-11-18
 * @version 1.0.0
 * @descriptions 景区订单管理的控制器
 */
app.controller('ViewOrderController',['$scope','$http','$state','$myHttpService','$tableListService',function($scope,$http,$state,$myHttpService,$tableListService){
	var options = {
        searchFormId:"J_search_form",
        listUrl:"api/ticketorder/queryTicketOrderListByKeyword"
    };
    $tableListService.init($scope, options);
    $tableListService.get();
    console.log($scope);
    $scope.checkTicket = function(orderid) {
        $myHttpService.post('api/ticketorder/offlineCheckUserDoorTicket',{orderid:orderid},function(data) {
            layer.msg('验票成功')
            $state.go("app.vieworder.list",{},{reload: true});
        })
    }
    $scope.downloadApp = function() {
        window.location.href = 'http://111.230.129.41:5050/app/app-release.apk';
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
}]);