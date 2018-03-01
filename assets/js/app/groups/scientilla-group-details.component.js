(function () {
    angular
        .module('groups')
        .component('scientillaGroupDetails', {
            controller: GroupDetailsController,
            templateUrl: 'partials/scientilla-group-details.html',
            controllerAs: 'vm',
            bindings: {
                groupId: '<'
            }
        });

    GroupDetailsController.$inject = [
        "GroupsService",
    ];

    function GroupDetailsController(GroupsService) {
        const vm = this;
        vm.getGroup = getGroup;

        vm.$onInit = function () {
            getGroup();
        };

        function getGroup() {
            return GroupsService.getGroup(vm.groupId)
                .then(group => vm.group = group);
        }


    }
})();
