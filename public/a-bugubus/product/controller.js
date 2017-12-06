app.controller('TripListController',['$scope', '$modal','$state','$http','$myHttpService','$tableListService', function($scope, $modal,$state,$http,$myHttpService,$tableListService) {
    var options = {
        searchFormId:"J_search_form",
        listUrl:"api/product/queryProductListByKeyword",
        callback: function(data){
            console.log(data)
        }
    };
    $tableListService.init($scope, options);
    $tableListService.get();
    console.log($scope);
    //删除产品
    $scope.deleteProduct=function(productid) {
        layer.confirm('您确定要删除吗？', {icon: 3, title:'提示'},function(){
            $myHttpService.post("api/product/deleteProduct",{productid: productid},function(data){
            //成功回调
                layer.msg("删除成功！",{offset: '100px'});
                $state.go('app.product.list', {} ,{reload: true});
            },function(){
                 $scope.submiting = false;
            });
        },function(index){
            layer.close(index);
        });
    }
    //打开产品详情，查看排班
    $scope.openDetailModal = function(proDetails){
        var TripModel = $modal.open({
            templateUrl: 'a-bugubus/product/detail.html',
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
    $scope.view = {};
    $scope.view.view = {};
    $scope.goLine = {linename:1};
    $scope.backLine = {linename:2};
    var tripApi = 'api/product/';
    $scope.product = {};
    if(editMode){//编辑模式
        //编辑模式下的接口
        tripApi += 'updateProduct';
        console.log($stateParams.id)
        $myHttpService.post('api/product/queryProduct',{productid:$stateParams.id},function(data){
            if(data.product.plans){
                $scope.combine_car = true;
                for(var i = 0; i < data.product.plans.length; i ++){
                    if(data.product.plans[i].sequence == 0){
                        $scope.goLine = angular.copy(data.product.plans[i]);
                    }else if(data.product.plans[i].sequence == 1){
                        $scope.backLine = data.product.plans[i];
                    }
                }
            }
            if(data.product.viewInfo){
                $scope.combine_view = true;
            }
            $scope.view.view = data.product.viewInfo;
            
            //成功回调
            //判断是单程还是往返类型，初始化页面
            console.log(data.product.plans.length)
            if(data.product.plans.length == 1) {
                $scope.singleType();
            }else if(data.product.plans.length == 2) {
                $scope.returnType();
            }
            
            //将提交和缺失参数禁止提交的功能打开
            $scope.submiting = false;
            $scope.missParam = false;
            //产品相关信息
            $scope.product = {
                isPush: data.product.isPush == "true"? true: false,
                productType: data.product.productType,
                viewaddress: data.product.viewaddress,
                titleName: data.product.titleName,
                photoPath: data.product.photoPath,
                keyWordTitle: data.product.viewaddress.split('&')[0],
                keyWordInfo: data.product.viewaddress.split('&')[1]
            }
            $scope.isPushOld = $scope.product.isPush.toString();
            //通过去程线路id，查找线路的详细信息
            
            $scope.userNotice = data.product.productinfo;
            //如果返程线路存在，查找返程线路的详细信息
            
            
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
    
    //切换是否显示线路表
    $scope.selectRouteToggle = function(lineType){
        $scope.routeEditMode = !$scope.routeEditMode;
        selectLineType = lineType;
        if($scope.routeEditMode){
            $scope.loadTableService();
        }
    };
    //是否加载显示景区列表
    $scope.queryView = function() {
        $scope.showViewTable = true;
        var options = {
            searchFormId:"View_search_form",
            listUrl:"api/viewinfo/queryViewInfoListByKeyword",
            callback: function(data,scope){
                console.log(data)
                console.log(scope)
            }
        };
        $tableListService.init($scope, options);
        $tableListService.get();
    }
    //关闭景区列表的显示
    $scope.closeViewTable = function() {
        $scope.showViewTable = false;
    }
    //选择景区并绑定给产品
    $scope.selectView = function(view) {
        console.log(view);
        $scope.view.view = view;
        $scope.closeViewTable();
    }
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

    //提交产品单到服务器
    $scope.submit = function(){
        //防止网络不好造成的重复提交
        $scope.submiting = true;
        //判断线路是否相等
        
        //判断往返排班是否一一对应
        var reqParam = {
            productType: $scope.product.productType,
            viewaddress: $scope.product.keyWordTitle+'&'+$scope.product.keyWordInfo,//这里需要的是景区name
            region: '贵阳', //请求数据需要此参数，但目前没有实际意义
            productinfo: $scope.userNotice,
            titleName: $scope.product.titleName,
            photoPath: $scope.product.photoPath
            //测试
        }
        
        if($scope.sendImgUrl){
            reqParam.hieone = $scope.sendImgUrl;
        }
        if($scope.product.isPush == undefined || !$scope.product.isPush){
            reqParam.isPush = 'false';
        }else {
            reqParam.isPush = 'true';
        }
        if(reqParam.isPush == 'true'&&!$scope.product.photoPath){
                layer.msg('请添加推荐图片');
                $scope.submiting = false;
                return;
            }
        if($stateParams.id){
            reqParam.productid = $stateParams.id;
        }
        if(editMode){
            reqParam.isPushOld = $scope.isPushOld;
        }
        
        
        if($scope.combine_view){
            reqParam.viewid = $scope.view.view.viewid
        }
        if($scope.combine_car){
            var isSame = angular.equals($scope.goLine, $scope.backLine);
            if(isSame){
                layer.msg('去程路线与返程路线不能一致',{offset: '100px'});
                return;
            }
            if($scope.goLineType){
                reqParam.lineids = $scope.goLine.lineid;
            }else if($scope.backLineType){
                reqParam.lineids = $scope.goLine.lineid+'&'+$scope.backLine.lineid;
            }
        }
        console.log(reqParam)
        $myHttpService.post(tripApi,reqParam,function(data){
            //成功回调
            // var reqParam = {
            //     deleteImages: [$scope.sendImgUrl]
            // }
            // $scope.deleteImage(reqParam);
            layer.msg(data.msg,{offset: '100px'});
            if(editMode){
                $state.go('app.product.list',{},{reload: true});
            }else {
                $state.go('app.product.add',{},{reload: true});
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
        $scope.goCarType = false
        $scope.backCarType = true
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
        $scope.goCarType = true
        $scope.backCarType = false
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
app.controller('evaluationController', ['$scope','$myHttpService','$tableListService','$modal',function($scope, $myHttpService,$tableListService,$modal) {
    
    var options = {
        searchFormId:"View_search_form",
        listUrl:"api/product/queryBuslineHierarchyByKeyword",
        callback: function(data,scope){
            console.log(data.pageResponse.buslineHierarchys)
            angular.forEach(data.pageResponse.buslineHierarchys, function(item, index){
                console.log(item)
                if(item.isShow=='true'){
                    item.isShow = true;
                    console.log(123)
                }else if(item.isShow == 'false'){
                    item.isShow = false;
                }
            })
        }
    };
    $tableListService.init($scope, options);
    $tableListService.get();

    $scope.openCarorderImageModal = function(images){
        var showImageModel = $modal.open({
            templateUrl: 'a-bugubus/product/showImage.html',
            controller: 'carorderShowImageController',
            size: 'md',
            resolve: {
                imageUrls: function () {
                    return images;
                }
            }
        });
    }
    $scope.isShow = function(hieid, isShow) {
        console.log(hieid, isShow)
        $myHttpService.post('api/product/updateProductOrderShow',{hieid:hieid,isShow: isShow},function(data) {
            if(data.code == 0) {
                layer.msg("修改成功",{offset: '100px'});
            }
        })
    }
}]);
app.controller('carorderShowImageController', ['$scope', '$modalInstance', 'imageUrls',function($scope, $showImageModel, imageUrls) {

    $scope.imgUrls = imageUrls;
    $scope.ok = function () {
        $showImageModel.close();
    };
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
            console.log(data)
            $scope.changedDate = [];
            $scope.dateSchedules = data.busDetails;
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
            $scope.dateSchedules = data.busDetails;
        })
    }
    $scope.loadScheduleTable = function(date,callback) {
        console.log(date);
        $myHttpService.post('api/product/queryProductBusScheduleDetails',{departDate:date},function(data){
            console.log(data)
            callback&&callback(data);
        },function() {

        })
    }
    $scope.deleteSchedule = function(item) {
        console.log(item);
        layer.confirm('您确定要删除吗？', {icon: 3, title:'提示'},function(){
            var reqParam = {
                bsid: item.bsid,
                departDate: $scope.departDate,
               
            }
            console.log(reqParam)
            $myHttpService.post('api/product/deleteProductBusScheduleDetails',reqParam,function(data){
                //这里应该调用selectDate(),
                $state.go('app.product.dailyschedule',{},{reload: true});
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
                departDate: function() {
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
    $scope.view = {};
    $scope.view.view = {};
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
    $scope.queryView = function() {
        $scope.showViewTable = true;
        var options = {
            searchFormId:"View_search_form",
            listUrl:"api/viewinfo/queryViewInfoListByKeyword",
            callback: function(data,scope){
                console.log(data)
                console.log(scope)
            }
        };
        $tableListService.init($scope, options);
        $tableListService.get();
    }
    //关闭景区列表的显示
    $scope.closeViewTable = function() {
        $scope.showViewTable = false;
    }
    //选择景区并绑定给产品
    $scope.selectView = function(view) {
        $scope.view.view = view;
        $scope.closeViewTable();
    }
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
        if($scope.view.haveViewTicket) {
            reqParam.haveTicket = 1;
            reqParam.viewid = $scope.view.view.viewid;
        }else {
            reqParam.haveTicket = 0;
        }
        console.log(reqParam);
        $myHttpService.post('api/product/addProductBusScheduleDetails',reqParam,function(data){
            //成功回调
            layer.msg(data.msg,{offset: '100px'});
            $AddDailScheduleModal.close();
            // if (window.localStorage) {
            //     localStorage.setItem("guilvbus", $scope.dailySchedule.departDate);  
            // } else {
            //     Cookie.write("guilvbus", $scope.dailySchedule.departDate);  
            // }
            $state.go('app.product.dailyschedule',{departDate:departDate},{reload: true});
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
}])
app.controller('uploadImageController',['$rootScope','$scope','$http','$state','$stateParams','$myHttpService',function($rootScope,$scope,$http,$state,$stateParams,$myHttpService){
    $scope.imgUrls = [];
    $scope.sendImgUrls = [];
    $scope.isLoadImage = false;
    $scope.uploadByForm = function(callback) {
        if($scope.imgUrls.length > 3){
            layer.msg("最多添加3张！",{offset: '100px'});
            return 
        }
        //用form 表单直接 构造formData 对象; 就不需要下面的append 方法来为表单进行赋值了。
        var formData = new FormData($("#myForm")[0]);
        // var host = "192.168.5.183:4000";
        var file = document.getElementById("file_upload").files[0]
        if(file.type.indexOf('image/') == -1){
            layer.msg('上传的文件类型必须是png、jpg或jpeg图片');
            return;
        }
        if(file.size > 1024*1000){
            layer.msg('上传的图片必须小于1M')
            return;
        }
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
                console.log('upLoad')
                $scope.isLoadImage = true;
                $scope.sendImgUrls.push(data.newPath);
                // var tmpArr = data.newPath.split('/');
                // tmpArr[2] = host;
                // var tmpStr = tmpArr.join('/');
                // console.log(tmpStr)
                $scope.imgUrls.push(data.newPath);
                $scope.$apply();
            },
            error: function (data) {
            }
        });
    }
    $scope.submit = function () {
        var reqParam = {
            hieid: $stateParams.id,
        }
        if($scope.sendImgUrls[0]){
            reqParam.hieone = $scope.sendImgUrls[0];
        }
        if($scope.sendImgUrls[1]){
            reqParam.hietwo = $scope.sendImgUrls[1];
        }
        if($scope.sendImgUrls[2]){
            reqParam.hiethree = $scope.sendImgUrls[2];
        }
        console.log(reqParam)
        $myHttpService.post('api/product/updateOrderPhoto',reqParam, function(data){
            layer.msg("添加成功！",{offset: '100px'})
            // var reqParam = {
            //     deleteImages: $scope.sendImgUrls
            // }
            // $scope.deleteImage(reqParam);
            $state.go('app.product.evaluation',{},{reload: true});
        })
    }
}]);