(function () {
    'use strict';

    angular.module('components')
        .component('scientillaFooter', {
            templateUrl: 'partials/scientilla-footer.html',
            controller: scientillaFooter,
            controllerAs: 'vm'
        });

    scientillaFooter.$inject = [
        '$scope',
        'LayoutService'
    ];

    function scientillaFooter($scope, LayoutService) {
        $scope.$watch('$viewContentLoaded', function(event) {
            LayoutService.stickyFooter();
        });
    }

})();