(function () {
    "use strict";

    angular
        .module('agreements')
        .component('scientillaAgreementPis', {
            templateUrl: 'partials/scientilla-agreement-pis.html',
            controller: controller,
            controllerAs: 'vm',
            bindings: {
                agreement: '<',
                collapsed: '=?',
                highlighted: '=?'
            },
        });

    controller.$inject = ['UserService'];

    function controller(UserService) {
        const vm = this;

        vm.pis = [];

        vm.$onInit = () => {
            if (!vm.collapsed) {
                vm.collapsed = true;
            }

            if (_.has(vm.agreement, 'projectData.pis')){
                getPIs();
            }
        };

        vm.toggleCollapse = toggleCollapse;

        vm.getAlias = UserService.getAlias;

        function toggleCollapse() {
            vm.collapsed = !vm.collapsed;

            getPIs();
        }

        function getPIs() {
            let count = 1;

            for (const pi of vm.agreement.projectData.pis) {
                vm.pis.push(pi);

                if (vm.collapsed && count === vm.agreement.getPILimit()) {
                    break;
                }

                count++;
            }
        }
    }
})();
