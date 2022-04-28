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
        'ValidateService',
        '$timeout',
        'EventsService'
    ];

    function GroupFormController(
        GroupsService,
        Notification,
        AuthService,
        $scope,
        groupTypes,
        groupTypeLabels,
        ValidateService,
        $timeout,
        EventsService
    ) {
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
        const watchers = [];

        const delay = 500;

        const requiredFields = [
            'name'
        ];

        const rules = [];

        const types = _.cloneDeep(groupTypes);
        delete types.PROJECT;

        vm.formStructure = {
            name: {
                inputType: 'text',
                label: 'Title',
                defaultValue: vm.group.name || '',
                disabled: isDisabled(vm.group),
                ngIf: isAdmin,
                required: true,
                type: 'field'
            },
            slug: {
                inputType: 'text',
                label: 'Slug',
                defaultValue: vm.group.slug,
                disabled: isDisabled(vm.group),
                ngIf: isAdmin,
                type: 'field'
            },
            shortname: {
                inputType: 'text',
                label: 'Short Name',
                defaultValue: vm.group.shortname,
                disabled: isDisabled(vm.group),
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
                values: Object.keys(types).map(k => ({label: groupTypeLabels[k], value: types[k]})),
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
                disabled: isDisabled(vm.group),
                ngIf: isAdmin,
                type: 'field'
            },
            onChange: function (values) {
                formValues = values;
                vm.formStructure.name.disabled = isDisabled(values);
                vm.formStructure.slug.disabled = isDisabled(values);
                vm.formStructure.shortname.disabled = isDisabled(values);
                vm.formStructure.active.disabled = isDisabled(values);
            }
        };

        vm.$onInit = function () {
            if (_.has(vm.group, 'id')) {
                vm.formStructure.code.disabled = true;
                vm.formStructure.type.disabled = true;
            } else {
                const newGroupTypes = _.cloneDeep(groupTypes);
                delete newGroupTypes.INSTITUTE;
                delete newGroupTypes.CENTER;
                delete newGroupTypes.RESEARCH_DOMAIN;
                delete newGroupTypes.RESEARCH_LINE;
                delete newGroupTypes.FACILITY;
                delete newGroupTypes.DIRECTORATE;
                delete newGroupTypes.PROJECT;
                vm.formStructure.type.values = Object.keys(newGroupTypes).map(k => ({label: groupTypeLabels[k], value: newGroupTypes[k]}));
                vm.formStructure.type.defaultValue = newGroupTypes.OTHER;
            }

            delete vm.group.members;
            delete vm.group.memberships;

            watchers.push($scope.$watch('vm.group.name', nameChanged));

            const originalGroup = angular.copy(vm.group);
            if (!originalGroup.slug)
                originalGroup.slug = calculateSlug(originalGroup);

            if (originalGroup.type === undefined)
                originalGroup.type = groupTypes.OTHER;

            if (originalGroup.active === undefined)
                originalGroup.active = true;

            originalGroupJson = angular.toJson(originalGroup);
        };

        vm.$onDestroy = function () {
            for (const watcher in watchers) {
                if (_.isFunction(watcher)) {
                    watcher();
                }
            }
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
            if (!field || !_.has(field, 'name') || _.isEmpty(field.name)) {
                return;
            }

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
                    EventsService.publish(EventsService.GROUP_UPDATED);
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

        function isDisabled(group) {
            switch (group.type) {
                case types.INSTITUTE:
                case types.CENTER:
                case types.RESEARCH_DOMAIN:
                case types.RESEARCH_LINE:
                case types.FACILITY:
                case types.DIRECTORATE:
                    return true;
                default:
                    return false;
            }
        }
    }
})();
