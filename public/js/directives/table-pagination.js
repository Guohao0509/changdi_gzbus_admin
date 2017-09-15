angular.module('app.directives').directive("tablePagination", [ function() {
    return {
        restrict : "A",
        link : function(scope, element) {
            return null;
        },
        templateUrl : "tpl/blocks/table-pagination.html"
    }
} ]);
