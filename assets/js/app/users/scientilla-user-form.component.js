/* global angular */

(function () {
    angular
        .module('users')
        .component('scientillaUserForm', {
            templateUrl: 'partials/scientilla-user-form.html',
            controller: UserFormController,
            controllerAs: 'vm',
            bindings: {
                settings: '<?',
                originalUser: "<",
                onFailure: "&",
                onSubmit: "&",
                checkAndClose: "&"
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
        vm.submit = submit;
        vm.cancel = cancel;
        vm.checkValidation = checkValidation;
        vm.fieldValueHasChanged = fieldValueHasChanged;

        const fields = [
            'username',
            'name',
            'surname',
            'slug',
            'jobTitle',
            'orcidId',
            'scopusId',
            'password',
            'role',
            'config'
        ];

        vm.userIsAdmin = AuthService.user.role === userConstants.role.ADMINISTRATOR;
        vm.roleSelectOptions = [
            {label: 'User', value: userConstants.role.USER},
            {label: 'Administrator', value: userConstants.role.ADMINISTRATOR}
        ];
        vm.scientificSelectOptions = [
            {label: 'Yes', value: true},
            {label: 'No', value: false}
        ];
        vm.invalidAttributes = {};
        const deregisteres = [];

        vm.errors = [];
        vm.errorText = '';
        vm.user = angular.copy(vm.originalUser);
        let originalUserJson = '';
        let timeout;

        const delay = 500;

        vm.title = 'Create a new user';

        vm.$onInit = function () {
            deregisteres.push($scope.$watch('vm.user.name', nameChanged));
            deregisteres.push($scope.$watch('vm.user.surname', nameChanged));

            if (!Array.isArray(vm.user.aliases))
                vm.user.aliases = [];
            originalUserJson = angular.toJson(vm.user);

            if (typeof vm.settings === 'undefined' || vm.settings === false) {
                if (vm.user.id) {
                    vm.title = 'Edit user';
                }
            } else {
                vm.title  = 'Edit user settings';
            }
        };

        vm.$onDestroy = function () {
            for (const deregisterer of deregisteres)
                deregisterer();
        };

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

                        angular.forEach(errors, function (fields, fieldIndex) {
                            angular.forEach(fields, function (error, errorIndex) {
                                if (error.rule === 'required') {
                                    error.message = 'This field is required.';
                                    errors[fieldIndex][errorIndex] = error;
                                }
                            });

                            vm.errors[fieldIndex] = errors[fieldIndex];
                        });

                        vm.errorText = 'Please correct the errors on this form!';
                    } else {
                        Notification.success("User data saved");
                        aliasesChanged();
                        updateUserData();
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
            const subResearchEntity = context.getSubResearchEntity();
            if (subResearchEntity.getType() === 'user')
                subResearchEntity.aliases = vm.user.aliases;
        }

        function calculateSlug(user) {
            const name = user.name ? user.name : "";
            const surname = user.surname ? user.surname : "";
            const fullName = _.trim(name + " " + surname);
            return fullName.toLowerCase().replace(/\s+/gi, '-');
        }

        function cancel() {
            if (_.isFunction(vm.checkAndClose())) {
                vm.checkAndClose()(() => originalUserJson === angular.toJson(vm.user));
            }
        }

        function executeOnFailure() {
            if (_.isFunction(vm.onFailure()))
                vm.onFailure()();
        }

        function updateUserData() {
            const subResearchEntity = context.getSubResearchEntity();
            for (const key of fields) {
                subResearchEntity[key] = vm.user[key];
            }
        }
    }
})();
