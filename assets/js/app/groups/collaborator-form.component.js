/* global angular */

(function () {

    angular
        .module('groups')
        .component('collaboratorForm', {
            templateUrl: 'partials/collaborator-form.html',
            controller: CollaboratorForm,
            controllerAs: 'vm',
            bindings: {
                groupId: "<",
                collaborator: "<",
                checkAndClose: "&",
            }
        });

    CollaboratorForm.$inject = [
        'UsersService',
        'GroupsService',
        'Notification',
        '$scope',
        'Prototyper'
    ];

    function CollaboratorForm(
        UsersService,
        GroupsService,
        Notification,
        $scope,
        Prototyper
    ) {
        const vm = this;

        vm.getUsers = getUsers;
        vm.addCollaborator = addCollaborator;
        vm.cancel = cancel;
        vm.remove = remove;
        vm.edit = edit;

        vm.selectedUser = null;
        vm.selectedUserActive = true;
        vm.userActiveDisabled = false;
        vm.collaborators = [];
        vm.errorMessage = false;
        vm.selectedCollaborator = null;

        let originalCollaboratorJson = JSON.stringify(false);
        let selectedUserWatcher;

        /* jshint ignore:start */
        vm.$onInit = async function () {
            vm.group = await GroupsService.getGroup(vm.groupId);
            await getCollaborators();

            if (vm.collaborator) {
                vm.selectedCollaborator = vm.collaborator;
                vm.selectedUserActive = vm.collaborator.membership.active;
                originalCollaboratorJson = angular.toJson(vm.collaborator);
                setIsEditing(vm.collaborator);
            }

            selectedUserWatcher = $scope.$watch('vm.selectedUser', (newValue, oldValue) => {
                if (newValue) {
                    vm.errorMessage = false;
                    vm.userActiveDisabled = false;
                    vm.selectedUser = null;
                    vm.selectedCollaborator = null;

                    const membership =  vm.group.memberships.find(m => m.user === newValue.id);

                    if (membership) {
                        switch(true) {
                            case membership.synchronized && membership.active:
                                vm.errorMessage = 'This user is already an active group member!';
                                break;
                            case membership.synchronized && !membership.active:
                                vm.errorMessage = 'This user is already a former group member! You can only add this user as an active collaborator!';
                                vm.selectedUserActive = true;
                                vm.userActiveDisabled = true;
                                vm.selectedCollaborator = _.cloneDeep(newValue);
                                break;
                            case !membership.synchronized:
                                vm.selectedUserActive = membership.active;
                                vm.selectedCollaborator = _.cloneDeep(newValue);
                                break;
                            default:
                                break;
                        }
                    } else {
                        vm.selectedCollaborator = _.cloneDeep(newValue);
                    }

                    setIsEditing(newValue);
                }
            });
        };
        /* jshint ignore:end */

        vm.$destroy = function () {
            if (_.isFunction(selectedUserWatcher)) {
                selectedUserWatcher();
            }
        };

        function setIsEditing(user) {
            if (!user || vm.collaborators.length === 0) {
                return;
            }
            vm.isAlreadyACollaborator = vm.collaborators.find(c => _.has(c, 'user') && c.user.id === user.id);
        }

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
                const membership =  group.memberships.find(m => m.user === user.id);
                if (membership) {
                    await GroupsService.updateCollaborator(group, user, active);
                } else {
                    await GroupsService.addCollaborator(group, user, active);
                }
            } catch (e) {
                Notification.warning('There already is a membership for this user and group!');
                return;
            }

            delete vm.selectedUser;
            delete vm.selectedCollaborator;

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

        /* jshint ignore:start */
        async function remove(membership) {
            await GroupsService.removeMembership(membership.id);
            await getCollaborators();
            Notification.success('Collaborator is been removed!');
        }
        /* jshint ignore:end */

        /* jshint ignore:start */
        async function edit(membership) {
            vm.selectedCollaborator = Prototyper.toUserModel(_.cloneDeep(membership.user));
            vm.selectedCollaborator.membership = membership;
            vm.selectedUserActive = membership.active;
            setIsEditing(membership.user);
        }
        /* jshint ignore:end */

        /* jshint ignore:start */
        async function getCollaborators() {
            vm.collaborators = await GroupsService.getCollaborators(vm.group.id);
            vm.collaborators = vm.collaborators.map(c => {
                c.user = Prototyper.toUserModel(c.user)
                return c;
            });
            return Promise.resolve(vm.collaborators);
        }
        /* jshint ignore:end */

    }
})();
