(function () {
    angular
        .module('groups')
        .component('scientillaGroupGroups', {
            controller: controller,
            templateUrl: 'partials/scientilla-group-groups.html',
            controllerAs: 'vm',
            bindings: {
                group: '<',
                refreshGroup: '&'
            }
        });

    controller.$inject = [
        "GroupsService",
        "AuthService",
        "ModalService"
    ];

    function controller(GroupsService, AuthService, ModalService) {
        const vm = this;
        vm.addChild = addChild;
        vm.removeChild = removeChild;
        vm.getGroups = getGroups;
        vm.isAdmin = isAdmin;

        vm.$onInit = function () {
            vm.selectedGroup = undefined;
        };

        function getGroups(searchText) {
            const qs = {where: {name: {contains: searchText}}};
            return GroupsService.getGroups(qs);
        }

        function addChild() {
            GroupsService.addRelative(vm.group, vm.selectedGroup)
                .then(() => {
                    delete vm.selectedGroup;
                    return vm.refreshGroup()();
                });
        }

        function removeChild(child) {
            ModalService
                .multipleChoiceConfirm('Removing group member',
                    `Are you sure you want to remove ${child.getDisplayName()} from the group members?`,
                    ['Proceed'])
                .then(function (buttonIndex) {
                    switch (buttonIndex) {
                        case 0:
                            return GroupsService.removeChild(vm.group, child)
                                .then(() => vm.refreshGroup()());
                    }
                });
        }

        function isAdmin() {
            return AuthService.isAdmin;
        }

    }
})();
