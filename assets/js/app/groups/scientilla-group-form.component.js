/* global angular */

(function () {

    angular
        .module('groups')
        .component('scientillaGroupForm', {
            templateUrl: 'partials/scientilla-group-form.html',
            controller: GroupFormController,
            controllerAs: 'vm',
            bindings: {
                group: "<",
                onFailure: "&",
                onSubmit: "&",
                checkAndClose: "&"
            }
        });

    GroupFormController.$inject = [
        'GroupsService',
        'Notification',
        'AuthService',
        '$scope',
        'groupTypes',
        'groupTypeLabels',
        'ModalService',
        'ValidateService',
        '$timeout'
    ];

    function GroupFormController(GroupsService, Notification, AuthService, $scope, groupTypes, groupTypeLabels, ModalService, ValidateService, $timeout) {
        const vm = this;
        vm.getUsersQuery = getUsersQuery;
        vm.cancel = cancel;
        vm.isValid = isValid;
        vm.submit = submit;
        vm.validate = validate;
        vm.fieldValueHasChanged = fieldValueHasChanged;

        vm.errors = [];
        vm.errorText = '';

        let formValues = {};
        let originalGroupJson = '';
        let timeout;

        const delay = 500;

        const requiredFields = [
            'name'
        ];

        const rules = [];

        vm.formStructure = {
            name: {
                inputType: 'text',
                label: 'Title',
                defaultValue: vm.group.name,
                ngIf: isAdmin,
                required: true,
                type: 'field'
            },
            slug: {
                inputType: 'text',
                label: 'Slug',
                defaultValue: vm.group.slug,
                ngIf: isAdmin,
                type: 'field'
            },
            shortname: {
                inputType: 'text',
                label: 'Short Name',
                defaultValue: vm.group.shortname,
                type: 'field'
            },
            description: {
                inputType: 'text',
                label: 'Description',
                defaultValue: vm.group.description,
                type: 'field'
            },
            scopusId: {
                inputType: 'text',
                label: 'Scopus ID',
                defaultValue: vm.group.scopusId,
                type: 'field'
            },
            type: {
                inputType: 'select',
                label: 'Group Type',
                defaultValue: vm.group.type || groupTypes.RESEARCH_LINE,
                values: Object.keys(groupTypes).map(k => ({label: groupTypeLabels[k], value: groupTypes[k]})),
                ngIf: isAdmin,
                type: 'field'
            },
            code: {
                inputType: 'text',
                label: 'CDR/CODE',
                defaultValue: vm.group.code,
                type: 'field'
            },
            active: {
                inputType: 'select',
                label: 'Active',
                defaultValue: vm.group.active === undefined ? true : vm.group.active,
                values: [
                    {label: 'Yes', value: true},
                    {label: 'No', value: false}
                ],
                ngIf: isAdmin,
                type: 'field'
            },
            onChange: function (values) {
                formValues = values;
            }
        };

        vm.$onInit = function () {
            delete vm.group.members;
            delete vm.group.memberships;
            $scope.$watch('vm.group.name', nameChanged);

            const originalGroup = angular.copy(vm.group);
            if (!originalGroup.slug)
                originalGroup.slug = calculateSlug(originalGroup);

            if (originalGroup.type === undefined)
                originalGroup.type = groupTypes.RESEARCH_LINE;

            if (originalGroup.active === undefined)
                originalGroup.active = true;

            originalGroupJson = angular.toJson(originalGroup);
        };

        function validate(field = false) {
            if (field && field.name) {
                vm.errors[field.name] = ValidateService.validate(formValues, field.name, requiredFields, rules);

                if (typeof vm.errors[field.name] === 'undefined') {
                    delete vm.errors[field.name];
                }
            } else {
                vm.errors = ValidateService.validate(formValues, false, requiredFields, rules);
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
                validate(field);
            }, delay);
        }

        function isValid() {
            return Object.keys(vm.errors).length === 0;
        }

        function nameChanged() {
            if (!vm.group)
                return;
            if (!vm.group.id) {
                vm.group.slug = calculateSlug(vm.group);
            }
        }

        function calculateSlug(group) {
            const name = group.name ? group.name : "";
            return name.toLowerCase().replace(/\s+/gi, '-');
        }

        function submit(group) {
            if (!group) return;

            validate();

            if (Object.keys(vm.errors).length > 0) {
                return;
            }

            updateGroupData();

            GroupsService.doSave(vm.group)
                .then(function () {
                    vm.errorText = '';
                    Notification.success("Group data saved");
                    originalGroupJson = angular.copy(vm.group);
                    if (_.isFunction(vm.onSubmit()))
                        vm.onSubmit()(1);
                }, function (res) {
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
                });
        }

        function getUsersQuery(searchText) {
            const qs = {where: {or: [
                {name: {contains: searchText}},
                {surname: {contains: searchText}},
                {displayName: {contains: searchText}},
                {displaySurname: {contains: searchText}},
            ]}};
            const model = 'users';
            return {model: model, qs: qs};
        }

        function cancel() {
            updateGroupData();
            vm.checkAndClose()(() => originalGroupJson === angular.toJson(vm.group));
        }

        function updateGroupData() {
            for (const key of Object.keys(vm.formStructure)) {
                vm.group[key] = formValues[key];
            }

            if (!vm.group.slug)
                vm.group.slug = calculateSlug(formValues);

        }

        function isAdmin() {
            return AuthService.user.isAdmin();
        }
    }
})();
