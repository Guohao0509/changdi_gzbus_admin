/**
 * @author 周快
 * @date 2016-10-07
 * @version 1.0.0
 * @descriptions AngularJS的启动文件,AngularJs的路由配置文件
 */
/**
 * @author Guohao
 * @date 2017-9-07
 * @version 1.0.0
 * @descriptions AngularJS的启动文件,AngularJs的路由配置文件
 * @module 产品管理、优惠券管理、订单管理、票据来源管理、景区管理、景区订单管理
 */
app
    .run(
    //AngularJS启动的时候，运行如下配置
    function ($rootScope,$state,$stateParams,$localStorage,$http,$myHttpService) {
        //从本地的缓存中读取配置到session
        $http.defaults.headers.common['Authorization'] = 'Basic ' + $localStorage.auth;
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.$on('$stateChangeSuccess', function(event, to, toParams, from, fromParams) {
            $rootScope.previousState = from;
            $rootScope.previousStateParams = fromParams;
        });
        //监听路由改变事件，每次路由改变，需要检查一下用户的权限，状态
        $rootScope.$on('$stateChangeStart', function(event, toState, toStateParams) {
            // if($rootScope.map){
            //     console.log(111111)
            //     $rootScope.map.destroy()
            // }
            var urls = toState.name.split('.');
            //包含验证页面，则无需过滤，否则跳转到登录页
            if(urls.length>0&&urls[0]!="auth"&&$rootScope.session_user==undefined){
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
            }
        });
        // $rootScope.$on('$viewContentLoading', function(event, toState, toStateParams, fromState, fromParams){
        //     console.log(event);
        //     console.log(toState);
        // })
        //用户注销
        $rootScope.logout = function(){
            $myHttpService.get("auth/logout",{},function(data){
                $rootScope.session_user=undefined;
                $state.go('auth.login');
            });
        }
    }
)
.config(
    //AngularJS启动时顺便配置下面服务组件
    function ($stateProvider,   $urlRouterProvider) {
        var basePath = "a-bugubus/";
        //使用$urlRouterProvider来指定默认路由，默认路径必须通过系统自带的路由服务组件，系统路由不支持路由嵌套
        $urlRouterProvider
            .otherwise('/auth/login');
        //使用ui-router组件来进行路由
        $stateProvider
            
            .state('error',{
                abstract: true,
                url:'/error',
                template: '<div ui-view class="fade-in"></div>'
            })
            .state('error.404',{
                //显示加载中页面
                url:'/404',
                templateUrl:basePath+'error/404.html',
            })
            .state('auth',{
                abstract: true,
                url:'/auth',
                template: '<div ui-view class="fade-in"></div>',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad ){
                            //延迟加载授权控制器
                            return $ocLazyLoad.load('a-bugubus/auth/controller.js');
                        }]
                }
            })
            .state('auth.loading',{
                //显示加载中页面
                url:'/loading',
                templateUrl:basePath+'auth/loading.html',
            })
            .state('auth.login',{
                //跳转到用户登录页面
                url:'/login',
                templateUrl:basePath+'auth/login.html',
            })
            .state('app', {
                //系统根目录
                abstract: true,
                url: '/app',
                templateUrl: basePath+'app.html',
            })

            .state('app.dashboard', {
                //跳转到系统主页
                url: '/dashboard',
                templateUrl: basePath+'dashboard.html',
                ncyBreadcrumb: {
                    label: '<i class="fa fa-home"></i> 首页'
                }
            })
            .state('app.coupon',{
                abstract: true,
                url:'/coupon',
                template: '<div ui-view class="fade-in"></div>',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad ){
                            //延迟加载授权控制器
                            return $ocLazyLoad.load('a-bugubus/coupon/controller.js');
                        }]
                }
            })
            .state('app.coupon.list', {
                //跳转到优惠券管理界面
                url: '/list',
                templateUrl: basePath+'coupon/list.html',
                ncyBreadcrumb: {
                    parent:'app.dashboard',
                    label: '优惠券列表'
                }
            })
            .state('app.coupon.add', {
                //跳转到优惠券编辑界面
                url: '/add',
                templateUrl: basePath+'coupon/edit.html',
                ncyBreadcrumb: {
                    parent:'app.coupon.list',
                    label: '添加优惠券'
                }
            })
            .state('app.coupon.edit', {
                //跳转到优惠券添加界面
                url: '/edit/{id}',
                templateUrl: basePath+'coupon/edit.html',
                ncyBreadcrumb: {
                    parent:'app.coupon.list',
                    label: '编辑优惠券'
                }
            })
            .state('app.driver',{
                url:'/driver',
                template: '<div ui-view class="fade-in"></div>',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad ){
                            //延迟加载授权控制器
                            return $ocLazyLoad.load('a-bugubus/driver/controller.js');
                        }]
                }
            })
            .state('app.driver.list', {
                //跳转到司机管理界面
                url: '/list',
                cache:false,
                templateUrl: basePath+'driver/list.html',
                ncyBreadcrumb: {
                    parent:'app.dashboard',
                    label: '司机列表'
                }
            })
            .state('app.driver.add', {
                //跳转到添加司机界面
                url: '/add',
                templateUrl: basePath+'driver/edit.html',
                ncyBreadcrumb: {
                    parent:'app.driver.list',
                    label: '添加司机'
                }
            })
            .state('app.driver.edit', {
                //跳转到编辑司机界面
                url: '/edit/{id}',
                templateUrl: basePath+'driver/edit.html',
                ncyBreadcrumb: {
                    parent:'app.driver.list',
                    label: '编辑司机'
                }
            })
            .state('app.driver.detail', {
                //跳转到司机详情界面
                url: '/detail/{id}',
                templateUrl: basePath+'driver/detail.html',
                ncyBreadcrumb: {
                    parent:'app.driver.list',
                    label: '司机详情'
                }
            })
            .state('app.carorder',{
                abstract: true,
                url:'/carorder',
                template: '<div ui-view class="fade-in"></div>',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad ){
                            //延迟加载授权控制器
                            return $ocLazyLoad.load('a-bugubus/carorder/controller.js');
                        }]
                }
            })
            .state('app.carorder.list', {
                //跳转到直通车订单管理界面
                url: '/list',
                templateUrl: basePath+'carorder/list.html',
                ncyBreadcrumb: {
                    parent:'app.dashboard',
                    label: '直通车订单列表'
                }
            })
            .state('app.carorder.add', {
                url: '/add',
                templateUrl: basePath+'carorder/add.html',
                ncyBreadcrumb: {
                    parent:'app.carorder.list',
                    label: '添加订单'
                }
            })
            .state('app.carorder.uploadimage', {
                url: '/uploadimage/{id}',
                templateUrl: basePath+'carorder/uploadimage.html',
                ncyBreadcrumb: {
                    parent:'app.carorder.list',
                    label: '添加评论图片'
                }
            })
            .state('app.carorder.view_list', {
                url: '/view_list',
                templateUrl: basePath+'carorder/view.html',
                ncyBreadcrumb: {
                    parent:'app.carorder.list',
                    label: '门票列表'
                }
            })
            .state('app.carorder.add_view', {
                url: '/add_view',
                templateUrl: basePath+'carorder/addView.html',
                ncyBreadcrumb: {
                    parent:'app.carorder.list',
                    label: '添加门票'
                }
            })
            // .state('app.carorder.add', {
            //     //跳转到直通车订单编辑界面
            //     url: '/add',
            //     templateUrl: basePath+'carorder/edit.html',
            //     ncyBreadcrumb: {
            //         parent:'app.carorder.list',
            //         label: '添加直通车订单'
            //     }
            // })
            // .state('app.carorder.edit', {
            //     //跳转到直通车订单添加界面
            //     url: '/edit/{id}',
            //     templateUrl: basePath+'carorder/list.html',
            //     ncyBreadcrumb: {
            //         parent:'app.carorder.list',
            //         label: '编辑直通车订单'
            //     }
            // })
            .state('app.route', {
                //线路列表，线路管理
                abstract: true,
                url:'/route',
                template: '<div ui-view class="fade-in"></div>',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad ){
                            //延迟加载授权控制器
                            return $ocLazyLoad.load(basePath+'route/controller.js');
                        }]
                }
            })
            .state('app.route.list', {
                //跳转到线路list界面
                url: '/list',
                templateUrl: basePath+'route/list.html',
                ncyBreadcrumb: {
                    parent:'app.dashboard',
                    label: '线路列表'
                }
            })


            .state('app.route.create_list', {
                //跳转到线路添加界面
                url: '/create_list',
                templateUrl: basePath+'route/create_list.html',
                ncyBreadcrumb: {
                    parent:'app.dashboard',
                    label: '线路报名'
                }
            })

            .state('layout', {
                abstract: true,
                url: '/layout',
                templateUrl: basePath+'a-blocks/layout.html',
                resolve: {
                    deps: ['uiLoad',
                        function( uiLoad ){
                            return uiLoad.load(
                                [
                                    basePath+'route/controller.js',
                                    'http://webapi.amap.com/maps?v=1.3&key=1a5cdec55ebac9dbd85652429f54d4d1',
                                    'vendor/jquery/sortable/jquery.sortable.js'
                                ] );
                        }]
                }
            })
            .state('layout.route_add', {
                url: '/route_add',
                views: {
                    '': {
                        templateUrl: basePath+'route/edit.html'
                    },
                    'footer': {
                        templateUrl: basePath+'a-blocks/layout_footer_fullwidth.html'
                    }
                }
            })
            .state('layout.route_edit', {
                url: '/route_edit/{id}',
                views: {
                    '': {
                        templateUrl: basePath+'route/edit.html'
                    },
                    'footer': {
                        templateUrl: basePath+'a-blocks/layout_footer_fullwidth.html'
                    }
                }
            })
            .state('app.schedule', {
                //排班管理
                abstract: true,
                url:'/schedule',
                template: '<div ui-view class="fade-in"></div>',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad ){
                            //延迟加载授权控制器
                            return $ocLazyLoad.load(basePath+'schedule/controller.js');
                    }]
                }
            })
            .state('app.schedule.list', {
                //跳转到排班管理
                url: '/list',
                templateUrl: basePath+'schedule/list.html',
                ncyBreadcrumb: {
                    parent:'app.dashboard',
                    label: '排班列表'
                }
            })
            .state('app.schedule.add', {
                //跳转到排班新增
                url: '/add',
                templateUrl: basePath+'schedule/edit.html',
                ncyBreadcrumb: {
                    parent:'app.schedule.list',
                    label: '添加排班'
                }
            })
            .state('app.schedule.edit', {
                //跳转到排班管理
                url: '/edit/{id}',
                templateUrl: basePath+'schedule/edit.html',
                ncyBreadcrumb: {
                    parent:'app.schedule.list',
                    label: '编辑排班'
                }
            })
            
            .state('app.bus', {
                //车辆管理
                abstract: true,
                url:'/bus',
                template: '<div ui-view class="fade-in"></div>',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad ){
                            //延迟加载授权控制器
                            return $ocLazyLoad.load([
                                    basePath+'bus/controller.js',
                                    'http://webapi.amap.com/maps?v=1.3&key=1a5cdec55ebac9dbd85652429f54d4d1'
                                ]);
                        }]
                }
            })
            .state('app.bus.list', {
                //跳转到车辆列表界面
                url: '/list',
                templateUrl: basePath+'bus/list.html',
                ncyBreadcrumb: {
                    parent:'app.dashboard',
                    label: '车辆列表'
                }
            })
            .state('app.bus.add', {
                //跳转到车辆添加界面
                url: '/add',
                templateUrl: basePath+'bus/edit.html',
                ncyBreadcrumb: {
                    parent:'app.bus.list',
                    label: '添加车辆'
                }
            })
            .state('app.bus.edit', {
                //跳转到车辆编辑界面
                url: '/edit/{id}',
                templateUrl: basePath+'bus/edit.html',
                ncyBreadcrumb: {
                    parent:'app.bus.list',
                    label: '编辑车辆'
                }
            })
            .state('app.bus.historical', {
                //跳转到车辆编辑界面
                url: '/historical',
                templateUrl: basePath+'bus/historical.html',
                ncyBreadcrumb: {
                    parent:'',
                    label: '轨迹回放'
                }
            })
            .state('app.bus.position', {
                //跳转到车辆编辑界面
                url: '/position/{carPosition}',
                templateUrl: basePath+'bus/position.html',
                ncyBreadcrumb: {
                    parent:'app.bus.list',
                    label: '位置信息'
                }
            })
            .state('app.trip', {
                //行程管理
                abstract: true,
                url:'/trip',
                template: '<div ui-view class="fade-in"></div>',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad ){
                            //延迟加载授权控制器
                            return $ocLazyLoad.load(basePath+'trip/controller.js');
                        }]
                }
            })
            .state('app.trip.list', {
                //跳转到产品列表界面
                url: '/list',
                templateUrl: basePath+'trip/list.html',
                ncyBreadcrumb: {
                    parent:'app.dashboard',
                    label: '产品管理'
                }
            })
            .state('app.trip.add', {
                //跳转到产品添加界面
                url: '/add',
                templateUrl: basePath+'trip/add.html',
                ncyBreadcrumb: {
                    parent:'app.trip.list',
                    label: '添加产品'
                }
            })
            .state('app.trip.edit', {
                //跳转到产品编辑界面
                url: '/edit/{id}',
                templateUrl: basePath+'trip/add.html',
                ncyBreadcrumb: {
                    parent:'app.trip.list',
                    label: '编辑产品'
                }
            })
            .state('app.trip.dailyschedule', {
                url: '/dailyschedule',
                templateUrl: basePath+'trip/dailyschedule.html',
                ncyBreadcrumb: {
                    parent: 'app.trip.list',
                    label: '每日排班详情'
                }
            })
            .state('app.trip.uploadimage', {
                url: '/uploadimage/{id}',
                templateUrl: basePath+'trip/uploadimage.html',
                ncyBreadcrumb: {
                    parent:'app.trip.list',
                    label: '添加推荐图片'
                }
            })
            .state('app.trip.evaluation', {
                //跳转到产品评论界面
                url: '/evaluation',
                templateUrl: basePath+'trip/evaluation.html',
                ncyBreadcrumb: {
                    parent:'app.trip.list',
                    label: '产品评论'
                }
            })
            .state('app.trade', {
                //交易管理
                abstract: true,
                url:'/trade',
                template: '<div ui-view class="fade-in"></div>',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad ){
                            //延迟加载授权控制器
                            return $ocLazyLoad.load(basePath+'trade/controller.js');
                        }]
                }
            })
            // .state('app.trade.ticket_list', {
            //     //跳转到车辆列表界面
            //     url: '/ticket_list',
            //     templateUrl: basePath+'trade/ticket_list.html',
            //     ncyBreadcrumb: {
            //         parent:'app.dashboard',
            //         label: '车票列表'
            //     }
            // })
            .state('app.trade.recharge_list',{
                url:'/recharge_list',
                templateUrl: basePath+'trade/recharge_list.html',
                ncyBreadcrumb: {
                    parent:'app.dashboard',
                    label: '充值列表'
                }
            })

            .state('app.user', {
                //用户管理
                abstract: true,
                url:'/user',
                template: '<div ui-view class="fade-in"></div>',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad ){
                            //延迟加载授权控制器
                            return $ocLazyLoad.load(basePath+'user/controller.js');
                        }]
                }
            })

            .state('app.statistic', {
                //统计父目录
                abstract: true,
                url:'/statistic',
                template: '<div ui-view class="fade-in"></div>',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad ){
                            //延迟加载授权控制器
                            return $ocLazyLoad.load(basePath+'statistic/controller.js');
                        }]
                }
            })

            .state('app.statistic.profit',{
                //收益统计
                url:'/profit',
                templateUrl:basePath+'statistic/profit.html',
                ncyBreadcrumb:{
                    parent:'app.dashboard',
                    label:'收益统计'
                }
            })
            .state('app.user.user_list', {
                //跳转到用户管理界面
                url: '/user_list',
                templateUrl: basePath+'user/user_list.html',
                ncyBreadcrumb: {
                    parent:'app.dashboard',
                    label: '用户管理'
                }
            })

            .state('app.source', {
                //票据来源
                abstract: true,
                url:'/source',
                template: '<div ui-view class="fade-in"></div>',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad ){
                            //延迟加载授权控制器
                            return $ocLazyLoad.load(basePath+'source/controller.js');
                        }]
                }
            })
            .state('app.source.list', {
                //跳转到票据来源列表
                url: '/list',
                templateUrl: basePath+'source/list.html',
                ncyBreadcrumb: {
                    parent:'app.dashboard',
                    label: '票据来源管理'
                }
            })
            .state('app.source.add', {
                //跳转到票据来源添加页面
                url: '/add',
                templateUrl: basePath+'source/add.html',
                ncyBreadcrumb: {
                    parent: 'app.dashboard',
                    label: '添加票据'
                }
            })
            .state('app.source.edit', {
                //票据来源编辑
                url: '/edit/{id}',
                templateUrl: basePath+'source/add.html',
                ncyBreadcrumb: {
                    parent: 'app.dashboard',
                    label: '编辑票据'
                }
            })
            .state('app.charterbus',{
                /*包车管理父目录*/
                abstract:true,
                url:'/charterbus',
                template:'<div ui-view class="fade-in"></div>',
                resolve:{
                    deps:['$ocLazyLoad',
                        function($ocLazyLoad){
                            return $ocLazyLoad.load(basePath+'charterbus/controller.js');
                        }]
                }
            })
            .state('app.charterbus.operationadmin',{
                url:'/operationadmin',
                templateUrl:basePath+'charterbus/operationadmin.html',
                ncyBreadcrumb: {
                    parent:'app.charterbus',
                    label: '包车管理'
                }
            })
            .state('app.charterbus.edit',{
                url:'/edit/{charterid}',
                templateUrl:basePath+'charterbus/edit.html',
                ncyBreadcrumb: {
                    parent:'app.charterbus.operationadmin',
                    label: '包车服务'
                }
            })
            .state('app.view', {
                //景点管理
                abstract: true,
                url:'/view',
                template: '<div ui-view class="fade-in"></div>',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad ){
                            //延迟加载授权控制器
                            return $ocLazyLoad.load(basePath+'view/controller.js');
                        }]
                }
            })
            .state('app.view.list', {
                //跳转到景点管理list
                url: '/list',
                templateUrl: basePath+'view/list.html',
                ncyBreadcrumb: {
                    parent:'app.dashboard',
                    label: '景点管理'
                }
            })
            .state('app.view.add', {
                //跳转到景点添加
                url: '/add',
                templateUrl: basePath+'view/add.html',
                ncyBreadcrumb: {
                    parent:'app.dashboard',
                    label: '添加景点'
                }
            })
            .state('app.view.edit', {
                //跳转到景点添加
                url: '/edit/{id}',
                templateUrl: basePath+'view/add.html',
                ncyBreadcrumb: {
                    parent:'app.dashboard',
                    label: '编辑景点'
                }
            })
            .state('app.vieworder', {
                //跳转到景点订单
                abstract: true,
                url:'/vieworder',
                template: '<div ui-view class="fade-in"></div>',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad ){
                            //延迟加载授权控制器
                            return $ocLazyLoad.load(basePath+'vieworder/controller.js');
                        }]
                }
            })
            .state('app.vieworder.list', {
                //跳转到景点列表页面
                url: '/list',
                templateUrl: basePath+'vieworder/list.html',
                ncyBreadcrumb: {
                    parent:'app.dashboard',
                    label: '景区订单管理'
                }
            })
            .state('app.test', {
                //跳转到景点订单
                abstract: true,
                url:'/test',
                template: '<div ui-view class="fade-in"></div>',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad ){
                            //延迟加载授权控制器
                            return $ocLazyLoad.load(basePath+'a-blocks/controller.js');
                        }]
                }
            })
            .state('app.test.upload', {
                url: '/upload',
                templateUrl: basePath+'a-blocks/uploadimage.html',
                ncyBreadcrumb: {
                    parent:'app.test',
                    label: '优惠券列表'
                }
            })
            .state('app.product', {
                //行程管理
                abstract: true,
                url:'/product',
                template: '<div ui-view class="fade-in"></div>',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad ){
                            //延迟加载授权控制器
                            return $ocLazyLoad.load(basePath+'product/controller.js');
                        }]
                }
            })
            .state('app.product.list', {
                //跳转到产品列表界面
                url: '/list',
                templateUrl: basePath+'product/list.html',
                ncyBreadcrumb: {
                    parent:'app.dashboard',
                    label: '产品管理'
                }
            })
            .state('app.product.add', {
                //跳转到产品添加界面
                url: '/add',
                templateUrl: basePath+'product/add.html',
                ncyBreadcrumb: {
                    parent:'app.product.list',
                    label: '添加产品'
                }
            })
            .state('app.product.edit', {
                //跳转到产品编辑界面
                url: '/edit/{id}',
                templateUrl: basePath+'product/add.html',
                ncyBreadcrumb: {
                    parent:'app.product.list',
                    label: '编辑产品'
                }
            })
            .state('app.product.evaluation', {
                //跳转到产品评论界面
                url: '/evaluation',
                templateUrl: basePath+'product/evaluation.html',
                ncyBreadcrumb: {
                    parent:'app.product.list',
                    label: '产品评论'
                }
            })
            .state('app.product.uploadimage', {
                url: '/uploadimage/{id}',
                templateUrl: basePath+'product/uploadimage.html',
                ncyBreadcrumb: {
                    parent:'app.product.list',
                    label: '添加评论图片'
                }
            })
            .state('app.product.dailyschedule', {
                url: '/dailyschedule',
                templateUrl: basePath+'product/dailyschedule.html',
                ncyBreadcrumb: {
                    parent: 'app.product.list',
                    label: '每日排班详情'
                }
            })
    }
);