//优惠券列表控制器
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

//优惠券编辑控制器
app.controller('CouponEditController',['$scope','$myHttpService','$tableListService','$state','$filter',function($scope,$myHttpService,$tableListService,$state,$filter){
    //已选择的用户集合
    $scope.selectedUser = [];
    $tableListService.init($scope,{
        searchFormId:"J_search_form",
        listUrl:"api/user/queryUserListByKeword.htm",
        callback: function($scope,data){
            //重新请求数据时，勾选之前勾选过的用户选项
            for(var i = 0; i < data.rows.length; i++) {
                for(var j = 0; j < $scope.selectedUser.length; j++) {
                    if($scope.selectedUser[j].userid == data.rows[i].userid){
                        data.rows[i].checked = true;
                    }
                }
            }
        }
    });
    $tableListService.get();
    
    //在未选择用户时禁止提交
    //选择用户(单选)
    $scope.changeCheck = function(item) {
        //被选择的用户
        if(item.checked) {
            for(var i = 0; i < $scope.selectedUser.length; i++){
                if(item.userid == $scope.selectedUser[i].userid){
                    $scope.selectedUser.splice(i, 1);
                    item.checked = false;
                }
            }
        }else {
            item.checked = true;
            $scope.selectedUser.push(item);
        }
    }

    //提交所有用户
    $scope.selectAllUser = function() {
        $scope.submiting = true;
        var reqParm = {
            couponMoney: $scope.coupon.discount,
            overDate:$filter('date')($scope.deadlineDate, 'yyyy-MM-dd')
        }
        $myHttpService.post("api/buslinecoupon/insertBuslineCouponForAllUser",reqParm,function(data){
            //成功回调
            layer.msg(data.msg,{offset: '100px'});
            $state.go("app.coupon.edit",{},{reload:true});
        },function(){
             $scope.submiting = false;
        });
    }

    //提交单个或者多个用户优惠券表单到服务器
    $scope.submit = function(){
        var currentDate = new Date().getTime();
        var dayMs = 24*60*60*1000;
        if($scope.deadlineDate.getTime()+dayMs <= currentDate){
            layer.msg('日期小于当天',{offset: '100px'});
            return;
        }
        if($scope.selectedUser.length == 0){
            layer.msg('请添加用户',{offset: '100px'});
            return;
        }
        //防止网络不好造成的重复提交
        $scope.submiting = true;
        //构造data:[{},{}]
        for(var i = 0, buslineCoupons = []; i < $scope.selectedUser.length; i++) {
            buslineCoupons.push({
                couponMoney: $scope.coupon.discount,
                overDate:$filter('date')($scope.deadlineDate, 'yyyy-MM-dd'),
                username: $scope.selectedUser[i].name,
                userid: $scope.selectedUser[i].userid,
                commPhone: $scope.selectedUser[i].phone
            })
        }
        $myHttpService.post("api/buslinecoupon/insertBuslineCoupon",{data: JSON.stringify({buslineCoupons: buslineCoupons})},function(data){
            //成功回调
            layer.msg(data.msg,{offset: '100px'});
            $state.go("app.coupon.edit",{},{reload:true});
        },function(){
             $scope.submiting = false;
        });
    }
    
    //重新设置
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

    //用户的注册时间
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