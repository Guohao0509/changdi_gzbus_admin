//用户登录拦截器，如果用户登录，则跳转到主页，通常在第一次进入其他页面时调用
app.controller('LoadingController',['$rootScope','$scope','$http','$state','$localStorage','$myHttpService',function($rootScope,$scope,$http,$state,$localStorage,$myHttpService){
    $myHttpService.get("auth/check",{},function(data){
        if(data==null){
            $state.go('auth.login');
        }else{
            $rootScope.session_user = data;
            $rootScope.session_user.access = 'systemUser';
            $rootScope.havePower_user = true;
            if(data.viewUser){
                $rootScope.session_user.userName = data.viewUser;
                $rootScope.session_user.access = 'viewUser';
                $rootScope.havePower_user = false;
            }else if(data.sourceUser){
                $rootScope.session_user.userName = data.sourceUser;
                $rootScope.session_user.access = 'sourceUser';
                $rootScope.havePower_user = false;
            }
        }
    });
}]);

//登录页面控制器,完成用户登录授权，并加载用户信息到本地数据库
app.controller('LoginController',['$rootScope','$scope','$state','$http','$resource','Base64','$localStorage','$myHttpService','md5',function($rootScope,$scope,$state,$http,$resource,Base64,$localStorage,$myHttpService,md5){
    
    $scope.login = function(){
        var user = {
            username:$scope.user.username,
            password:md5.createHash($scope.user.password)
        }
        $myHttpService.get("auth/login",{params:user},function(data){
            if(data!=null){
                //这里需要拿到token和系统管理员id
                //有待添加
                $rootScope.session_user = data;
                if(data.viewUser){
                    $rootScope.session_user.userName = data.viewUser;
                    $rootScope.session_user.access = 'viewUser';
                    $rootScope.havePower_user = false;
                    $state.go('app.vieworder.list');
                }else if(data.sourceUser){
                    $rootScope.session_user.userName = data.sourceUser;
                    $rootScope.session_user.access = 'sourceUser';
                    $rootScope.havePower_user = false;
                    $state.go('app.carorder.list');
                }else{
                    $rootScope.session_user.access = 'systemUser';
                    $rootScope.havePower_user = true;
                    $state.go('app.carorder.list');
                }
                // $rootScope.havePower_user = data.havePower;
                // $rootScope.ticketSource_user = data.ticketSource;
            }else{
                $scope.authError = "用户名或密码错误";
            }
        });
    }
}]);

app.factory('Base64',function(){
    var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);

            return output;
        },

        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                window.alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";

            } while (i < input.length);

            return output;
        }
    };
});