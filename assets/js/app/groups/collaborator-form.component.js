/* global angular */

(function () {

    angular
        .module('groups')
        .component('collaboratorForm', {
            templateUrl: 'partials/collaborator-form.html',
            controller: CollaboratorForm,
            controllerAs: 'vm',
            bindings: {
                group: "<",
                collaborator: "<",
                checkAndClose: "&",
            }
        });

    CollaboratorForm.$inject = [
        'UsersService',
        'GroupsService',
        'Notification'
    ];

    function CollaboratorForm(
        UsersService,
        GroupsService,
        Notification
    ) {
        const vm = this;

        vm.getUsers = getUsers;
        vm.addCollaborator = addCollaborator;
        vm.cancel = cancel;

        vm.selectedUserActive = true;

        let originalCollaboratorJson = JSON.stringify(false);

        vm.$onInit = function () {
            if (vm.collaborator) {
                vm.selectedUser = vm.collaborator;
                vm.selectedUserActive = vm.selectedUser.membership.active;
                originalCollaboratorJson = angular.toJson(vm.collaborator);
            }
        };

        function getUsers(searchText) {
            const qs = {where: {or: [
                {name: {contains: searchText}},
                {surname: {contains: searchText}},
                {displayName: {contains: searchText}},
                {displaySurname: {contains: searchText}}
            ]}};
            return UsersService.getUsers(qs);
        }

        /* jshint ignore:start */
        async function addCollaborator(group, user, active) {
            try {
                if (vm.collaborator) {
                    await GroupsService.updateCollaborator(group, user, active);
                    Notification.success('Membership the collaborator is been updated!');
                } else {
                    await GroupsService.addCollaborator(group, user, active);
                    Notification.success('Collaborator is been added!');
                }
            } catch (e) {
                Notification.warning('There already is a membership for this user and group!');
                return;
            }

            delete vm.selectedUser;

            if (_.isFunction(vm.checkAndClose())) {
                vm.checkAndClose()(() => true);
            }
        }
        /* jshint ignore:end */

        function cancel() {
            if (_.isFunction(vm.checkAndClose())) {
                vm.checkAndClose()(() => !vm.selectedUser || (
                    originalCollaboratorJson === angular.toJson(vm.selectedUser) &&
                    vm.selectedUser.membership.active === vm.selectedUserActive
                ));
            }
        }
    }
})();
