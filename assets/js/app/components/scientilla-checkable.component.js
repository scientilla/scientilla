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
    ];

    function scientillaCheckable() {

        var vm = this;
        vm.isChecked = false;
        this.getItem = getItem;
        
        this.$onInit = function() {
            this.scientillaMulticheck.registerCheckable(vm);
        };
        
        function getItem() {
            return vm.item;
        }

    }

})();