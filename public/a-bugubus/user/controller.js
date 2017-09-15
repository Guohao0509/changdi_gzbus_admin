/**
 * Created by 静静 on 2017/2/28.
 * 关于用户管理列表控制器
 */

app.controller('userListController',function($rootScope,$scope,$http,$state,$localStorage,$stateParams,$myHttpService,$tableListService,$modal){
    //全选
    // var selected = false;
    // $scope.selectAll = function(){
    //     selected = !selected;
    //     angular.forEach($scope.pageResponse.rows,function(item){
    //         item.selected = selected;
    //     });
    // }
    //搜索分页选项
    var options={
        searchFormId:'J_reg_form',
        listUrl:"api/user/queryUserListByKeword.htm"
    };
    $tableListService.init($scope, options);
    $tableListService.get();
    //查询注册时间
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

    //清空
    $scope.restData=function(){
        $scope.userid="";
        $scope.regDate="";
    };



    //清空
    //$scope.restData=function(){
    //    var $form=$("#restData").closest("form");
    //    var $data = $form.find("[type='text']");
    //    $data.each(function(){
    //        $(this).val("");
    //    })
    //}

    $scope.openUserDetailModal = function(userid){
        var Usermodel = $modal.open({
            templateUrl: 'a-bugubus/user/user_detasils.html',
            controller: 'UserDetailModalController',
            size: 'md',
            resolve: {
                userid: function () {
                    return userid;
                }
            }
        });
    }
});
/**
 * 用户详情弹窗控制器
 */
app.controller('UserDetailModalController', ['$scope', '$modalInstance', 'userid','$myHttpService',function($scope, $Usermodel , userid,$myHttpService) {
    //发起车票ID的查询请求
    $myHttpService.post("api/user/queryUserInfoByUsrId",{userid:userid},function(data){
        $scope.data = data;
    });
    //车票详情
    $scope.ok = function () {
        $Usermodel .close();
    };
}]);

