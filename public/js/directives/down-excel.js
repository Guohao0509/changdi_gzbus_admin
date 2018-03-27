angular.module('app.directives').directive('downExcel', [function() {
	return {
		restrict: 'A',
		replace: true,
		templateUrl: '../../tpl/blocks/down-excel.html',
		scope: {
		},
		controller: function($scope) {
            $scope.export = function() {
                if($scope.startDate == undefined || $scope.endDate == undefined) {
                    layer.msg('请选择正确的时间段')
                    return;
                }
                var reqParam = {
                    startTime: $filter('date')($scope.startDate,'yyyy-MM-dd'),
                    endTime: $filter('date')($scope.endDate,'yyyy-MM-dd'),
                    totalnum: 99999
                }
                $myHttpService.post('api/ticketorder/getViewOrderExcel',reqParam,function(data) {
                    window.location.href = data.path;
                })
            }
            //根据时间筛选进行导出excel
            //开始时间
            $scope.startDateOption = {
                opened:false,
                dateOptions:{
                    datepickerMode:'day',
                    showWeeks: false,
                    minMode:'day'
                },
                format:"yyyy-MM-dd",
                disabled:function(date, mode) {
                    return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
                },
                toggleMin: function() {
                    $scope.minDate = $scope.minDate ? null : new Date();
                },
                open:function($event) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    $scope.startDateOption.opened = true;
                }
            };
            //结束时间
            $scope.endDateOption = {
                opened:false,
                dateOptions:{
                    datepickerMode:'day',
                    showWeeks: false,
                    minMode:'day'
                },
                format:"yyyy-MM-dd",
                disabled:function(date, mode) {
                    return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
                },
                toggleMin: function() {
                    $scope.minDate = $scope.minDate ? null : new Date();
                },
                open:function($event) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    $scope.endDateOption.opened = true;
                }
            };
		},
		link: function(scope, element, attrs) {
		}
	}
}]);