(function () {
    "use strict";

    angular
        .module('patents')
        .component('patentAuthors', {
            templateUrl: 'partials/patent-authors.html',
            controller: controller,
            controllerAs: 'vm',
            bindings: {
                patent: '<',
                collapsed: '=?',
                highlighted: '=?'
            },
        });

    controller.$inject = ['$scope'];

    function controller($scope) {
        const vm = this;

        vm.$onInit = () => {
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