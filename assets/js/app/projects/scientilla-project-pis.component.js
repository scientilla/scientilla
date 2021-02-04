(function () {
    "use strict";

    angular
        .module('projects')
        .component('scientillaProjectPis', {
            templateUrl: 'partials/scientilla-project-pis.html',
            controller: controller,
            controllerAs: 'vm',
            bindings: {
                project: '<',
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

            for (const pi of vm.project.pi) {
                const user = vm.project.verifiedUsers.find(u => u.username === pi.email.toLowerCase());

                if (user) {
                    vm.pis.push(user);
                } else {
                    vm.pis.push(pi);
                }

                if (vm.collapsed && count === vm.project.getPILimit()) {
                    break;
                }

                count++;
            }
        }
    }
})();