/**
 * @author 周快
 * @date 2016-10-07
 * @version 1.0.0
 * @descriptions 获取数据列表，通常在有类似table等列表展示页面使用
 */
angular.module('app.service',[])
    .service('$myHttpService',function($http){
        this.post = function(url,data,success,error){
            var loadIndex = layer.msg("请求资源中……",{time:99999999,offset: '100px'});
            $http.post(url,data).success(function(data){
                layer.close(loadIndex);
                if(data.code==0){
                    success(data.data);
                }else{
                    if(layer){
                        layer.alert(JSON.stringify(data));
                        console.log(data)
                    }else{
                        alert(JSON.stringify(data));
                    }
                    if(error){
                        error(data.data);
                    }
                }
                
            }).error(function(e){
                layer.close(loadIndex);
                if(layer){
                    layer.alert(e);
                }else{
                    alert(e);
                }
                if(error){
                    error(e);
                }
            });
        };
        this.get = function(url,data,success,error){
            var loadIndex = layer.msg("请求资源中……",{time:99999999,offset: '100px'});
            $http.get(url,data).success(function(data){
                layer.close(loadIndex);
                if(data.code==0){
                    success(data.data);
                }else{
                    if(layer){
                        layer.alert(JSON.stringify(data));
                    }else{
                        alert(JSON.stringify(data));
                    }
                    if(error){
                        error(data.data);
                    }
                }
                //$scope.dt = $scope.driver.birthday;
            }).error(function(e){
                layer.close(loadIndex);
                if(layer){
                    layer.alert(e);
                }else{
                    alert(e);
                }
                if(error){
                    error(e);
                }
            });
        }
    })
    .service('$tableListService',function($myHttpService,$localStorage){
        var $scopeLocal = {};
        var pageSizeList = [{
            "text": "5",
            "value": "5"
        }, {
            "text": "10",
            "value": "10"
        }, {
            "text": "20",
            "value": "20"
        }];

        var defaultOptions = {
            beforeSend: function () {
            },
            callback: function ($scope, data) {
            },
            error: function () {
            },
            pageSize:  pageSizeList[0].value,

            searchFormId: "searchForm",
            formData:{}
        };
        this.init = function ($scope, option) {
            var options = $.extend({}, defaultOptions, option);
            $scopeLocal = $scope;
            $scopeLocal.pageSizeList = pageSizeList;
            $scopeLocal.pageRequest = {
                "pageNum": 1, "pageSize": options.pageSize
            };
            if ( angular.isDefined($localStorage.pageSize) ) {
                $scopeLocal.pageRequest.pageSize= $localStorage.pageSize;
            } else {
                $localStorage.pageSize= $scopeLocal.pageRequest.pageSize;
            }
            $scopeLocal.pageRequest.getResponse = function (orderBy) {
                if($scopeLocal.pageRequest.pageSize!=$localStorage.pageSize){
                    $localStorage.pageSize = $scopeLocal.pageRequest.pageSize;
                }
                var requestData = $("#" + options.searchFormId).serialize();
                var offset = ($scopeLocal.pageRequest.pageNum-1)*$scopeLocal.pageRequest.pageSize;
                if(option.size){
                    $scopeLocal.pageRequest.pageSize = option.size;
                    console.log($scopeLocal.pageRequest.pageSize);
                }
                var url = options.listUrl + "?" + requestData + "&offset=" + offset + "&pagesize=" + $scopeLocal.pageRequest.pageSize;
                if(angular.isDefined($scopeLocal.pageRequest.orderBy)&&$scopeLocal.pageRequest.orderBy!=""){
                    url+="&orderby="+$scopeLocal.pageRequest.orderBy;
                }
                $myHttpService.post(url,options.formData,function(data){
                    if(option.multiTable){
                        $scopeLocal[option.multiTable] = data;
                        options.callback($scopeLocal, data);
                    }else {
                        $scopeLocal.pageResponse = data;
                        options.callback($scopeLocal, data);
                    }
                });
            };
            this.get = function () {
                $scopeLocal.pageRequest.getResponse();
            };
        };
    });

