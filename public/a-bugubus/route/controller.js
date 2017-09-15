/**
 * @author 周快
 * @date 2016-10-09
 * @version 1.0.0
 * @descriptions 线路管理的控制器
 */
app.controller('RouteEditController',function($compile,$rootScope,$scope,$http,$state,$localStorage,$stateParams,$filter,$myHttpService){
    $scope.editMode = !!$stateParams.id;
    $scope.address = {};
    var $sortable = $("#J_sortable").sortable();
    var saveDataOld={};
    if($scope.editMode){
        $scope.buslineStations=[]
        //编辑模式
        $myHttpService.post("api/busline/queryBusline.htm",{"lineid":$stateParams.id},function(data){
            var tmpData = {
                busline: data.busline,
                stations: data.stations
            }
            saveDataOld = angular.copy(tmpData);
            $scope.busline = data.busline;
            var stations = data.stations;
            for(var i = 0;i<stations.length;i++){
                $scope.buslineStations.push({
                    lineid:stations[i].lineid,
                    stationId:stations[i].stationid,
                    stationName:stations[i].stationname,
                    lng:stations[i].stalongitude,
                    lat:stations[i].stalatitude,
                    drivingTime:stations[i].drivingtime,
                })
            };
            window.setTimeout(function(){
                $scope.$apply();
                $sortable.sortable();
            });
            MapOperation.addMarkers($scope.buslineStations);
        });
    }else{
        //添加模式
        $scope.busline = {
            lineid:"",
            linename:"",
            runstatus:0,
            linetype:0,
            region:"贵州",
            stationnum:0,
            //drivetime:'',
            //drivedistance:''
        }
        $scope.buslineStations = [];
    }
    $scope.tabs = [true,false]
    $scope.tab = function(index){
        for(var i= 0,len=$scope.tabs.length;i<len;i++){
            if(i!=index){
                $scope.tabs[i] = false;
            }else{
                $scope.tabs[i] = true;
            }
        }
    };
    $scope.changeRunStatus = function(){
        if($scope.busline.runstatus==0){
            $scope.busline.runstatus=1;
        }else{
            $scope.busline.runstatus=0;
        }
    }
    var MapOperation = {
        map:null,
        contextMenuPositon: null,
        contextMenu: null,
        geocoder: null,
        createMap: function(){
            MapOperation.map = new AMap.Map('J_map_canvas', {
                zooms:[1,18],
                zoom:12,
                center: [106.702359,26.556565]
            });
            AMap.service('AMap.Geocoder',function(){//回调函数
                //实例化Geocoder
                MapOperation.geocoder = new AMap.Geocoder({
                    city: "09"
                });
            })
            AMap.plugin(['AMap.Autocomplete','AMap.PlaceSearch'],function(){//回调函数
                //实例化Autocomplete
                var autoOptions = {
                    city: "09", //城市，默认全国
                    input:"searchPosition"//使用联想输入的input的id
                };
                autocomplete = new AMap.Autocomplete(autoOptions);
                //TODO: 使用autocomplete对象调用相关功能
                var placeSearch = new AMap.PlaceSearch({
                    city:'09',
                    map:MapOperation.map
                });
                AMap.event.addListener(autocomplete, "select", function(e){
                    placeSearch.search(e.poi.name,function(status,result){
                    })
                 });
                AMap.event.addListener(placeSearch, "markerClick", function(e){
                    $scope.address.gdPosition = [
                        {
                            formattedAddress: e.data.name+e.data.address,
                            location: e.data.location
                        }
                    ]
                    $scope.address.formattedAddress = '';
                    $scope.add();

                })
            })
            MapOperation.contextMenu =  new AMap.ContextMenu();
            MapOperation.contextMenu.addItem("添加站点", function(e) {
                var len = $scope.buslineStations.length;
                closeEditMode(9999);
                // var lnglatXY = [];
                // lnglatXY.push(MapOperation.contextMenuPositon.getLng());
                // lnglatXY.push(MapOperation.contextMenuPositon.getLat());
                var busline = {
                    "stationId":new Date().getTime()+""+ (Math.floor(Math.random () * 9000) + 1000),
                    "stationName": '新建站点'+len,
                    "lng":MapOperation.contextMenuPositon.getLng(),
                    "lat":MapOperation.contextMenuPositon.getLat(),
                    "drivingTime":0,
                    "editMode":true,
                    "drivetime":$scope.busline.drivetime,
                    "drivedistance":$scope.busline.drivedistance
                };
                if(len>1){
                    $scope.buslineStations.splice(len-1, 0, busline);
                }else{
                    $scope.buslineStations.push(busline);
                }
                MapOperation.addMarkers([busline]);
                $scope.$apply();
                $sortable.sortable();
                MapOperation.calcRouteLine();
            }, 0);
            MapOperation.contextMenu.addItem("放大一级", function() {
                MapOperation.map.zoomIn();
            }, 1);
            //右键缩小
            MapOperation.contextMenu.addItem("缩小一级", function() {
                MapOperation.map.zoomOut();
            }, 2);

            MapOperation.map.on('rightclick', function(e) {
                MapOperation.contextMenu.open(MapOperation.map, e.lnglat);
                MapOperation.contextMenuPositon = e.lnglat;
            });
            // var _onClick = function(e){
            //     console.log(e.target)
            // };
            // AMap.event.addListener(marker, 'click', _onClick);
        },
        getAddr: function(lnglatXY) {
            MapOperation.geocoder.getAddress(lnglatXY, function(status, result) {
                if (status === 'complete' && result.info === 'OK') {
                    $scope.formattedAddress = result.regeocode.formattedAddress;
                }else{
                   layer.msg('获取地址失败')
                }
            });
        },
        addMarkers:function(buslines){
            for(var i = 0,len = buslines.length;i<len;i++){
                var text = "<div class='marker station-marker'>"+i+"</div>";
                if(i==0){
                    text="<div class='marker start-marker'>起</div>";
                }else if(i==len-1){
                    text="<div class='marker stop-marker'>终</div>";
                }
                var marker = new AMap.Marker({
                    map: MapOperation.map,
                    position:new AMap.LngLat(buslines[i].lng,buslines[i].lat),
                    content:text,
                    extData:buslines[i],
                    draggable:true
                });
                AMap.event.addListener(marker,"dragend",function(e){
                    //修改站点的坐标位置
                    for(var j= 0,len2=$scope.buslineStations.length;j<len2;j++){
                        var data = this.getExtData();
                        var lngLat = this.getPosition();
                        if(data.stationId==$scope.buslineStations[j].stationId){
                            closeEditMode(9999);
                            $scope.buslineStations[j].lng =lngLat.getLng();
                            $scope.buslineStations[j].lat = lngLat.getLat();
                            $scope.buslineStations[j].editMode = true;
                            $scope.$apply();
                            break;
                        }
                    }
                });
            }
        },
        calcRouteLine:function(){
            MapOperation.map.clearMap();
            MapOperation.addMarkers($scope.buslineStations);
        }

    }
    //定位到当前对象
    $scope.location = function(data){
        MapOperation.map.setCenter(new AMap.LngLat(data.lng,data.lat));
    }
    $scope.getLngLat = function() {
        MapOperation.geocoder.getLocation($scope.address.formattedAddress, function(status, result){
            if (status === 'complete' && result.info === 'OK') {
                //TODO:获得了有效经纬度，可以做一些展示工作
                //比如在获得的经纬度上打上一个Marker
                $scope.address.gdPosition = result.geocodes;
                openInfo($scope.address.gdPosition[0]);
                
            }else{
                //获取经纬度失败
                layer.msg('没有找到您输入的地址')
            }
        })
    }
    function openInfo(item) {
        // console.log(item)
        // var info = '<div class="pannal" style="padding: 5px;"><div>经度 :'+item.location.lng+' 纬度 :'+item.location.lat+'</div><div>地址 :'+item.formattedAddress+'</div><a ng-click="add()" class="label label-info pull-right">点击添加</a>';

        // var div = $compile(info)($scope);
        // var infoWindow = new AMap.InfoWindow({
        //     content: div[0] //使用默认信息窗体框样式，显示信息内容
        // });
        //构建信息窗体中显示的内容
        // var info = [];
        // info.push("经度 :"+item.location.lng+"纬度 :"+item.location.lat);
        // info.push("地址 : "+ item.formattedAddress +"</div></div>");
        
        // var infoWindow = new AMap.InfoWindow({
        //     content: info.join("<br>")  //使用默认信息窗体框样式，显示信息内容
        // });
        // infoWindow.open(MapOperation.map, [item.location.lng, item.location.lat]);
    }
    $scope.add = function(){
        var len = $scope.buslineStations.length;
        closeEditMode(9999);
        var busline = {
            "stationId":new Date().getTime()+""+ (Math.floor(Math.random () * 9000) + 1000),
            "stationName":$scope.address.gdPosition[0].formattedAddress,
            "lng":$scope.address.gdPosition[0].location.lng,
            "lat":$scope.address.gdPosition[0].location.lat,
            "drivingTime":0,
            "editMode":true,
            "drivetime":$scope.busline.drivetime,
            "drivedistance":$scope.busline.drivedistance
        }
        if(len>1){
            $scope.buslineStations.splice(len-1, 0, busline);
        }else{
            $scope.buslineStations.push(busline);
        }
        MapOperation.addMarkers([busline]);
        $scope.$apply();
        $sortable.sortable();
        MapOperation.calcRouteLine();
    }
    //更新排序
    $sortable.on("sortupdate",function(event){
        var temp = [];
        $sortable.children("li").each(function(index,item){
            temp.push(JSON.parse($(item).attr("data")));
        });
        //更新排序的站点
        $scope.buslineStations=temp;
        $scope.$apply();
        $sortable.sortable();
        MapOperation.calcRouteLine();
    });
    function closeEditMode(index){
        for(var i= 0,len=$scope.buslineStations.length;i<len;i++){
            if(i!=index){
                $scope.buslineStations[i].editMode = false;
            }
        }
    }

    MapOperation.createMap();

    //停靠点编辑
    $scope.edit = function(index){
        closeEditMode(index);
        $scope.buslineStations[index].editMode = !$scope.buslineStations[index].editMode;
    }
    //删除一个站点
    $scope.delete = function(index){
        //删除索引的数组
        $scope.buslineStations.splice(index,1);
        //清空地图
        $sortable.sortable();
        MapOperation.calcRouteLine();
    }
    $scope.save = function(){
        $scope.submit(true);
    }
    $scope.submit = function(saveMode){
        var len = $scope.buslineStations.length;
        for(var i = 1; i < $scope.buslineStations.length; i++){
            if($scope.buslineStations[i].drivingTime == 0){
                layer.msg('用时不能为0分钟');
                return
            }
        }
        if(len>1){
            var stations = [];
            for(var i=0;i<len;i++){
                stations.push({
                    stationid:$scope.buslineStations[i].stationId,
                    lineid:$scope.buslineStations[i].lineid,
                    stationname:$scope.buslineStations[i].stationName,
                    stalongitude:$scope.buslineStations[i].lng,
                    stalatitude:$scope.buslineStations[i].lat,
                    drivingtime:$scope.buslineStations[i].drivingTime,
                    serialno:i
                    //drivetime:$scope.buslineStations[i].drivetime,
                    //drivedistance:$scope.buslineStations[i].drivedistance
                });
            }
            $scope.busline.stationnum =len;
            $scope.busline.departaddr = stations[0].stationname;
            $scope.busline.departlon = stations[0].stalongitude;
            $scope.busline.departlat =stations[0].stalatitude;
            //$scope.busline.drivetime =stations[0].drivetime;
            //$scope.busline.drivedistance=stations[0].drivedistance;
            $scope.busline.arriveaddr = stations[len-1].stationname;
            $scope.busline.arrivelon = stations[len-1].stalongitude;
            $scope.busline.arrivelat = stations[len-1].stalatitude;
            var data = {
                busline:$scope.busline,
                stations:stations
            }
            if(angular.equals(data,saveDataOld)){
                layer.msg("线路信息未经过修改");
                return;
            }
            if($scope.editMode&&!saveMode){
                $myHttpService.post("api/busline/updateBuslineInfo.htm",{data:JSON.stringify(data)},function(){
                    layer.msg("修改成功！",{offset: '100px'})
                    $state.go("app.route.list",{},{reload:true});
                });
            }else{
                if($scope.busline.drivetime==undefined || $scope.busline.drivedistance==undefined){
                    layer.alert("请输入运行时长和运行距离");
                    return;
                }
                $myHttpService.post("api/busline/insertBusline.htm",{data:JSON.stringify(data)},function(){
                    layer.msg("添加成功！",{offset: '100px'})
                    $state.go("layout.route_add",{},{reload:true});
                });
            }
        }else{
            layer.alert("一条线路必须有一个起点和终点");
        }
    }
});
/**
 * 线路列表控制器
 */
