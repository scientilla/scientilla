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

            getPIs();
        };

        vm.toggleCollapse = toggleCollapse;

        vm.getAlias = UserService.getAlias;

        function toggleCollapse() {
            vm.collapsed = !vm.collapsed;

            getPIs();
        }

        function getPIs() {
            let count = 1;
            vm.members = [];

            for (const pi of vm.agreement.pi) {
                const user = vm.agreement.verifiedUsers.find(u => u.username === pi.email.toLowerCase());

                if (user) {
                    vm.pis.push(user);
                } else {
                    vm.pis.push(pi);
                }

                if (vm.collapsed && count === vm.agreement.getPILimit()) {
                    break;
                }

                count++;
            }
        }
    }
})();