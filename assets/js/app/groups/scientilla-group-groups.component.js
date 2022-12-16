(function () {
    angular
        .module('groups')
        .component('scientillaGroupGroups', {
            controller: controller,
            templateUrl: 'partials/scientilla-group-groups.html',
            controllerAs: 'vm',
            bindings: {
                group: '<'
            }
        });

    controller.$inject = [
        "GroupsService",
        "AuthService",
        "ModalService",
        'EventsService'
    ];

    function controller(
        GroupsService,
        AuthService,
        ModalService,
        EventsService
    ) {
        const vm = this;
        vm.addChildGroup = addChildGroup;
        vm.removeChildGroup = removeChildGroup;
        vm.getGroups = getGroups;
        vm.isAdmin = isAdmin;
        vm.selectedChild = false;

        vm.$onInit = function () {
            vm.selectedGroup = undefined;
        };

        function getGroups(searchText) {
            const qs = {where: {name: {contains: searchText}}};
            return GroupsService.getGroups(qs);
        }

        function addChildGroup() {
            vm.selectedChild = _.cloneDeep(vm.selectedGroup);
            GroupsService.addChildGroup(vm.group, vm.selectedGroup)
                .then(() => {
                    delete vm.selectedGroup;
                    EventsService.publish(EventsService.GROUP_UPDATED, vm.group);
                })
                .finally(() => {
                    vm.selectedChild = false;
                });
        }

        function removeChildGroup(child) {
            ModalService
                .multipleChoiceConfirm('Removing group member',
                    `Are you sure you want to remove ${child.getDisplayName()} from the group members?`,
                    {proceed: 'Proceed'})
                .then(function (buttonIndex) {
                    if (buttonIndex === 'proceed') {
                        vm.selectedChild = child;
                        return GroupsService.removeChildGroup(vm.group, child)
                            .then(() => {
                                EventsService.publish(EventsService.GROUP_UPDATED, vm.group);
                            })
                            .finally(() => {
                                vm.selectedChild = false;
                            });
                    }
                });
        }

        function isAdmin() {
            return AuthService.isAdmin;
        }

    }
})();
