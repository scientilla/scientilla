(function () {
    angular
            .module('groups')
            .controller('GroupBrowsingController', GroupBrowsingController);

    GroupBrowsingController.$inject = [
        'GroupsService',
        'AuthService',
        '$mdDialog'
    ];

    function GroupBrowsingController(GroupsService, AuthService, $mdDialog) {
        var vm = this;

        vm.user = AuthService.user;
        vm.deleteGroup = deleteGroup;
        vm.editGroup = editGroup;
        vm.createNew = createNew;

        activate();

        function activate() {
            return getGroups().then(function () {

            });
        }
        
        function createNew($event) {
            $mdDialog.show({
                controller: "GroupFormController",
                templateUrl: "partials/group-form.html",
                controllerAs: "vm",
                parent: angular.element(document.body),
                targetEvent: $event,
                locals: {
                    group: GroupsService.getNewGroup()
                },
                fullscreen: true,
                clickOutsideToClose: true
            })
                    .then(function () {
                        getGroups();
                    });
        }

        function getGroups() {
            return GroupsService.getList({populate: ['memberships', 'administrators']})
                    .then(function (data) {
                        vm.groups = data;
                        return vm.groups;
                    });
        }

        function deleteGroup(group) {
            group.remove()
                    .then(function () {
                        _.remove(vm.groups, group);
                    });
        }

        function editGroup($event, group) {
            $mdDialog.show({
                controller: "GroupFormController",
                templateUrl: "partials/group-form.html",
                controllerAs: "vm",
                parent: angular.element(document.body),
                targetEvent: $event,
                locals: {
                    group: group.clone()
                },
                fullscreen: true,
                clickOutsideToClose: true
            })
                    .then(function () {
                        getGroups();
                    });
        }
    }
})();