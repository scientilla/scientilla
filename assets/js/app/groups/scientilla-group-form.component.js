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
        '$scope',
        'Prototyper'
    ];

    function GroupFormController(GroupsService, FormForConfiguration, Notification, $scope, Prototyper) {
        var vm = this;
        vm.getMembers = getMembers;
        vm.getUsersQuery = getUsersQuery;
        vm.userToMembership = userToMembership;
        vm.cancel = cancel;

        vm.submit = submit;
        vm.validationAndViewRules = {
            name: {
                inputType: 'text',
                required: true,
                minlength: 3,
                maxlength: 40
            },
            slug: {
                inputType: 'text',
                required: true,
                minlength: 3,
                maxlength: 40,
                pattern: {
                    rule: /^[a-zA-Z0-9-_]*$/,
                    message: 'The slug must contains only letters, number and dashes'
                }
            },
            shortname: {
                inputType: 'text',
                label: 'Short Name'
            },
            description: {
                inputType: 'text',
                multiline: true
            },
            publicationsAcronym: {
                inputType: 'text',
                label: 'Publications: Group Acronym'
            },
            scopusId: {
                inputType: 'text',
                label: 'Scopus ID'
            }
        };


        activate();


        function activate() {
            FormForConfiguration.enableAutoLabels();
            $scope.$watch('vm.group.name', nameChanged);
        }

        function nameChanged() {
            if (!vm.group)
                return;
            if (!vm.group.id) {
                vm.group.slug = calculateSlug(vm.group);
            }
        }

        function calculateSlug(group) {
            var name = group.name ? group.name : "";
            var slug = name.toLowerCase().replace(/\s+/gi, '-');
            return slug;
        }

        function submit() {
            GroupsService.doSave(vm.group)
                .then(function (group) {
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
            var qs = {where: {or: [{name: {contains: searchText}}, {surname: {contains: searchText}}]}};
            var model = 'users';
            return {model: model, qs: qs};
        }

        function userToMembership(u) {
            return u;
        }

        function getMembers() {
            return vm.group.members;
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
    }
})();
