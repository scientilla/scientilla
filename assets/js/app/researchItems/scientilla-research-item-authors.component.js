(function () {
    "use strict";

    angular
        .module('app')
        .component('scientillaResearchItemAuthors', {
            templateUrl: 'partials/scientilla-research-item-authors.html',
            controller,
            controllerAs: 'vm',
            bindings: {
                researchItem: '<',
                collapsed: '=?',
                type: '@?'
            },
        });

    controller.$inject = ['$scope'];

    function controller($scope) {
        const vm = this;

        vm.$onInit = () => {
            if (!vm.type)
                vm.type = 'default';

            if (!vm.collapsed) {
                vm.collapsed = true;
            }
        };

        vm.toggleCollapse = toggleCollapse;

        function toggleCollapse() {
            vm.collapsed = !vm.collapsed;
        }

    }
})();