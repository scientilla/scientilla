angular.module("ngZone", []).run(["$rootScope", "$exceptionHandler", function ($rootScope, $exceptionHandler) {
    var scopePrototype = $rootScope.constructor.prototype;

    var originalApply = scopePrototype.$apply;

    var zoneOptions = {
        afterTask: function () {
            try {
                if(!$rootScope.$$phase) {
                    $rootScope.$digest();
                }
            } catch (e) {
                $exceptionHandler(e);
                throw e;
            }
        }
    };

    scopePrototype.$apply = function () {
        var scope = this;
        var applyArgs = arguments;

        zone.fork(zoneOptions).run(function () {
            originalApply.apply(scope, applyArgs);
        });
    };
}]);