(function () {
    "use strict";

    angular
        .module('documents')
        .component('scientillaDocumentAuthors', {
            templateUrl: 'partials/scientilla-document-authors.html',
            controller: controller,
            controllerAs: 'vm',
            bindings: {
                document: '<',
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