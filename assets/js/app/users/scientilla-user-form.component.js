(function () {

    angular
        .module('users')
        .component('scientillaUserForm', {
            templateUrl: 'partials/scientilla-user-form.html',
            controller: UserFormController,
            controllerAs: 'vm',
            bindings: {
                user: "<",
                onFailure: "&",
                onSubmit: "&"
            }
        });


    UserFormController.$inject = [
        'UsersService',
        'Notification',
        '$scope',
        'AuthService',
        'GroupsService',
        'Prototyper',
        'userConstants',
        'context',
        'ModalService',
        'ValidateService',
        '$timeout'
    ];

    function UserFormController(UsersService, Notification, $scope, AuthService, GroupsService, Prototyper, userConstants, context, ModalService, ValidateService, $timeout) {
        const vm = this;
        vm.getCollaborationsFilter = getCollaborationsFilter;
        vm.getGroupsQuery = GroupsService.getGroupsQuery;
        vm.groupToCollaboration = groupToCollaboration;
        vm.submit = submit;
        vm.cancel = cancel;
        vm.checkValidation = checkValidation;
        vm.fieldValueHasChanged = fieldValueHasChanged;

        vm.userIsAdmin = AuthService.user.role === userConstants.role.ADMINISTRATOR;
        vm.roleSelectOptions = [
            {label: 'User', value: userConstants.role.USER},
            {label: 'Administrator', value: userConstants.role.ADMINISTRATOR}
        ];
        vm.invalidAttributes = {};
        const deregisteres = [];

        vm.errors = [];
        vm.errorText = '';

        let originalUser = angular.copy(vm.user);

        let timeout;

        const delay = 500;

        vm.$onInit = function () {
            deregisteres.push($scope.$watch('vm.user.name', nameChanged));
            deregisteres.push($scope.$watch('vm.user.surname', nameChanged));
            getCollaborations();

            // Listen to modal closing event
            $scope.$on('modal.closing', function(event, reason) {
                cancel(event, reason);
            });

            if (!_.isArray(originalUser.aliases)) {
                originalUser.aliases = [];
            }
        };

        vm.$onDestroy = function () {
            for (const deregisterer of deregisteres)
                deregisterer();
        };

        //sTODO to be removed when deep populate exists
        function getCollaborations() {
            UsersService.getCollaborations(originalUser);
            return UsersService.getCollaborations(vm.user);
        }

        function checkValidation(field = false) {
            const requiredFields = [
                'username',
                'name',
                'surname'
            ];

            if (field) {
                vm.errors[field] = ValidateService.validate(vm.user, field, requiredFields);

                if (typeof vm.errors[field] === 'undefined') {
                    delete vm.errors[field];
                }
            } else {
                vm.errors = ValidateService.validate(vm.user, false, requiredFields);
            }

            if (Object.keys(vm.errors).length > 0) {
                vm.errorText = 'Please correct the errors on this form!';
            } else {
                vm.errorText = '';
            }
        }

        function fieldValueHasChanged(field = false) {
            $timeout.cancel(timeout);

            timeout = $timeout(function () {
                checkValidation(field);
            }, delay);
        }

        function submit() {

            checkValidation();

            if (Object.keys(vm.errors).length > 0) {
                return;
            }

            UsersService
                .doSave(vm.user)
                .then(function (res) {
                    if (res.data && res.data.invalidAttributes) {
                        var errors = res.data.invalidAttributes;
                        vm.errors = {};

                        angular.forEach(errors, function(fields, fieldIndex) {
                            angular.forEach(fields, function(error, errorIndex) {
                                if (error.rule === 'required'){
                                    error.message = 'This field is required.';
                                    errors[fieldIndex][errorIndex] = error;
                                }
                            });

                            vm.errors[fieldIndex] = errors[fieldIndex];
                        });

                        vm.errorText = 'Please correct the errors on this form!';
                    } else {
                        Notification.success("User data saved");
                        originalUser = angular.copy(vm.user);
                        aliasesChanged();
                        if (_.isFunction(vm.onSubmit()))
                            vm.onSubmit()(1);
                    }
                    
                }).catch(function () {
                    Notification.warning("Failed to save user");
                    executeOnFailure();
                });
        }

        function nameChanged() {
            if (!vm.user)
                return;
            if (!vm.user.id)
                vm.user.slug = calculateSlug(vm.user);
        }

        function aliasesChanged() {
            const researchEntity = context.getResearchEntity();
            if (researchEntity.getType() === 'user')
                researchEntity.aliases = vm.user.aliases;
        }

        function calculateSlug(user) {
            var name = user.name ? user.name : "";
            var surname = user.surname ? user.surname : "";
            var fullName = _.trim(name + " " + surname);
            var slug = fullName.toLowerCase().replace(/\s+/gi, '-');
            return slug;
        }

        function getCollaborationsFilter() {
            return vm.user.getCollaborationGroups();
        }

        function groupToCollaboration(g) {
            var collaboration = {group: g, user: vm.user.id};
            Prototyper.toCollaborationModel(collaboration);
            return collaboration;
        }

        function cancel(event = false) {
            // Compare the current state with the original state of the user
            if (angular.toJson(vm.user) === angular.toJson(originalUser)) {
                if (!event) {
                    executeOnSubmit(0);
                }
            } else {
                if (event) {
                    // Prevent modal from closing
                    event.preventDefault();
                }

                // Show the unsaved data modal
                ModalService
                    .multipleChoiceConfirm('Unsaved data',
                        `There is unsaved data in the form. Do you want to go back and save this data?`,
                        ['Yes', 'No'],
                        false)
                    .then(function (buttonIndex) {
                        switch (buttonIndex) {
                            case 0:
                                break;
                            case 1:
                                vm.user = angular.copy(originalUser);
                                executeOnSubmit(0);
                                break;
                            default:
                                break;
                        }
                    });
            }
        }

        function executeOnSubmit(i) {
            if (_.isFunction(vm.onSubmit()))
                vm.onSubmit()(i);
        }

        function executeOnFailure() {
            if (_.isFunction(vm.onFailure()))
                vm.onFailure()();
        }

    }
})();
