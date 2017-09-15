/*
 * @directive 日历指令
 * @author    郭浩
 * @usage     <div my-calendar change-date="{{changeDate}}" select-date="selectDate()"></div>
 * @param     change-date: Array[Number]
 * @param     select-date: function
*/

angular.module('app.directives').directive('myCalendar', [function() {
	return {
		restrict: 'A',
		replace: true,
		templateUrl: '../../tpl/blocks/calender.html',
		scope: {
			changeDate: '=',
			selectDate: '&'
		},
		controller: function($scope) {
		},
		link: function(scope, element, attrs) {
			//用于记录日期，显示的时候，根据dateObj中的日期的年月显示
			var dateObj = (function(){
				var _date = new Date();    // 默认为当前系统时间
				return {
				  	getDate : function(){
				    	return _date;
				  	},
				  	setDate : function(date) {
				  	  	_date = date;
				  	}
				};
			})();
			scope.$watch('changeDate', function(newVal, oldVal) {
				showCalendarData();
			});
			function getDateStr(date) {
				var _year = date.getFullYear();
				var _month = date.getMonth() + 1;// 月从0开始计数
				var _d = date.getDate();
				 
				_month = (_month > 9) ? ("" + _month) : ("0" + _month);
				_d = (_d > 9) ? ("" + _d) : ("0" + _d);
				return _year + _month + _d;
			}

			function showCalendarData() {
				var _year = dateObj.getDate().getFullYear();
				var _month = dateObj.getDate().getMonth() + 1;
				var _dateStr = getDateStr(dateObj.getDate());
				var _date = dateObj.getDate().getDate();

				var currentDate = new Date();
				var currentDay = currentDate.getDate();
				var currenYear = currentDate.getFullYear();
				var currenMonth = currentDate.getMonth();
				var dateTime = new Date(currenYear, currenMonth, currentDay).getTime();

				var _tds = 42;
				var _firstDay = new Date(_year, _month - 1, 1);  // 当前月第一天

				// 设置顶部标题栏中的 年、月信息
				scope.titleStr = _dateStr.substr(0, 4) + "年" + _dateStr.substr(4,2) + "月";

				// 设置表格中的日期数据
		    	scope.dateArr = [];
		    	var trArr = [];

				for(var i = 1; i <= _tds; i++) {
					var _thisDay = new Date(_year, _month - 1, i - _firstDay.getDay());
					var _thisDayStr = getDateStr(_thisDay);
					var thisDate = {
						date: _thisDay.getTime()
					}
					if(thisDate.date == dateTime){
						thisDate.className = 'current-day';
					}else if(thisDate.date < dateTime){
						thisDate.className = 'completed';
					}

					if(scope.changeDate&&scope.changeDate.length > 0){
						for(var j = 0, len = scope.changeDate.length; j < len; j++){
							if(thisDate.date == scope.changeDate[j]){
								thisDate.classNameChanged = 'changed';
							}
						}
					}
					trArr.push(thisDate);

					if(i % 7 == 0){
						var isCurrentMonth = isThisMonth(trArr, _month);
						if(isCurrentMonth){
							scope.dateArr.push(trArr);
							trArr = [];
						}
					}
    			}
		  	}
		  	function isThisMonth(arr, currenMonth) {
				var len = arr.length;
				var tmpFirst = new Date(arr[0].date);
				var tmpLast = new Date(arr[len-1].date);
				var monthFirst = tmpFirst.getMonth()+1;
				var monthLast = tmpLast.getMonth()+1;
				for(var m = 0; m < len; m++){
					var monthDate = new Date(arr[m].date);
					if(monthDate.getMonth()+1 != currenMonth){
						arr[m].currentMonthClass = 'other-month';
					}
				}
				if(monthFirst == currenMonth || monthLast == currenMonth){
					return true;
				}else {
					return false;
				}
			}
			scope.toPrevMonth = function(){
				var date = dateObj.getDate();
				dateObj.setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
				showCalendarData();
			}
 
			//点击下个月图标触发
			scope.toNextMonth = function(){
				var date = dateObj.getDate();
				dateObj.setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
				showCalendarData();
			}
			scope.click = function(date){
				scope.selectDate(date);
				for(var i = 0; i < scope.dateArr.length; i++){
					// if(data == )					
				}					
			}
		}
	}
}]);