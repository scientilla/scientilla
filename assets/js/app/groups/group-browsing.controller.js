(function () {
    angular
            .module('groups')
            .controller('GroupBrowsingController', GroupBrowsingController);

    GroupBrowsingController.$inject = [
        '$location',
        'GroupsService',
        'AuthService',
        '$uibModal'
    ];

    function GroupBrowsingController($location, GroupsService, AuthService, $uibModal) {
        var vm = this;

        vm.user = AuthService.user;
        vm.viewGroup = viewGroup;
        vm.deleteGroup = deleteGroup;
        vm.editGroup = editGroup;
        vm.createNew = createNew;

        activate();

        function activate() {
            return getGroups().then(function () {

            });
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
            $location.path('/groups/'+g.id);
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

            $uibModal.open({
                animation: true,
                templateUrl: 'partials/group-form.html',
                controller: 'GroupFormController',
                controllerAs: "vm",
                resolve: {
                    group: function () {
                        return !group ? GroupsService.getNewGroup() : group.clone();
                    }
                }
            })
                    .result
                    .then(function () {
                        getGroups();
                    });
        }
        
    }
})();