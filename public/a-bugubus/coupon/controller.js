 /**
 * @author 郭浩
 * @date 2017-7-11
 * @version 1.0.0
 * @descriptions 优惠券管理界面的控制器
 */


/**
 * 优惠券列表控制器
 */
app.controller('CouponListController',['$scope','$http','$state','$tableListService','$myHttpService',function($scope,$http,$state,$tableListService,$myHttpService){
    //初始化数据和筛选查询数据功能
    var options = {
        searchFormId:"J_search_form",
        listUrl:"api/buslinecoupon/queryBuslineCouponListByKeyword",

    };
    $tableListService.init($scope, options);
    $tableListService.get();

    //删除优惠券功能
    $scope.deleteCoupon = function(brcid) {
        layer.confirm('您确定要删除吗？', {icon: 3, title:'提示'},function(){
            $myHttpService.post("api/buslinecoupon/deleteBuslineCoupon",{brcid:brcid},function(data){
                layer.msg("删除成功！",{offset: '100px'});
                $state.go('app.coupon.list',{},{reload: true});
            });
        },function(index){
            layer.close(index);
        });
    }
}]);

/**
 * 优惠券编辑控制器
 */
app.controller('CouponEditController',['$scope','$myHttpService','$tableListService','$state','$filter',function($scope,$myHttpService,$tableListService,$state,$filter){
    //唤出用户选择列表
    $scope.selectUserToggle= function(){
        $scope.userEditMode= !$scope.userEditMode;
        if($scope.userEditMode){
            $tableListService.init($scope,{
                searchFormId:"J_search_form",
                listUrl:"api/user/queryUserListByKeword.htm",
                callback: function($scope,data){
                    if($scope.selectedUser){
                        angular.forEach(data.rows,function(item,index){
                            if(item.userid == $scope.selectedUser.userid){
                                item.checked = true;
                            }else{
                                item.checked = false;
                            }
                        })
                    }
                }
            });
            $tableListService.get();
        }
    };

    //在未选择用户时禁止提交按钮
    $scope.missParm = true;
    //选择用户(单选)
    $scope.changeCheck = function(item) {
        //被选择的用户
        $scope.selectedUser = item;
        //选择用户时开启提交按钮
        $scope.missParm = false;
        $scope.userEditMode= !$scope.userEditMode;
        $scope.selectSingleUser = true;
    }
    $scope.selectAllUser = function() {
        $scope.submiting = true;
        var reqParm = {
            couponMoney: $scope.coupon.discount,
            overDate:$filter('date')($scope.deadlineDate, 'yyyy-MM-dd HH:mm:ss')
        }
        $myHttpService.post("api/buslinecoupon/insertBuslineCouponForAllUser",reqParm,function(data){
            //成功回调
            layer.msg(data.msg,{offset: '100px'});
            $state.go("app.coupon.edit",{},{reload:true});
        },function(){
             $scope.submiting = false;
        });
    }
    //提交优惠券表单到服务器
    $scope.submit = function(){
        //防止网络不好造成的重复提交
        var currentDate = new Date().getTime();
        var dayMs = 24*60*60*1000;
        if($scope.deadlineDate.getTime()+dayMs <= currentDate){
            layer.msg('日期小于当天',{offset: '100px'});
            return;
        }
        $scope.submiting = true;
        var reqParam = {
            couponMoney: $scope.coupon.discount,
            username: $scope.selectedUser.name,
            userid: $scope.selectedUser.userid,
            commPhone: $scope.selectedUser.phone,
            overDate:$filter('date')($scope.deadlineDate, 'yyyy-MM-dd')
        }
        $myHttpService.post("api/buslinecoupon/insertBuslineCoupon",reqParam,function(data){
            //成功回调
            layer.msg(data.msg,{offset: '100px'});
            $state.go("app.coupon.edit",{},{reload:true});
        },function(){
             $scope.submiting = false;
        });
    }
    $scope.reset = function() {
        $state.go('app.coupon.edit',{},{reload: true});
        // $scope.selectedUser = null;
        // $scope.missParm = true;
    }
    //datepicker的配置
    $scope.deadlinetime = {
        opened:false,
        dateOptions:{
            datepickerMode:'day',
            // startTime: new Date(),
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
            $scope.deadlinetime.opened = true;
        }
    };
    $scope.useregtime = {
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
            $scope.useregtime.opened = true;
        }
    };
}]);