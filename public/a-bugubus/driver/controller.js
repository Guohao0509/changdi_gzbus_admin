/**
 * @author 周快
 * @date 2016-10-09
 * @version 1.0.0
 * @descriptions 司机管理界面的控制器
 */
/**
 * @author 郭浩
 * @date 2017-8-09
 * @descriptions 膜拜大神
 */
/**
 * 司机列表控制器
 */
app.controller('DriverListController',['$rootScope','$scope','$http','$state','$localStorage','$tableListService','$myHttpService',function($rootScope,$scope,$http,$state,$localStorage,$tableListService,$myHttpService){
    //全选
    // var selected = false;
    // $scope.selectAll = function(){
    //     selected = !selected;
    //     angular.forEach($scope.pageResponse.drivers,function(item){
    //         item.selected = selected;
    //     });
    // }
    var options = {
        searchFormId:"J_search_form",
        listUrl:"api/driver/queryDriversByKeyword.htm"
    };
    $tableListService.init($scope, options);
    $tableListService.get();
    $scope.delete=function(item){
        layer.confirm('您确定要删除吗？', {icon: 3, title:'提示'},function(){
            $myHttpService.post("api/driver/deleteDriver.htm",item,function(){
                $state.go("app.driver.list",{},{reload: true});
                layer.msg("删除成功！",{offset: '100px'})
            });
        },function(index){
            layer.close(index);
        });
    }
}]);

/**
 * 司机编辑控制器
 */
app.controller('DriverEditController',['$rootScope','$scope','$myHttpService','$state','$localStorage','$stateParams','$filter','md5','$timeout',function($rootScope,$scope,$myHttpService,$state,$localStorage,$stateParams,$filter,md5,$timeout){
    $scope.editMode = !!$stateParams.id;//检测有没有ID，判断当前是添加还是编辑，共用一套模板
    if($scope.editMode){//编辑模式
        $scope.driver = {
            driverid:$stateParams.id
        };
        //获取司机内容
        $myHttpService.post("api/driver/queryDriverInfo.htm",$scope.driver,function(data){
            $scope.driver = data.driver;
            $scope.driver.loginpwd = "";        
        },function(){
            $timeout(function(){
                $state.go('app.driver.list');
            },3000)
        });
        $scope.submit = function(){
            $scope.tmpDriver = angular.copy($scope.driver);
            if( $scope.tmpDriver.loginpwd!=""){
                $scope.tempPwd  = $scope.tmpDriver.loginpwd;
                $scope.tmpDriver.loginpwd = md5.createHash($scope.tmpDriver.loginpwd);
            }
            //提交表单到服务器地址
            $myHttpService.post("api/driver/updateDriverInfo.htm",$scope.tmpDriver,function(data){
                layer.msg("修改成功！",{offset: '100px'});
                $timeout(function(){
                    $state.go('app.driver.list');
                },1000)
            },function(){
                // $scope.driver.loginpwd=$scope.tempPwd;
            });
        };
        $scope.delete=function(item){
            layer.confirm('您确定要删除吗？', {icon: 3, title:'提示'},function(){
                $myHttpService.post("api/driver/deleteDriver.htm",item,function(){
                    layer.msg("删除成功！",{offset: '100px'})
                    $state.go("app.driver.list",{},{reload: true});
                });
            },function(index){
                layer.close(index);
            });
        }
    }else{ //添加模式
        $scope.driver = {city:"贵阳市",sex:"男"};
        //当前页面的错误
        //提交添加司机的表单
        $scope.submit = function(){
            //提交表单到服务器地址
            $scope.tempPwd  = $scope.driver.loginpwd;
            $scope.tmpDriver = angular.copy($scope.driver)
             $scope.tmpDriver.loginpwd=md5.createHash($scope.tmpDriver.loginpwd);
            $myHttpService.post("api/driver/insertDriver.htm",$scope.tmpDriver,function(data){
                layer.msg("添加成功！",{offset: '100px'})
                $state.go("app.driver.add",{},{reload:true});
            });
        }
    }

    $scope.$watch('dt', function(v){
        $scope.driver.birthday = $filter('date')(v,'yyyy-MM-dd');
    });
    $scope.today = function() {
        $scope.dt = new Date();
    };
    $scope.today();

    $scope.clear = function () {
        $scope.dt = null;
    };

    // Disable weekend selection
    $scope.disabled = function(date, mode) {
        return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
    };

    $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened = true;
    };
    $scope.dateOptions = {
        formatYear: 'yyyy',
        startingDay: 1,
        class: 'datepicker'
    };
    $scope.dt = '';
}]);