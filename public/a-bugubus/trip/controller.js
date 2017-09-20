app.controller('TripListController',['$scope', '$modal','$state','$http','$myHttpService','$tableListService', function($scope, $modal,$state,$http,$myHttpService,$tableListService) {
	var options = {
        searchFormId:"J_search_form",
        listUrl:"api/product/queryProductListByKeyword"
    };
    $tableListService.init($scope, options);
    $tableListService.get();
    //删除产品
	$scope.deleteProduct=function(productid) {
        layer.confirm('您确定要删除吗？', {icon: 3, title:'提示'},function(){
            $myHttpService.post("api/product/deleteProduct",{productid: productid},function(data){
            //成功回调
                layer.msg("删除成功！",{offset: '100px'});
                $state.go('app.trip.list', {} ,{reload: true})
            },function(){
                 $scope.submiting = false;
            });
        },function(index){
            layer.close(index);
        });
    }
    //打开产品详情，查看排班
	$scope.openDetailModal = function(productid, productType){
        var TripModel = $modal.open({
            templateUrl: 'a-bugubus/trip/detail.html',
            controller: 'tripDetailModalController',
            size: productType==0?'lg':'llg',
            resolve: {
                productid: function () {
                    return productid;
                }
            }
        });
    }
    $scope.openUserNoticeModal = function(notice){
        var Noticemodel = $modal.open({
            templateUrl: 'a-bugubus/trip/usernotice.html',
            controller: 'userNoticeController',
            size: 'md',
            resolve: {
                notice: function () {
                    return notice;
                }
            }
        });
    }
    $scope.openTripImageModal = function(photoPath) {
        var tripShowImageModel = $modal.open({
            templateUrl: 'a-bugubus/trip/showImage.html',
            controller: 'tripShowImageController',
            size: 'md',
            resolve: {
                imageUrl: function () {
                    return photoPath;
                }
            }
        });
    }
}]);
app.controller('tripShowImageController', ['$scope', '$modalInstance', 'imageUrl',function($scope, $tripShowImageModel, imageUrl) {
    $scope.imageUrl = imageUrl;
    $scope.ok = function () {
        $tripShowImageModel.close();
    };
}]);
app.controller('userNoticeController', ['$scope', '$modalInstance', 'notice',function($scope, $Noticemodel, notice) {
    $scope.productinfo = notice;
    $scope.ok = function () {
        $Noticemodel.close();
    };
}]);
app.controller('tripAddController',['$scope','$stateParams','$http','$myHttpService','$tableListService','$state',function($scope,$stateParams,$http,$myHttpService,$tableListService,$state) {
    //判断是否是编辑模式,共用一个模板
    var editMode = !!$stateParams.id;
    var tripApi = 'api/product/';
    $scope.product = {};
    $scope.goLineBs = [];
    $scope.backLineBs = [];
    if(editMode){//编辑模式
        //编辑模式下的接口
        tripApi += 'updateProduct';

        $myHttpService.post('api/product/queryProduct',{productid:$stateParams.id},function(data){
            console.log(data);
            //成功回调
            //判断是单程还是往返类型，初始化页面
            if(data.productinfo.productType == 0) {
                $scope.singleType();
            }else if(data.productinfo.productType == 1) {
                $scope.returnType();
            }
            //将提交和缺失参数禁止提交的功能打开
            $scope.submiting = false;
            $scope.missParam = false;
            //产品相关信息
            $scope.product = {
                isPush: data.productinfo.isPush == "true"? true: false,
                productType: data.productinfo.productType,
                viewaddress: data.productinfo.viewaddress,
                titleName: data.productinfo.titleName,
                photoPath: data.productinfo.photoPath
            }
            $scope.isPushOld = $scope.product.isPush.toString();
            //通过去程线路id，查找线路的详细信息
            $scope.queryBusline(data.productinfo.golineid, function(line) {
                $scope.goLine = {
                    lineid: data.productinfo.golineid,
                    linename: data.productinfo.golinename,
                    departaddr: line.busline.departaddr,
                    arriveaddr: line.busline.arriveaddr,
                    drivedistance: line.busline.drivedistance,
                    drivetime: line.busline.drivetime
                }
            })
            $scope.userNotice = data.productinfo.productinfo;
            //如果返程线路存在，查找返程线路的详细信息
            if(data.productinfo.backlineid){
                $scope.queryBusline(data.productinfo.backlineid, function(line) {
                    $scope.backLine = {
                        linename: data.productinfo.backlinename,
                        lineid: data.productinfo.backlineid,
                        departaddr: line.busline.departaddr,
                        arriveaddr: line.busline.arriveaddr,
                        drivedistance: line.busline.drivedistance,
                        drivetime: line.busline.drivetime
                    }
                })
            }
            if(data.productinfo.productType == 0){
                angular.forEach(data.productinfo.proSchedules, function(element, index) {
                    $scope.goLineBs.push(element.busSchedule);
                    // statements
                });
            }else if(data.productinfo.productType == 1){
                angular.forEach(data.productinfo.proSchedules, function(element, index) {
                    $scope.goLineBs.push(element.busSchedule);
                    $scope.backLineBs.push(element.busBackSchedule);
                    // statements
                });
            }
        },function(){
             $scope.submiting = false;
        });
    }else{//添加模式
        tripApi += 'insertProduct';
    }
    //初始化变量，用于判断是选择去程还是返程
    var selectLineType = null;
    //加载线路表
	$scope.loadTableService = function() {
		var options = {
	        searchFormId:"J_search_form",
	        listUrl:"api/busline/queryBuslineByKeyword.htm",
            callback: function(data){
            }
		};
	    $tableListService.init($scope, options);
	    $tableListService.get();
	}
    //加载线路详情
    $scope.queryBusline = function(lineid, callback) {
        $myHttpService.post('api/busline/queryBusline',{lineid: lineid},function(data){
            //成功回调
            callback&&callback(data);
        },function(){
            
        });
    }
    //切换是否显示线路表
	$scope.selectRouteToggle = function(lineType){
        $scope.routeEditMode = !$scope.routeEditMode;
        selectLineType = lineType;
        if($scope.routeEditMode){
        	$scope.loadTableService();
        }
    };
    //在未选择用户时禁止提交按钮
    $scope.missParam = true;
    //保存被选择的线路
    $scope.selectRoute = function(item) {
        //被选择的线路
        if(selectLineType == 'goLine') {
            if($scope.goLine&&$scope.goLine.lineid == item.lineid){
                $scope.routeEditMode = false;
                return;
            }
            if($scope.backLine&&($scope.backLine.lineid == item.lineid)){
                layer.msg('往返线路不能相同');
                $scope.routeEditMode = false;
                return;
            }
            $scope.goLine = item;
            $scope.goLineBs = [];
        }else if(selectLineType == 'backLine') {
            if($scope.backLine&&$scope.backLine.lineid == item.lineid){
                $scope.routeEditMode = false;
                return;
            }
            if($scope.goLine&&($scope.goLine.lineid == item.lineid)){
                layer.msg('往返线路不能相同');
                $scope.routeEditMode = false;
                return;
            }
            $scope.backLine = item;
            $scope.backLineBs = [];
        }
        $scope.routeEditMode = false;
        $scope.isShowSchedules = false;
        if($scope.goLine&&$scope.goLineType){
             $scope.missParam = false;
        }else if($scope.goLine&&$scope.backLine&&$scope.backLineType) {
             $scope.missParam = false;
        }
    }
    $scope.uploadByForm = function() {
        //用form 表单直接 构造formData 对象; 就不需要下面的append 方法来为表单进行赋值了。
        var formData = new FormData($("#myForm")[0]);
        var url = "files/image";
        $.ajax({
            url: url,
            type: 'POST',
            data: formData,
            //必须false才会避开jQuery对 formdata 的默认处理,XMLHttpRequest会对 formdata 进行正确的处理
            processData: false,
            //必须false才会自动加上正确的Content-Type
            contentType: false,
            success: function (data) {
                if(data.code == -1){
                    layer.msg('请选择图片格式(.jpg/.jpeg/.png)文件',{offset: '100px'});
                    return;
                }
                $scope.product.photoPath = data.newPath;
                $scope.sendImgUrl = data.newPath;
                $scope.$apply();
            },
            error: function (data) {
            }
        });
    }

    $scope.bindSchedule = function(lineType) {
        var lineid;
        if(lineType == 'goLineBs'){
            lineid = $scope.goLine.lineid;
        }else if(lineType == 'backLineBs'){
            lineid = $scope.backLine.lineid;
        }
        $scope.bsType = lineType;
        $myHttpService.post("api/product/queryBuslineScheduleByLineid",{lineid: lineid},function(data){
            $scope.buslineSchedules = data.buslineSchedules;
            $scope.isShowSchedules = true;
        });
    }

    $scope.selectSchedule = function(item) {
        $scope.isShowSchedules = false;
        var isSameBs = false;
        if($scope.goLineType){
            for(var k in $scope.goLineBs){
                if($scope.goLineBs[k].bsid == item.bsid){
                    layer.msg('请勿重复添加');
                    return;
                }
            }
        }
        if($scope.backLineType&&$scope.bsType == 'goLineBs'){
            var bindex = $scope.goLineBs.length;
            angular.forEach($scope.goLineBs,function(element, index) {
                // statements
                if(angular.equals(element,item)&&$scope.backLineBs[index]&&angular.equals($scope.backLineBs[index],$scope.backLineBs[bindex])){
                    return isSameBs = true;
                }
            });
        }else if($scope.backLineType&&$scope.bsType == 'backLineBs'){
            var gindex = $scope.backLineBs.length;
            angular.forEach($scope.backLineBs,function(element, index) {
                // statements
                if(angular.equals(element,item)&&$scope.goLineBs[index]&&angular.equals($scope.goLineBs[index],$scope.goLineBs[gindex])){
                    
                    return isSameBs = true;
                }
            });
        }
        if(isSameBs){
            layer.msg('请勿重复添加');
            return;
        }
        
        if($scope.bsType == 'goLineBs'){
            $scope.goLineBs.push(item);
        }else if($scope.bsType == 'backLineBs'){
            $scope.backLineBs.push(item);
        }
    }
    //提交优惠券表单到服务器
    $scope.submit = function(){
        //防止网络不好造成的重复提交
        $scope.submiting = true;
        //判断线路是否相等
        var isSame = angular.equals($scope.goLine, $scope.backLine);
        if(isSame){
            layer.msg('去程路线与返程路线不能一致',{offset: '100px'});
            return;
        }
        //判断往返排班是否一一对应
        if($scope.backLineType&&($scope.goLineBs.length != $scope.backLineBs.length)){
            layer.msg('请插入对应的往返排班',{offset: '100px'});
            return;
        }
        var reqParam = {
            productType: Number($scope.product.productType),
			golineid: $scope.goLine.lineid,
			golinename: $scope.goLine.linename,
            viewaddress: $scope.goLine.arriveaddr,
			region: 'test', //请求数据需要此参数，但目前没有实际意义
            productinfo: $scope.userNotice,
            titleName: $scope.product.titleName,
            hieone: $scope.product.photoPath,
            //测试
        }
        if($scope.sendImgUrl){
            reqParam.hieone = $scope.sendImgUrl;
        }
        if($scope.product.isPush == undefined || !$scope.product.isPush){
        	reqParam.isPush = 'false';
        }else {
            reqParam.isPush = 'true';
            if(!$scope.product.photoPath){
                layer.msg('请添加推荐图片');
                $scope.submiting = false;
                return;
            }
        }
        if($scope.backLineType) {
            reqParam.backlineid = $scope.backLine.lineid;
            reqParam.backlinename = $scope.backLine.linename;
        }
        if($stateParams.id){
            reqParam.productid = $stateParams.id;
        }
        if(editMode){
            reqParam.isPushOld = $scope.isPushOld;
        }
        var bsids = [];
        if($scope.goLineType){
            angular.forEach($scope.goLineBs, function(element, index) {
                bsids.push(element.bsid);
            });
        }else if($scope.backLineType){
            for(var i = 0; i < $scope.goLineBs.length; i++){
                bsids.push($scope.goLineBs[i].bsid+'&'+$scope.backLineBs[i].bsid);
            }
        }
        reqParam.bsids = bsids;
        console.log(reqParam)
        $myHttpService.post(tripApi,reqParam,function(data){
            //成功回调
            // var reqParam = {
            //     deleteImages: [$scope.sendImgUrl]
            // }
            // $scope.deleteImage(reqParam);
            layer.msg(data.msg,{offset: '100px'});
            if(editMode){
                $state.go('app.trip.list',{},{reload: true});
            }else {
                $state.go('app.trip.add',{},{reload: true});
            }
        },function(){
             $scope.submiting = false;
        });
    }
    // $scope.deleteImage = function(deleteImages){
    //     $myHttpService.post('files/deleteImage',deleteImages,function(data){
    //     },function(){
    //     });
    // };
    //重置按钮
    $scope.reset = function() {
    	// $scope.missParam = true;
    	// $scope.product = null;
     //    $scope.goLine = null;
     //    $scope.backLine = null;
     //    $scope.userNotice = null;
        $state.go('app.trip.add',{},{reload: true});
    }
    //选在单程按钮时初始化页面
    /*
        goLineType: 选择单程模式
        backLineType: 选择往返模式
        isShowSelectedTable: 是否显示被选择的线路的列表
    */
    $scope.returnType = function() {
        $scope.missParam = true;
        $scope.backLineType = true;
        $scope.goLineType = false;
        $scope.isShowSelectedTable = true;
        $scope.goLine = null;
        $scope.backLine = null;
        $scope.routeEditMode = false;
        $scope.goLineBs = [];
        $scope.backLineBs = [];
        $scope.buslineSchedules = [];
    }
    //选择往返按钮时，初始化页面
    $scope.singleType = function() {
        $scope.missParam = true;
    	$scope.goLineType = true;
        $scope.backLineType = false;
        $scope.isShowSelectedTable = true;
        $scope.goLine = null;
        $scope.backLine = null;
        $scope.routeEditMode = false;
        $scope.goLineBs = [];
        $scope.backLineBs = [];
        $scope.buslineSchedules = [];
    }
    $scope.deleteBs = function(index) {
        $scope.goLineBs.splice(index,1);
        if($scope.backLineType&&$scope.backLineBs){
            $scope.backLineBs.splice(index,1);
        }
    }
}])
app.controller('tripDetailModalController', ['$scope', '$modalInstance', 'productid','$myHttpService',function($scope, $TripModel , productid,$myHttpService) {
    $scope.ok = function () {
        $TripModel.close();
    };
    $scope.goLineBs = [];
    $scope.backLineBs = [];
    $myHttpService.post('api/product/queryProduct',{productid: productid},function(data){
        console.log(data);
        if(data.productinfo.productType == 0) {
            $scope.backLineType = true;
            $scope.backLineType = false;
        }else if(data.productinfo.productType == 1) {
           $scope.goLineType = true;
           $scope.backLineType = true;
        }
        //产品相关信息
        if(data.productinfo.productType == 0){
            angular.forEach(data.productinfo.proSchedules, function(element, index) {
                $scope.goLineBs.push(element.busSchedule);
                // statements
            });
        }else if(data.productinfo.productType == 1){
            angular.forEach(data.productinfo.proSchedules, function(element, index) {
                $scope.goLineBs.push(element.busSchedule);
                $scope.backLineBs.push(element.busBackSchedule);
                // statements
            });
        }
    },function(){
         $scope.submiting = false;
    });
}]);
app.controller('dailyScheduleController',['$scope','$modal','$http','$myHttpService','$stateParams','$state', function($scope,$modal,$http,$myHttpService,$stateParams,$state) {
    //日历时间的配置
    // var strStoreDate = window.localStorage? localStorage.getItem("guilvbus"): Cookie.read("guilvbus");
    $scope.init = function() {
        var today = new Date();
        var year = today.getFullYear();
        var month = today.getMonth()+1;
        var day = today.getDate();
        var date = year+'-'+month+'-'+day;
        $scope.departDate = date;
        $scope.loadScheduleTable(date,function(data){
            $scope.changedDate = [];
            $scope.dateSchedules = data.products;
            var schedulesDate = data.busScheduleChanges;
            for(var k = 0, dateHash = {}, len = schedulesDate.length; k < len; k++){
                var key = 'key' + schedulesDate[k].changeDate;
                if(!dateHash[key]){
                    dateHash[key] = schedulesDate[k].changeDate;
                }
            }
            for(var f in dateHash){
                $scope.changedDate.push(dateHash[f]);
            }
        })
    }
    $scope.selectedDate = function(departDate) {
        departDate = new Date(departDate);
        var year = departDate.getFullYear();
        var month = departDate.getMonth()+1;
        var day = departDate.getDate();
        var date = year+'-'+month+'-'+day;
        $scope.departDate = date;
        $scope.loadScheduleTable(date,function(data){
            $scope.dateSchedules = data.products;
        })
    }
    $scope.loadScheduleTable = function(date,callback) {
        $myHttpService.post('api/product/queryProductBusScheduleDetails',{departDate:date},function(data){
            callback&&callback(data);
            console.log(data);
        },function() {

        })
    }
    $scope.deleteSchedule = function(item) {
        layer.confirm('您确定要删除吗？', {icon: 3, title:'提示'},function(){
            var reqParam = {
                gobsid: item.gobsid,
                departDate: $scope.departDate,
                productid: item.productid,
                productType: item.productType
            }
            if(item.backlineid) {
                reqParam.backbsid = item.backbsid;
            }
            $myHttpService.post('api/product/deleteProductBusScheduleDetails',reqParam,function(data){
                //这里应该调用selectDate(),
                $state.go('app.trip.dailyschedule',{},{reload: true});
                $scope.selectedDate($scope.departDate);
            },function() {

            });
        },function(index){
            layer.close(index);
        });
        
    }
    $scope.openAddDailScheduleModal = function() {
        var AddDailScheduleModal = $modal.open({
            templateUrl: 'a-bugubus/trip/adddailyschedule.html',
            controller: 'addDailScheduleController',
            size: 'llg',
            resolve: {
                departDate: function () {
                    return $scope.departDate;
                }
            }
        });
    }
    $scope.init();
    // if($stateParams.departDate){
    //     console.log($stateParams.departDate)
    //     $scope.departDate = $stateParams.departDate;
    // }
}]);
app.controller('addDailScheduleController', ['$scope', '$modalInstance', 'departDate','$myHttpService','$tableListService','$state',function($scope, $AddDailScheduleModal, departDate,$myHttpService,$tableListService,$state) {
    $scope.dailySchedule = {};
    $scope.dailySchedule.departDate = departDate;
    $scope.routeEditMode = false;
    $scope.close = function () {
        $AddDailScheduleModal.close();
    };
    var selectLineType = null;
    //加载线路表
    var options = {
        searchFormId:"J_search_form",
        listUrl:"api/buslineSchedule/queryBuslineScheduleByKeyword.htm",
    };
    $tableListService.init($scope, options);
    $tableListService.get();
    $scope.loadTableService = function() {
        var options = {
            searchFormId:"J_search_form",
            listUrl:"api/buslineSchedule/queryBuslineScheduleByKeyword.htm",
            callback: function(scope,data){
                console.log(data);
            }
        };
        $tableListService.init($scope, options);
        $tableListService.get();
    }
    //切换是否显示线路表
    $scope.selectRouteToggle = function(lineType){
        $scope.routeEditMode = !$scope.routeEditMode;
        selectLineType = lineType;
        if($scope.routeEditMode){
            $scope.loadTableService();
        }
    };
    //在未选择用户时禁止提交按钮
    $scope.missParam = true;
    //保存被选择的线路
    $scope.selectRoute = function(item) {
        //被选择的线路
        if(selectLineType == 'goLine') {
            $scope.goLine = item;
        }else if(selectLineType == 'backLine') {
            $scope.backLine = item;

        }
        $scope.routeEditMode = false;
        if($scope.goLine&&$scope.goLineType){
             $scope.missParam = false;
        }else if($scope.backLine&&$scope.backLineType) {
             $scope.missParam = false;
        }
    };

    $scope.submit = function(){
        //防止网络不好造成的重复提交
        $scope.submiting = true;
        var reqParam = {
            departDate: $scope.dailySchedule.departDate,
            gobsid: $scope.goLine.bsid,
            productType: Number($scope.product.productType)
        }
        if($scope.backLineType) {
            reqParam.backbsid = $scope.backLine.bsid;
        }
        $myHttpService.post('api/product/addProductBusScheduleDetails',reqParam,function(data){
            //成功回调
            layer.msg(data.msg,{offset: '100px'});
            $AddDailScheduleModal.close();
            // if (window.localStorage) {
            //     localStorage.setItem("guilvbus", $scope.dailySchedule.departDate);  
            // } else {
            //     Cookie.write("guilvbus", $scope.dailySchedule.departDate);  
            // }
            $state.go('app.trip.dailyschedule',{departDate:departDate},{reload: true});
        },function(){
            $scope.submiting = false;
        });
    };
    //重置按钮
    $scope.reset = function() {
        $scope.missParam = true;
        $scope.product = null;
        $scope.goLine = null;
        $scope.backLine = null;
    };
    //选在单程按钮时初始化页面
    /*
        goLineType: 选择单程模式
        backLineType: 选择往返模式
        $scope.isShowSelectedSchedule: 是否显示被选择的排班的列表
    */
    $scope.returnType = function() {
        $scope.missParam = true;
        $scope.backLineType = true;
        $scope.goLineType = false;
        $scope.goLine = null;
        $scope.backLine = null;
        $scope.isShowSelectedSchedule = true;
    };
    //选择往返按钮时，初始化页面
    $scope.singleType = function() {
        $scope.missParam = true;
        $scope.goLineType = true;
        $scope.backLineType = false;
        $scope.goLine = null;
        $scope.backLine = null;
        $scope.isShowSelectedSchedule = true;
    };
}]);