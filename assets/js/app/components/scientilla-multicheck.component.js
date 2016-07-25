(function () {
    'use strict';

    angular.module('components')
            .component('scientillaMulticheck', {
                templateUrl: 'partials/scientillaMulticheck.html',
                controller: scientillaMulticheckController,
                controllerAs: 'vm',
                bindings: {
                    'items': '<'
                },
                transclude: {
                    'item-list': 'itemList',
                    'buttons': 'buttons'
                }
            });



    scientillaMulticheckController.$inject = [
    ];

    function scientillaMulticheckController() {
        var vm = this;
        vm.registerCheckable = registerCheckable;
        vm.getCheckedItems = getCheckedItems;
        vm.areElementsSelected = areElementsSelected;
        vm.selectAll = selectAll;
        vm.allSelected = false;

        var checkables = [];
        
        function registerCheckable(checkable) {
            checkables.push(checkable);
        }
        
        function getCheckedItems() {
            return checkables
                    .filter(function (c) {
                        return c.isChecked;
                    })
                    .map(function (c) {
                        return c.getItem();
                    });
        }
        
        function selectAll() {
            function setAllCheckables(newVal) {
                checkables.forEach(function(c) {
                    c.isChecked = newVal;
                });
            }
            var allCheckablesSelected = checkables.every(function(c) {
                return c.isChecked;
            });
            if (vm.allSelected && !allCheckablesSelected)
                setAllCheckables(true);
            if (! vm.allSelected && allCheckablesSelected)
                setAllCheckables(false);
        }
        
        
        function areElementsSelected() {
            return getCheckedItems().length > 0;
        }
    }

})();