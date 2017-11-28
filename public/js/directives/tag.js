/*
 * @directive 日历指令
 * @author    郭浩
 * @usage     <div my-calendar change-date="{{changeDate}}" select-date="selectDate()"></div>
 * @param     change-date: Array[Number]
 * @param     select-date: function
*/

angular.module('app.directives').directive('myTag', [function() {
	return {
		restrict: 'A',
		replace: true,
		template: '<div><span ng-repeat="t in tags track by $index" class="{{tag(t)}}" style="margin-left: 5px;">{{t}}</span></div>',
		scope: {
			myTags: '=',
		},
		controller: function($scope) {
		},
		link: function(scope, element, attrs) {
			scope.tags = scope.myTags.split('&');
			scope.tag = function(t){
				switch(t){
					case '单程':
						return 'label label-success';
					case '往返':
						return 'label label-primary';
					case '门票':
						return 'label label-warning';
					default:
						return 'label label-info';
						break;
				}
			}
		}
	}
}]);