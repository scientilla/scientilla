(function () {
    'use strict';

    angular.module('components')
            .component('scientillaCheckable', {
                templateUrl: 'partials/scientillaCheckable.html',
                controller: scientillaCheckable,
                controllerAs: 'vm',
                bindings: {
                    item: '<'
                },
                transclude: true,
                require: {
                    scientillaMulticheck: '^scientillaMulticheck'
                }
            });



    scientillaCheckable.$inject = [
        '$scope'
    ];

    function scientillaCheckable($scope) {

        var vm = this;
        vm.isChecked = false;
        this.getItem = getItem;

        this.$onInit = function () {
            this.scientillaMulticheck.registerCheckable(vm);
        };

        $scope.$on('$destroy', function () {
            vm.scientillaMulticheck.unregisterCheckable(vm);
        });

        function getItem() {
            return vm.item;
        }

    }

})();