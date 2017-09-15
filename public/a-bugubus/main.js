'use strict';
/**
 * @author 周快
 * @date 2016-10-07
 * @version 1.0.0
 * @descriptions AngularJS的根控制器，AngularJS启动相关配置
 * */
angular.module('app')
    .controller('AppCtrl', ['$rootScope','$scope', '$translate', '$localStorage', '$window', '$state','$http',
        function( $rootScope ,$scope,   $translate,   $localStorage,   $window ,$state,$myHttpService) {
            $rootScope.alerts=[];
            $rootScope.closeAlert = function(index) {
                $rootScope.alerts.splice(index, 1);
            };
            // add 'ie' classes to html
            //添加IE浏览器的样式到根节点
            var isIE = !!navigator.userAgent.match(/MSIE/i);
            isIE && angular.element($window.document.body).addClass('ie');
            isSmartDevice( $window ) && angular.element($window.document.body).addClass('smart');
            //系统的全局配置
            // config
            $scope.app = {
                host: "http://127.0.0.1:8000",
                name: '贵旅直通车',
                version: '1.3.3',
                basePath:'a-bugubus/',
                // for chart colors
                color: {
                    primary: '#7266ba',
                    info:    '#23b7e5',
                    success: '#27c24c',
                    warning: '#fad733',
                    danger:  '#f05050',
                    light:   '#e8eff0',
                    dark:    '#3a3f51',
                    black:   '#1c2b36'
                },
                settings: {
                    themeID: 1,
                    navbarHeaderColor: 'bg-black',
                    navbarCollapseColor: 'bg-white-only',
                    asideColor: 'bg-black',
                    headerFixed: true,
                    asideFixed: true,
                    asideFolded: false,
                    asideDock: false,
                    container: false
                }
            }
            //保存配置到本地缓存
            // save settings to local storage
            if ( angular.isDefined($localStorage.settings) ) {
                $scope.app.settings = $localStorage.settings;
            } else {
                $localStorage.settings = $scope.app.settings;
            }
            //监听系统全局设置，每次改动都保存配置到本地
            $scope.$watch('app.settings', function(){
                if( $scope.app.settings.asideDock  &&  $scope.app.settings.asideFixed ){
                    // aside dock and fixed must set the header fixed.
                    $scope.app.settings.headerFixed = true;
                }
                // save to local storage
                $localStorage.settings = $scope.app.settings;
            }, true);
            //angular国际化
            // angular translate
            $scope.lang = { isopen: false };
            $scope.langs = {en:'English', de_DE:'German', it_IT:'Italian'};
            $scope.selectLang = $scope.langs[$translate.proposedLanguage()] || "English";
            $scope.setLang = function(langKey, $event) {
                // set the current lang
                $scope.selectLang = $scope.langs[langKey];
                // You can change the language during runtime
                $translate.use(langKey);
                $scope.lang.isopen = !$scope.lang.isopen;
            };

            //判断是不是智能手机
            function isSmartDevice( $window )
            {
                // Adapted from http://www.detectmobilebrowsers.com
                var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
                // Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
                return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
            }
}]);
