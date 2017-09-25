/**
 * @author zhoukuai
 * @date 2017/2/28
 * @version 0.1
 * @description 统计相关的控制器，收益统计，用户统计
 */

app.controller('StatisticController',['$rootScope','$scope','$http','$state','$localStorage','$stateParams','$filter','$tableListService','$myHttpService',function($rootScope,$scope,$http,$state,$localStorage,$stateParams,$filter,$tableListService,$myHttpService){
    $scope.d = [ [1,6.5],[2,6.5],[3,7],[4,8],[5,7.5],[6,7],[7,6.8],[8,7],[9,7.2],[10,7],[11,6.8],[12,7] ];
    function getDateByDays(days,date){
        if(days==undefined){
            days = 0;
        }
        var date = date || new Date(),
            timestamp, newDate;
        if(!(date instanceof Date)){
            date = new Date(date.replace(/-/g, '/'));
        }
        timestamp = date.getTime();
        newDate = new Date(timestamp + days * 24 * 3600 * 1000);
        return newDate;
    }
    $scope.startDate = $filter('date')(getDateByDays(-8),'yyyy-MM-dd');
    $scope.endDate = $filter('date')(getDateByDays(-1),'yyyy-MM-dd');
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
    //定义前端页面输出的结果
    $scope.statisticData = {};
    $scope.lineChartXData = [];
    $scope.lineChartYData = [];
    //请求最上面的关键数据
    $myHttpService.post("api/trade/getDayStatisticsCount",{},function(data){
        $scope.statisticData = data;
    });
    //定义表格请求配置
    var options = {
        searchFormId:"J_search_form",
        listUrl:"api/trade/queryDayStatistics",
    };

    //alert("时间段总收益："+JSON.stringify($scope.item));
    //用于标志jq-flot插件的配置是否发生更改的变量
    $scope.a = 'a';

    //请求列表数据和表格数据 定义插件重绘的标志；
    $scope.queryStatitstic = function(){
        // console.log({
        //     startDate:$scope.startDate instanceof Date?$filter('date')($scope.startDate,'yyyy-MM-dd'):$scope.startDate,
        //     endDate:$scope.endDate instanceof Date?$filter('date')($scope.endDate,'yyyy-MM-dd'):$scope.endDate
        // })
        $myHttpService.post("api/trade/getDayStatisticsDate",{
            startDate:$scope.startDate instanceof Date?$filter('date')($scope.startDate,'yyyy-MM-dd'):$scope.startDate,
            endDate:$scope.endDate instanceof Date?$filter('date')($scope.endDate,'yyyy-MM-dd'):$scope.endDate
        },function(data){
            //处理x轴,y轴数据
            var x = [],y=[];
            for(var i=0;i< data.rows.length;i++){
                y.push([i, data.rows[i].totalMon]);
                x.push([i,$filter('date')(data.rows[i].date,'MM-dd')]);
            }
            //修改标志，通知angular重新调用jq-flot插件
            $scope.a = $scope.a=='a'?'b':'a';
            $scope.lineChartXData = x;
            $scope.lineChartYData = y;

        });

        options. formData = {
            startDate:$scope.startDate instanceof Date?$filter('date')($scope.startDate,'yyyy-MM-dd'):$scope.startDate,
                endDate:$scope.endDate instanceof Date?$filter('date')($scope.endDate,'yyyy-MM-dd'):$scope.endDate
        }
        //初始化表格配置
        $tableListService.init($scope, options);
        $scope.pageRequest.getResponse();
    }
    $scope.queryStatitstic();
}]);
