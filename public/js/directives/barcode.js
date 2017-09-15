angular.module('app.directives').directive('barcode', function($document) {
    return {
        link: function(scope, element, attrs) {
            var id = "J_barcode" + new Date().getTime();
            element[0].id = id;
            JsBarcode("#" + id, scope.$parent.$eval(attrs.ngModel));
            scope.$watch(attrs.ngModel, function(newValue, oldValue) {
                JsBarcode("#" + id, newValue); //重新绘图
            })
        }
    }
});
