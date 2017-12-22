app.controller('uploadImageController',['$rootScope','$scope','$http','$state','$stateParams','$myHttpService',function($rootScope,$scope,$http,$state,$stateParams,$myHttpService){
    $scope.imgUrls = [];
    $scope.sendImgUrls = [];
    $scope.isLoadImage = false;
    $myHttpService.post
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
                $scope.isLoadImage = true;
                $scope.sendImgUrls.push(data.newPath);
                // var tmpArr = data.newPath.split('/');
                // tmpArr[2] = host;
                // var tmpStr = tmpArr.join('/');
                // 
                $scope.imgUrls.push(data.newPath);
                $scope.$apply();
            },
            error: function (data) {
            }
        });
    }
    $scope.submit = function () {
        var reqParam = {
            viewOrderid: $stateParams.id,
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
        $myHttpService.post('api/vieworder/updateViewOrderPhoto',reqParam, function(data){
            layer.msg("添加成功！",{offset: '100px'})
            // var reqParam = {
            //     deleteImages: $scope.sendImgUrls
            // }
            // $scope.deleteImage(reqParam);
            $state.go('app.carorder.list',{},{reload: true});
        })
    }
    // $scope.deleteImage = function(deleteImages){
    //     $myHttpService.post('files/deleteImage',deleteImages,function(data){
    //     },function(){
    //     });
    // };
    $scope.ticket = [
        {
            "viewOrderid": "2017121708330294812992",
            "username": "超级管理",
            "drivername": "郑俊业",
            "linename": "贵州饭店-息烽温泉",
            "departDate": 1513440000000,
            "departTime": "10:00",
            "price": 49,
            "payPrice": 49,
            "viewOrderStatus": 2,
            "haveCoupon": "false",
            "userid": "2017001001001001001001",
            "bsid": "2017120516161993789178",
            "barcode": "791217083302653185",
            "ticketSource": "携程",
            "platenum": "贵A25653",
            "departaddr": "贵州饭店景区直通车",
            "arriveaddr": "息烽温泉",
            "drivetime": 120,
            "carid": "2017120516124231210413",
            "sourceid": "4989661122",
            "departName": "贵州饭店",
            "arriveName": "息烽温泉",
            "sourcePhone": "15001928066",
            "lineid": "2017120516140110687149",
            "ticketSourceId": "携程",
            "haveTicket": 0,
            "ticketRele": "0465433743",
            "bdidType": 0,
            "needSourceId": "1",
            "sourceName": " 携程",
            "name": "张鹏飞",
            "createTime": 1513470783000,
            "phone": "18336079430",
            "ticketCode": "791217083302653186"
        },
        {
            "viewOrderid": "2017121708330294812992",
            "username": "超级管理",
            "drivername": "郑俊业",
            "linename": "贵州饭店-息烽温泉",
            "departDate": 1513440000000,
            "departTime": "10:00",
            "price": 49,
            "payPrice": 49,
            "viewOrderStatus": 2,
            "haveCoupon": "false",
            "userid": "2017001001001001001001",
            "bsid": "2017120516161993789178",
            "barcode": "791217083302653186",
            "ticketSource": "携程",
            "platenum": "贵A25653",
            "departaddr": "贵州饭店景区直通车",
            "arriveaddr": "息烽温泉",
            "drivetime": 120,
            "carid": "2017120516124231210413",
            "sourceid": "4989661122",
            "departName": "贵州饭店",
            "arriveName": "息烽温泉",
            "sourcePhone": "15001928066",
            "lineid": "2017120516140110687149",
            "ticketSourceId": "携程",
            "haveTicket": 0,
            "ticketRele": "0465433743",
            "bdidType": 0,
            "needSourceId": "1",
            "sourceName": " 携程",
            "name": "张鹏飞",
            "createTime": 1513470783000,
            "phone": "18336079430",
            "ticketCode": "791217083302653187"
        },
        {
            "viewOrderid": "2017121708330294812992",
            "username": "超级管理",
            "drivername": "郑俊业",
            "linename": "贵州饭店-息烽温泉",
            "departDate": 1513440000000,
            "departTime": "10:00",
            "price": 49,
            "payPrice": 49,
            "viewOrderStatus": 2,
            "haveCoupon": "false",
            "userid": "2017001001001001001001",
            "bsid": "2017120516161993789178",
            "barcode": "791217083302653187",
            "ticketSource": "携程",
            "platenum": "贵A25653",
            "departaddr": "贵州饭店景区直通车",
            "arriveaddr": "息烽温泉",
            "drivetime": 120,
            "carid": "2017120516124231210413",
            "sourceid": "4989661122",
            "departName": "贵州饭店",
            "arriveName": "息烽温泉",
            "sourcePhone": "15001928066",
            "lineid": "2017120516140110687149",
            "ticketSourceId": "携程",
            "haveTicket": 0,
            "ticketRele": "0465433743",
            "bdidType": 0,
            "needSourceId": "1",
            "sourceName": " 携程",
            "name": "张鹏飞",
            "createTime": 1513470783000,
            "phone": "18336079430",
            "ticketCode": "791217083302653188"
        }
    ]
}]);