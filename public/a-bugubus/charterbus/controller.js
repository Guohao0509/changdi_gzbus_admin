/**
 * Created by 静静 on 2017/4/12.
 * 包车管理
 */
app.controller('Charterbus',['$scope','$myHttpService','$modal','$tableListService','$state',function($scope,$myHttpService,$modal,$tableListService,$state){
    /*关于全选*/
    var selected = false;
    $scope.selectAll = function(){
        selected = !selected;
        angular.forEach($scope.pageResponse.rows,function(item){
            item.selected == selected;
        });

    };

    /*批量删除*/
    $scope.deleteRow=function(){
        //获取选中的行数据
        for(var i =0;i<$scope.pageResponse.rows.length;i++) {
            if ($scope.pageResponse.rows[i].selected) {
                //封装charterid
                $scope.deletechartid = {
                    charterid:$scope.pageResponse.rows[i].charterid
                };
                layer.confirm('您确定要删除选中的信息吗？', {icon: 3, title:'提示'}, function() {
                        //请求服务
                        $myHttpService.post('api/charterOrder/deleteCharterCase',{charterid: $scope.deletechartid.charterid},function(data){
                            layer.msg("删除成功！", {offset: '100px'});
                            $state.go("app.charterbus.operationadmin", {}, {reload: true});
                        });
                }, function(index){
                    layer.close(index);
                });
                return false;
            }else{layer.msg('请选择删除的信息')}
        }

    };

    /*选择项*/
    $scope.caseStatusname=['1','2','3','4','5','6','0'];
    $scope.selectname={
        1:'待审核',
        2:'审核失败',
        3:'未支付',
        4:'支付失败',
        5:'已支付',
        6:'已完成',
        0:'全部状态'
    };

    //搜索分页选项
    var options={
        searchFormId:'J_charter_form',
        listUrl:"api/charterOrder/queryChartersByAllKeyword"
    };
    $tableListService.init($scope, options);
    $tableListService.get();

    $scope.queryneedinfo={
        true:'是',
        false:'否'
    };

    /*关于时间组件设置*/
    $scope.charterStart = {
        opened:false,
        dateOptions:{
            datepickerMode:'day',
            showWeeks: false,
            minMode:'day'
        },
        format:"yyyy-MM-dd",
        clear:function(){
            $scope.charterStartTime = null;
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
            $scope.charterStart.opened = true;
        }
    };
    $scope.charterEnd = {
        opened:false,
        dateOptions:{
            datepickerMode:'day',
            showWeeks: false,
            minMode:'day'
        },
        format:"yyyy-MM-dd",
        clear:function(){
            $scope.charterEndTime = null;
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
            $scope.charterEnd.opened = true;
        }
    };

    /*参数*/
    $scope.charterlist={
        offset:0,
        pagesize:10
    };

    /*查询所有信息*/
    //$myHttpService.post('api/charterOrder/queryAllCharterCase',$scope.charterlist, function(data){
    //    /*接收用户信息*/
    //    $scope.querycharterlist=data;
    //});
    /*转行代驾类型*/


    /*详情窗口*/
    $scope.charterdetail=function(charterid){
        $modal.open({
            templateUrl: 'a-bugubus/charterbus/charter_detail.html',
            controller: 'charterdetail',
            size: 'md',
            resolve: {
                charterid: function () {
                    return charterid;
                }
            }
        });
    };

}]);

/*包车的用户详情窗口*/
app.controller('charterdetail',['$scope', '$modalInstance', 'charterid','$myHttpService',function($scope, $chartermodel,charterid,$myHttpService){
///*    /!*查询用户详情*!/
    $myHttpService.post('api/charterOrder/CharterCaseDetails',{charterid:charterid},function(data){
        $scope.data=data;
    });

    /*代驾转型*/
    $scope.userdetailneedinfo={
        true:'是',
        false:'否'
    };

    $scope.ok=function(){
        $chartermodel.close();
    };
}]);

/*包车编辑控制器*/
app.controller('charterbusEditController',['$scope','$myHttpService','$stateParams','$filter','$state',function($scope,$myHttpService,$stateParams,$filter,$state){
    $scope.editMode = !!$stateParams.charterid;//检测有没有ID，判断当前是添加还是编辑，共用一套模板
    if($scope.editMode) {//编辑模式
        $scope.charter = {
            charterid: $stateParams.charterid
        };
        /*获取包车详情信息*/
        $myHttpService.post('api/charterOrder/CharterCaseDetails',$scope.charter,function(data){
            $scope.charters=data;
            /*对类型进行转换*/
            $scope.charterinfo={
              true:'是',
              false:'否'
            };
            //时间格式进行转换
            $scope.chartertime={
                charterStartTime:$filter('date')($scope.charters.charterStartTime,'yyyy-MM-dd HH:mm'),
                charterEndTime:$filter('date')($scope.charters.charterEndTime,'yyyy-MM-dd HH:mm'),
            };

        });

    }
    /*提交表单到后台*/
    $scope.submit=function(){
        $scope.editmess={
            charterid:$scope.charters.charterid,
            startLocation:$scope.charters.startLocation,
            startLoLa:$scope.charters.startLoLa,
            endLocation:$scope.charters.endLocation,
            endLoLa:$scope.charters.endLoLa,
            charterType:$scope.charters.charterType,
            charterStartTime:$filter('date')($scope.charters.charterStartTime,'yyyy-MM-dd HH:mm'),
            charterEndTime:$filter('date')($scope.charters.charterEndTime,'yyyy-MM-dd HH:mm'),
            charterCount:$scope.charters.charterCount,
            needInfo:$scope.charters.needInfo,
            caseStatus:$scope.charters.caseStatus,
            totalfee:$scope.charters.totalfee,
            commName:$scope.charters.commName,
            commMobile:$scope.charters.commMobile,
            repInfo:$scope.charters.repInfo

        }
        $myHttpService.post('api/charterOrder/ModifyCharterCase',$scope.editmess,function(data){
            layer.msg("修改成功！",{offset: '100px'})
        })
    }

    $scope.delete=function(charters){
        layer.confirm('您确定要删除吗？', {icon: 3, title:'提示'},function(){
            $myHttpService.post("api/charterOrder/deleteCharterCase",{charterid:charters.charterid},function(){
                layer.msg("删除成功！",{offset: '100px'})
                $state.go("app.charterbus.operationadmin",{},{reload: true});
            });
        },function(index){
            layer.close(index);
        });
    }
}]);
