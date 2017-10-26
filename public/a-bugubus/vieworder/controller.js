/**
 * @author Guohao
 * @date 2016-10-18
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
}]);