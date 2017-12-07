angular.module('app.directives').directive('mySelect', [function() {
	return {
		restrict: 'A',
		replace: true,
		template: '<div><input class="form-control"><select class="form-control" ng-init="selOption = -1" multiple size="{{options.length}}"><option value="-1" display="none">请选择</option><option ng-repeat="item in options" value="item.value">{{item.optionName}}</option></div>',
		scope: {
			myOptions: '=',
			myOption: '='
		},
		controller: function($scope) {
		},
		link: function(scope, element, attrs) {
			scope.myOptions = [{optionName: 1, value: 1},{optionName: 2, value: 2},{optionName: 3, value: 3}]
			scope.options = scope.myOptions;
			scope.selOption = scope.myOption;
		}
	}
}]);