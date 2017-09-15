angular.module('app.directives', []).directive("sortName", [ function() {
    return {
        restict : "A",
        link : function(scope, element, attrs) {
            var sortName = attrs["sortName"];
            var sortType = attrs["sortType"];
            if (!angular.isString(sortName) || sortName == "")
                return;
            if (!angular.isString(sortType) || sortType == "") {
                element.removeClass("sorting").removeClass("sorting_asc").removeClass("sorting_desc").addClass("sorting").attr("sort-type","asc");
            }
            $(element).bind("click", function(){
                var thisObj=$(this);
                var sortType = thisObj.attr("sort-type");
                if (!angular.isString(sortName) || sortName == "")
                    return;
                if (!angular.isString(sortType) || sortType == "")
                    return;
                var orderBy = sortName + " " + sortType;
                scope.pageRequest.orderBy=orderBy;
                scope.pageRequest.getResponse();
                if (sortType == "asc") {
                    thisObj.removeClass("sorting").removeClass("sorting_asc").removeClass("sorting_desc").addClass("sorting_asc").attr("sort-type","desc");
                } else if (sortType == "desc") {
                    thisObj.removeClass("sorting").removeClass("sorting_asc").removeClass("sorting_desc").addClass("sorting_desc").attr("sort-type","asc");
                }
                thisObj.siblings().each(function (){
                    var item=$(this);
                    if(typeof(item.attr("sort-name"))!="undefined"){
                        item.removeClass("sorting").removeClass("sorting_asc").removeClass("sorting_desc").addClass("sorting");
                    }

                });
                scope.$apply();
            });
        }
    }
} ]);