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
        'GroupsService',
        'context'
    ];

    function GroupDetailsController(GroupsService, context) {
        const vm = this;
        vm.researchEntity = context.getResearchEntity();
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
