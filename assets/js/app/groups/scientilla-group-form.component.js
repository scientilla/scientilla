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
                onSubmit: "&"
            }
        });

    GroupFormController.$inject = [
        'GroupsService',
        'FormForConfiguration',
        'Notification',
        'AuthService',
        '$scope',
        'groupTypes',
        'groupTypeLabels'
    ];

    function GroupFormController(GroupsService, FormForConfiguration, Notification, AuthService, $scope, groupTypes, groupTypeLabels) {
        const vm = this;
        vm.getUsersQuery = getUsersQuery;
        vm.cancel = cancel;

        vm.submit = submit;

        vm.formStructure = {
            name: {
                inputType: 'text',
                label: 'Title',
                defaultValue: vm.group.name,
                ngIf: isAdmin
            },
            slug: {
                inputType: 'text',
                label: 'Slug',
                defaultValue: vm.group.slug,
                ngIf: isAdmin
            },
            shortname: {
                inputType: 'text',
                label: 'Short Name',
                defaultValue: vm.group.shortname
            },
            description: {
                inputType: 'text',
                label: 'Description',
                defaultValue: vm.group.description
            },
            publicationsAcronym: {
                inputType: 'text',
                label: 'Publications: Group Acronym',
                defaultValue: vm.group.publicationsAcronym
            },
            scopusId: {
                inputType: 'text',
                label: 'Scopus ID',
                defaultValue: vm.group.scopusId
            },
            macroarea: {
                inputType: 'attribute',
                label: 'Macroarea',
                defaultValue: vm.group.attributes,
                mode: 'single',
                category: 'macroarea'
            },
            type: {
                inputType: 'select',
                label: 'Group Type',
                defaultValue: vm.group.type || groupTypes.RESEARCH_LINE,
                values: Object.keys(groupTypes).map(k => ({label: groupTypeLabels[k], value: groupTypes[k]})),
                ngIf: isAdmin
            }
        };

        vm.$onInit = function () {
            delete vm.group.members;
            delete vm.group.memberships;
            FormForConfiguration.enableAutoLabels();
            $scope.$watch('vm.group.name', nameChanged);
        };

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

            vm.group.attributes = group.macroarea;
            delete group.macroarea;


            for (const key of Object.keys(vm.formStructure))
                vm.group[key] = group[key];

            if (!vm.group.slug)
                vm.group.slug = calculateSlug(group);

            GroupsService.doSave(vm.group)
                .then(function () {
                    Notification.success("Group data saved");
                    if (_.isFunction(vm.onSubmit()))
                        vm.onSubmit()(1);
                })
                .catch(function () {
                    Notification.warning("Failed to save group");
                    executeOnFailure();
                });
        }

        function getUsersQuery(searchText) {
            const qs = {where: {or: [{name: {contains: searchText}}, {surname: {contains: searchText}}]}};
            const model = 'users';
            return {model: model, qs: qs};
        }


        function cancel() {
            executeOnSubmit(0);
        }

        function executeOnSubmit(i) {
            if (_.isFunction(vm.onSubmit()))
                vm.onSubmit()(i);
        }

        function executeOnFailure() {
            if (_.isFunction(vm.onFailure()))
                vm.onFailure()();
        }

        function isAdmin(){
            return AuthService.user.isAdmin();
        }
    }
})();
