/**
 * @author Guohao
 * @date 2016-8-11
 * @version 1.0.0 票据来源的控制器
 */
app.controller('sourceListController', ['$scope','$http','$myHttpService','$tableListService','$state', function($scope,$http,$myHttpService,$tableListService,$state) {
	var options={
        searchFormId:'J_search_form',
        listUrl:'api/ticketsource/queryTicketSourceListByKeyword',
    };
    $tableListService.init($scope, options);
    $tableListService.get();
    $scope.delete = function(ticketSourceId){
		layer.confirm('您确定要删除吗？', {icon: 3, title:'提示'},function(){
			var reqParam = {
				ticketSourceId: ticketSourceId
			}
            $myHttpService.post("api/ticketsource/deleteTicketSource",reqParam,function(){
                layer.msg("删除成功！",{offset: '100px'})
                $state.go("app.source.list",{},{reload: true});
            });
        },function(index){
            layer.close(index);
        });
	}
}])
app.controller('addTicketSourceController', ['$scope','$myHttpService', '$state','md5', '$stateParams',function($scope, $myHttpService, $state,md5,$stateParams) {
    $scope.area = ['qw','qw','wq'];
	$scope.editMode = !!$stateParams.id;//检测有没有ID，判断当前是添加还是编辑，共用一套模板
    $scope.sourcePwd = {}
    if($scope.editMode){//编辑模式
    	var reqParam = {
           	ticketSourceId: $stateParams.id
        };
        $myHttpService.post("api/ticketsource/queryTicketSource",reqParam,function(data){
            
        	$scope.source = {
        		ticketSource: data.ticketSource.ticketSource,
        		sourceUser: data.ticketSource.sourceUser,
        		sourcePhone: data.ticketSource.sourcePhone,
        		needSourceId: data.ticketSource.needSourceId == '1'?true:false
        	}
        },function(){
            $timeout(function(){
                $state.go('app.source.list');
            },3000)
        });
    }else{

    }
	$scope.submit  = function() {
		var reqParam = {
			ticketSource: $scope.source.ticketSource,
			sourceUser: $scope.source.sourceUser,
			sourcePhone: $scope.source.sourcePhone
		}
		if(!$scope.sourcePwd.sourcePass&&$scope.editMode){
		}else{
			reqParam.sourcePass = md5.createHash($scope.sourcePwd.sourcePass)
		}
		if(!$scope.source.needSourceId || $scope.source.needSourceId == 'false'){
			reqParam.needSourceId = '0';
		}else if($scope.source.needSourceId || $scope.source.needSourceId == 'true'){
			reqParam.needSourceId = '1';
        }
        console.log(reqParam)
		if($scope.editMode){
            reqParam.ticketSourceId = $stateParams.id;
            $myHttpService.post('api/ticketsource/updateTicketSource', reqParam, function(data){
                layer.msg(data.msg,{offset: '100px'});
                $state.go('app.source.list',{},{reload: true});
            }, function(){
            })
        }else{
            $myHttpService.post('api/ticketsource/insertTicketSource', reqParam, function(data){
                layer.msg(data.msg,{offset: '100px'});
                $state.go('app.source.add',{},{reload: true});
            }, function(){
            })
        }
	}
}])