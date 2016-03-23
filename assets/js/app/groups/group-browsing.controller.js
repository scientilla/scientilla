(function () {
    angular
            .module('groups')
            .controller('GroupBrowsingController', GroupBrowsingController);

    GroupBrowsingController.$inject = [
        '$location',
        'GroupsService',
        'AuthService',
        'ModalService'
    ];

    function GroupBrowsingController($location, GroupsService, AuthService, ModalService) {
        var vm = this;

        vm.user = AuthService.user;
        vm.viewGroup = viewGroup;
        vm.deleteGroup = deleteGroup;
        vm.editGroup = editGroup;
        vm.createNew = createNew;

        activate();

        function activate() {
            return getGroups();
        }

        function createNew() {
            openGroupForm();
        }

        function getGroups() {
            return GroupsService.getList({populate: ['memberships', 'administrators']})
                    .then(function (data) {
                        vm.groups = data;
                        return vm.groups;
                    });
        }

        function viewGroup(g) {
            $location.path('/groups/' + g.id);
        }

        function deleteGroup(group) {
            group.remove()
                    .then(function () {
                        _.remove(vm.groups, group);
                    });
        }

        function editGroup(group) {
            openGroupForm(group);
        }



        // private
        function openGroupForm(group) {
            ModalService
                    .openScientillaGroupForm(!group ? GroupsService.getNewGroup() : group.clone())
                    .then(function () {
                        getGroups();
                    });
        }

    }
})();