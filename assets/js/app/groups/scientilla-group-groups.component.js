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
                    EventsService.publish(EventsService.GROUP_UPDATED, vm.group);
                });
        }

        function removeChild(child) {
            ModalService
                .multipleChoiceConfirm('Removing group member',
                    `Are you sure you want to remove ${child.getDisplayName()} from the group members?`,
                    {proceed: 'Proceed'})
                .then(function (buttonIndex) {
                    if (buttonIndex === 'proceed')
                        return GroupsService.removeChild(vm.group, child)
                            .then(() => EventsService.publish(EventsService.GROUP_UPDATED, vm.group));

                });
        }

        function isAdmin() {
            return AuthService.isAdmin;
        }

    }
})();
