(function () {
    "use strict";

    angular
        .module('projects')
        .component('scientillaProjectMembers', {
            templateUrl: 'partials/scientilla-project-members.html',
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

        vm.members = [];

        vm.$onInit = () => {
            if (!vm.collapsed) {
                vm.collapsed = true;
            }

            getMembers();
        };

        vm.toggleCollapse = toggleCollapse;

        vm.getAlias = UserService.getAlias;

        function toggleCollapse() {
            vm.collapsed = !vm.collapsed;

            getMembers();
        }

        function getMembers() {
            let count = 1;
            vm.members = [];

            for (const member of vm.project.members) {
                const user = vm.project.verifiedUsers.find(u => u.username === member.email.toLowerCase());

                if (user) {
                    vm.members.push(user);
                } else {
                    vm.members.push(member);
                }

                if (vm.collapsed && count === vm.project.getMemberLimit()) {
                    break;
                }

                count++;
            }
        }
    }
})();