/**
 * @author Guohao
 * @date 2016-10-18
 * @version 1.0.0
 * @descriptions 景区管理的控制器
 */
app.controller('ViewListController',['$scope','$http','$state','$myHttpService','$tableListService','$modal',function($scope,$http,$state,$myHttpService,$tableListService,$modal){
	var options = {
        searchFormId:"J_search_form",
        listUrl:"api/viewinfo/queryViewInfoListByKeyword",
        callback: function(data,scope){
            console.log(data)
            console.log(scope)
        }
    };
    $tableListService.init($scope, options);
    $tableListService.get();
    console.log($scope)
     $scope.delete=function(itemid){
        console.log(itemid)
            layer.confirm('您确定要删除吗？', {icon: 3, title:'提示'},function(){
                $myHttpService.post("api/viewinfo/deleteViewInfo",{viewid: itemid},function(){
                    layer.msg("删除成功！",{offset: '100px'})
                    $state.go("app.view.list",{},{reload: true});
                });
            },function(index){
                layer.close(index);
            });
        }
	$scope.openViewPriceModel = function(viewPrices){
        var ViewPriceModel = $modal.open({
            templateUrl: 'a-bugubus/view/price_detail.html',
            controller: 'ViewPriceController',
            size: 'md',
            resolve: {
                viewPrices: function () {
                    return viewPrices;
                }
            }
        });
    }
    $scope.openViewUserModel = function(notice){
        var ViewUserModel = $modal.open({
            templateUrl: 'a-bugubus/view/view_user.html',
            controller: 'ViewUserController',
            size: 'md',
            resolve: {
                notice: function () {
                    return notice;
                }
            }
        });
    }
    $scope.openImageModal = function(itemInfo) {
        var showImageModel = $modal.open({
            templateUrl: 'a-bugubus/view/showImage.html',
            controller: 'showImageController',
            size: 'md',
            resolve: {
                itemInfo: function () {
                    return JSON.stringify(itemInfo);
                }
            }
        });
    }
    $scope.openAdminModal = function(admin) {
        var showAdminModel = $modal.open({
            templateUrl: 'a-bugubus/view/admin.html',
            controller: 'showAdminController',
            size: 'md',
            resolve: {
                admin: function () {
                    return admin;
                }
            }
        });
    }
}]);
app.controller('ViewPriceController', ['$scope', '$modalInstance', 'viewPrices',function($scope, $ViewUserModel, viewPrices) {
    $scope.viewPrices = viewPrices;
    $scope.ok = function () {
        $ViewUserModel.close();
    };
}]);
app.controller('ViewAddController',['$scope','$http','$state','$myHttpService','$stateParams','md5',function($scope,$http,$state,$myHttpService,$stateParams,md5){
	$scope.editMode = !!$stateParams.id;//检测有没有ID，判断当前是添加还是编辑，共用一套模板
	$scope.view = {};
	$scope.ticketType = [];
	$scope.display = {};
    //为啥直接绑定一个变量不能生效，这个得查一下
	$scope.tmpAddtion = {};
	$scope.tmpAddtion.type = '';
	$scope.tmpAddtion.discount = '';
	$scope.tmpAddtion.price = '';
    $scope.tmpAddtion.access = '';
    $scope.tmpAddtion.password = '';
    $scope.tmpAddtion.userPhone = '';
	$scope.display.viewTicketType = false;
    $scope.admin = [];
    $scope.uploadByForm = function() {
        //用form 表单直接 构造formData 对象; 就不需要下面的append 方法来为表单进行赋值了。
        var formData = new FormData($("#myForm")[0]);
        console.log('formData',formData);
        var url = "files/image";
        var file = document.getElementById("file_upload").files[0]
        if(file.type.indexOf('image/') == -1){
            layer.msg('上传的文件类型必须是png、jpg或jpeg图片');
            return;
        }
        if(file.size > 1024*1000){
            layer.msg('上传的图片必须小于1M')
            return;
        }
        $.ajax({
            url: url,
            type: 'POST',
            data: formData,
            //必须false才会避开jQuery对 formdata 的默认处理,XMLHttpRequest会对 formdata 进行正确的处理
            processData: false,
            //浏览器会自动加上正确的必须false才会自动加上正确的Content-Type
            contentType: false,
            success: function (data) {
                console.log(data);
                if(data.code == -1){
                    layer.msg('请选择图片格式(.jpg/.jpeg/.png)文件',{offset: '100px'});
                    return;
                }
                $scope.view.viewUrl = data.newPath;
                $scope.$apply();
            },
            error: function (data) {
            }
        });
    }
    //添加门票类型
    $scope.addViewticketType = function(){
        $scope.display.viewTicketType = true;
    }
    
    //确定添加门票
    $scope.ensureAddViewTicket = function() {
        console.log($scope.tmpAddtion)
        if(!$scope.tmpAddtion.discount || $scope.tmpAddtion.discount > 1 || $scope.tmpAddtion.discount < 0 || !$scope.tmpAddtion.type|| !$scope.tmpAddtion.price){
            layer.msg('请输入正确的票价类型');
            return;
        }
        $scope.ticketType.push({
            viewPriceType: $scope.tmpAddtion.type,
            viewCoupon: $scope.tmpAddtion.discount,
            viewPrice: $scope.tmpAddtion.price
        })
        $scope.tmpAddtion.type = '';
        $scope.tmpAddtion.discount = '';
        $scope.tmpAddtion.price = '';
        $scope.display.viewTicketType = false;
    }
    //删除票类型
    $scope.deleteType = function(index) {
        $scope.ticketType.splice(index, 1);
    }
    //添加账号
    $scope.addViewAccess = function(){
        $scope.display.addViewAccess = true;
    }
    //取消添加门票类型和账号 type?addViewAccess:viewTicketType
     $scope.cancel = function(type){
        $scope.display[type] = false;
        switch (type) {
            case 'addViewAccess':
                $scope.tmpAddtion.password = '';
                $scope.tmpAddtion.userPhone = '';
                $scope.tmpAddtion.access = '';
                break;
            default:
                $scope.tmpAddtion.type = '';
                $scope.tmpAddtion.discount = '';
                $scope.tmpAddtion.price = '';
                break;
        }
    }
    //确定添加账号
    $scope.ensureAddAccess = function() {
        $scope.admin.push({
            viewPass: md5.createHash($scope.tmpAddtion.password),
            phone: $scope.tmpAddtion.userPhone,
            viewUser: $scope.tmpAddtion.access
        })
        $scope.tmpAddtion.password = '';
        $scope.tmpAddtion.userPhone = '';
        $scope.tmpAddtion.access = '';
        $scope.display.addViewAccess = false;
    }
    //删除账号
    $scope.deleteAccess = function(index) {
        $scope.admin.splice(index, 1);
    }
    if($scope.editMode){//编辑模式
        $scope.view = {
            viewid:$stateParams.id
        };
        //获取司机内容
        $myHttpService.post("api/viewinfo/queryViewInfo",$scope.view,function(data){
            console.log(data);
            $scope.view = data.viewInfo;
            $scope.ticketType = data.viewPrices;
            $scope.admin = data.viewAdmins;
        },function(){
            $timeout(function(){
                $state.go('app.view.list');
            },3000);
        });
        $scope.submit = function(){
            //提交表单到服务器地址
            if( $scope.viewPass){
                $scope.admin.viewPass = md5.createHash($scope.viewPass);
            }
            var reqParam = {
                viewinfo: $scope.view,
                viewPrices: $scope.ticketType,
                viewAdmins: $scope.admin
            }
            if(reqParam.viewPrices.length <= 0 ){
                layer.msg('请添加门票类型');
                return;
            }
            $myHttpService.post("api/viewinfo/updateViewInfo",{data: JSON.stringify(reqParam)},function(data){
                $state.go('app.view.list',{},{reload: true});
                console.log(data);
            });
        }
    }else{ //添加模式
     	
        $scope.submit = function(){
            //提交表单到服务器地址
            var reqParam = {
				viewinfo: $scope.view,
				viewPrices: $scope.ticketType,
				viewAdmins: $scope.admin
            }
            if(reqParam.viewPrices.length <= 0 ){
                layer.msg('请添加门票类型');
                return;
            }
            console.log(JSON.stringify(reqParam));
            $myHttpService.post("api/viewinfo/insertViewInfo",{data: JSON.stringify(reqParam)},function(data){
                 $state.go('app.view.add', {} ,{reload: true});
            	console.log(data);
            });
        }
    }
}]);
app.controller('showAdminController',['$scope','$http','$state','$myHttpService','$modalInstance','admin',function($scope,$http,$state,$myHttpService,$showAdminModel,admin){
    $scope.admin = admin;
    $scope.ok = function () {
        $showAdminModel.close();
    };
}]);
app.controller('ViewUserController',['$scope','$http','$state','$myHttpService','notice','$modalInstance',function($scope,$http,$state,$myHttpService,notice,$ViewUserModel){
    $scope.notice = notice;
    $scope.ok = function () {
        $ViewUserModel.close();
    };
}]);
app.controller('showImageController', ['$scope', '$modalInstance', 'itemInfo',function($scope, $showImageModel, itemInfo) {
    $scope.itemInfo = JSON.parse(itemInfo);
    console.log($scope.itemInfo)
    $scope.ok = function () {
        $showImageModel.close();
    };
}]);