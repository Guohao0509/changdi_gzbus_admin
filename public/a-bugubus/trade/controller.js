/**
 * @author 周快
 * @date 2017-02-26
 * @version 1.0.0
 * @descriptions 查询用户已经购买的车票
 */
app.controller('ticketListController',['$rootScope','$scope','$http','$state','$localStorage','$stateParams','$myHttpService','$tableListService','$modal',function($rootScope,$scope,$http,$state,$localStorage,$stateParams,$myHttpService,$tableListService,$modal){
    //全选
    var selected = false;
    $scope.selectAll = function(){
        selected = !selected;
        angular.forEach($scope.pageResponse.rows,function(item){
            item.selected = selected;
        });
    };
    //搜索分页选项
    var options = {
        searchFormId:"J_search_form",
        listUrl:"api/ticket/queryTicketList.htm"
    };
    /* $scope.delete=function(item){
        layer.confirm('您确定要删除吗？', {icon: 3, title:'提示'},function(){
            $myHttpService.post("api/car/deleteCarinfo.htm",item,function(){
                layer.msg("删除成功！",{offset: '100px'});
                window.setTimeout(function(){
                    $state.go("app.bus.list",{},{reload: true});
                },1000);
            });
        },function(index){
            layer.close(index);
        });

    }*/
    $tableListService.init($scope, options);
    $tableListService.get();
    //购票时间选择组件配置
    $scope.buyDateComponets = {
        opened:false,
        dateOptions:{
            datepickerMode:'day',
            showWeeks: false,
            minMode:'day'
        },
        format:"yyyy-MM-dd",
        clear:function(){
            $scope.buydate = null;
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
            $scope.buyDateComponets.opened = true;
        }
    };
    $scope.takeDateComponets = {
        opened:false,
        dateOptions:{
            datepickerMode:'month',
            showWeeks: false,
            minMode:'month'
        },
        format:"yyyy-MM",
        clear:function(){
            $scope.takeDate = null;
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
            $scope.takeDateComponets.opened = true;
        }
    };


    /**
     * 打开车票详情弹窗
     * @param ticketId
     */
    $scope.openTicketDetailModal = function(ticketId){
        var modalInstance = $modal.open({
            templateUrl: 'a-bugubus/trade/ticket_detail.html',
            controller: 'TicketDetailModalController',
            size: 'md',
            resolve: {
                ticketId: function () {
                    return ticketId;
                }
            }
        });
    }

}]);
/**
 * 车票详情弹窗控制器
 */
app.controller('TicketDetailModalController', ['$scope', '$modalInstance', 'ticketId','$myHttpService',function($scope, $modalInstance, ticketId,$myHttpService) {
    //发起车票ID的查询请求
    $myHttpService.post("api/ticket/queryTicketInfoByTicketId",{ticketid:ticketId},function(data){
        $scope.data = data;
    });
    //车票详情
    $scope.ok = function () {
        $modalInstance.close();
    };
}]);

/**
 * 查询充值信息
 */
app.controller('rechargeListController',['$rootScope','$scope','$http','$state','$localStorage','$stateParams','$myHttpService','$tableListService','$modal',function($rootScope,$scope,$http,$state,$localStorage,$stateParams,$myHttpService,$tableListService,$modal){
    /*全选*/
    var select = false;
    $scope.selectAll = function(){
        select = !select;
        angular.forEach($scope.pageResponse.rows,function(item){
            item.selected = select;
        });
    };
    //搜索分页选项
    var rechargeoptions = {
        searchFormId:"J_recharge_form",
        listUrl:"api/rechargeOrder/queryRechargeOrderListByKeword.htm"
    };
    $tableListService.init($scope, rechargeoptions);
    $tableListService.get();

    //充值查询时间
    $scope.rechargestartTime = {
        opened:false,
        dateOptions:{
            datepickerMode:'day',
            showWeeks: false,
            minMode:'day'
        },
        format:"yyyy-MM-dd",
        clear:function(){
            $scope.startTime = null;
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
            $scope.rechargestartTime.opened = true;
        }
    };
    $scope.rechargeendTime = {
        opened:false,
        dateOptions:{
            datepickerMode:'day',
            showWeeks: false,
            minMode:'day'
        },
        format:"yyyy-MM-dd",
        clear:function(){
            $scope.endTime = null;
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
            $scope.rechargeendTime.opened = true;
        }
    };

    //清空查询条件
    $scope.clearquery=function(){
        $scope.pmrcorderid="";
        $scope.startTime="";
        $scope.endTime="";
        $scope.userName="";
    };

    /**
     * 打开充值详情弹窗
     * @param pmrcorderid
     */
    $scope.openReachargeDetailModal = function(pmrcorderid){
        var Reacharmodal = $modal.open({
            templateUrl: 'a-bugubus/trade/recharge_details.html',
            controller: 'ReachargeDetailModalController',
            size: 'md',
            resolve: {
                pmrcorderid: function () {
                    return pmrcorderid;
                }
            }
        });
    }
}]);
    //充值查询控制器
app.controller('ReachargeDetailModalController', ['$scope', '$modalInstance', 'pmrcorderid','$myHttpService',function($scope, $Reacharmodal, pmrcorderid,$myHttpService) {
    //发起充值ID的查询请求
    $myHttpService.post("api/rechargeOrder/queryRechargeOrderInfoByPmrcorderid",{pmrcorderid:pmrcorderid},function(data){
        $scope.data = data;
    });
    //充值详情
    $scope.ok = function () {
        $Reacharmodal.close();
    };
}]);