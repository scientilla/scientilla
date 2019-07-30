/* global angular, Zone*/

angular.module("ngZone", []).run(["$rootScope", "$exceptionHandler", function ($rootScope, $exceptionHandler) {
    const scopePrototype = $rootScope.constructor.prototype;

    const originalApply = scopePrototype.$apply;

    const zoneOptions = {
        name: 'zone',
        onHasTask: () => {
            try {
                if (!$rootScope.$$phase)
                    $rootScope.$digest();
            } catch (e) {
                $exceptionHandler(e);
                throw e;
            }
        }
    };

    scopePrototype.$apply = function () {
        const scope = this;
        const applyArgs = arguments;

        Zone.current.fork(zoneOptions).run(function () {
            originalApply.apply(scope, applyArgs);
        });
    };
}]);