app.controller('RouteListController',function($rootScope,$scope,$http,$state,$localStorage,$stateParams,$filter,$tableListService,$myHttpService){
    //全选
    // var selected = false;
    // $scope.selectAll = function(){
    //     selected = !selected;
    //     angular.forEach($scope.pageResponse.buslines,function(item){
    //         item.selected = selected;
    //     });
    // }

    /*批量删除*/
    //$scope.deleteRow=function(){
    //    //获取选中的行数据
    //    for(var j =0;j<$scope.pageResponse.buslines.length;j++) {
    //        if ($scope.pageResponse.buslines[j].selected) {
    //            //封装charterid
    //            $scope.deletelineid = {
    //                lineid:$scope.pageResponse.buslines[j].lineid
    //            };
    //
    //            layer.confirm('您确定要删除选中的信息吗？', {icon: 3, title:'提示'},function(){
    //                //请求服务
    //                $myHttpService.post('api/busline/deleteBusline.htm',{lineid: $scope.deletelineid.lineid},function(data){
    //                    layer.msg("删除成功！", {offset: '100px'});
    //                    $state.go("app.charterbus.operationadmin", {}, {reload: true});
    //                });
    //            },function(index){
    //                layer.close(index);
    //            });
    //            return false;
    //        }else{layer.msg('请选择删除的信息')}
    //
    //    }
    //
    //};

    var options = {
        searchFormId:"J_search_form",
        listUrl:"api/busline/queryBuslineByKeyword.htm"
    };


    $scope.delete=function(item){
        layer.confirm('您确定要删除吗？', {icon: 3, title:'提示'},function(){
            $myHttpService.post("api/busline/deleteBusline.htm",item,function(){
                layer.msg("删除成功！",{offset: '100px'})
                $state.go("app.route.list",{},{reload: true});
            });
        },function(index){
            layer.close(index);
        });
    }
    $tableListService.init($scope, options);
    $tableListService.get();
});
/**

 * 线路列表控制器

 */

app.controller('RouteCreateListController',function($rootScope,$scope,$http,$state,$localStorage,$stateParams,$filter,$tableListService,$myHttpService){
    //全选
    var selected = false;
    $scope.selectAll = function(){
        selected = !selected;
        angular.forEach($scope.pageResponse.buslines,function(item){
            item.selected = selected;
        });
    }
    var options = {
        searchFormId:"J_search_form",
        listUrl:"api/busline/queryApplyBuslinesByKeyword.htm"
    };
    $tableListService.init($scope, options);
    $tableListService.get();

});