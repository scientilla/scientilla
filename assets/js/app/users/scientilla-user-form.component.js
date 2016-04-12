/* global Scientilla */

(function () {

    angular
            .module('users')
            .component('scientillaUserForm', {
                templateUrl: 'partials/scientilla-user-form.html',
                controller: UserFormController,
                controllerAs: 'vm',
                bindings: {
                    user: "<",
                    onClose: "&",
                    onSubmit: "&"
                }
            });


    UserFormController.$inject = [
        'UsersService',
        'FormForConfiguration',
        'Notification',
        '$scope',
        'AuthService',
        'GroupsService'
    ];

    function UserFormController(UsersService, FormForConfiguration, Notification, $scope, AuthService, GroupsService) {
        var vm = this;
        vm.getCollaborationsFilter = getCollaborationsFilter;
        vm.getGroupsQuery = GroupsService.getGroupsQuery;
        vm.groupToCollaboration = groupToCollaboration;
        vm.submit = submit;
        vm.close = function () {
            if (_.isFunction(vm.onSubmit()))
                vm.onClose()(vm.user);
        };

        vm.validationAndViewRules = {
            name: {
                inputType: 'text',
                required: true
            },
            surname: {
                inputType: 'text',
                required: true
            },
            username: {
                inputType: 'text',
                required: true
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
            orcidId: {
                inputType: 'text',
                label: 'ORCID ID'
            },
            scopusId: {
                inputType: 'text',
                label: 'Scopus ID'
            }
        };

        if (!vm.user.id) {
            vm.validationAndViewRules.password = {
                inputType: 'password',
                required: true
            };
        }

        if (AuthService.user.role === Scientilla.user.ADMINISTRATOR)
            vm.validationAndViewRules.role = {
                allowBlank: false,
                inputType: 'select',
                label: 'Role',
                required: true,
                values: [
                    {label: 'User', value: Scientilla.user.USER},
                    {label: 'Administrator', value: Scientilla.user.ADMINISTRATOR}
                ]
            };

        activate();


        function activate() {
            FormForConfiguration.enableAutoLabels();

            $scope.$watch('vm.user.name', nameChanged);
            $scope.$watch('vm.user.surname', nameChanged);
            $scope.$watch('vm.user.aliasesStr', aliasesStrChanged);

            initAliasesStr();
            getCollaborations();
        }

        //sTODO to be removed when deep populate exists
        function getCollaborations() {
            return UsersService.getCollaborations(vm.user);
        }

        function submit() {
            UsersService
                    .doSave(vm.user)
                    .then(function (user) {
                        Notification.success("User data saved");
                        if (_.isFunction(vm.onSubmit()))
                            vm.onSubmit()(user);
                    })
                    .catch(function () {
                        Notification.warning("Failed to save user");
                    });
        }

        function nameChanged() {
            if (!vm.user)
                return;
            if (!vm.user.id) {
                vm.user.slug = calculateSlug(vm.user);
                var aliasesStr = vm.user.getAliases();
                vm.user.aliasesStr = aliasesStr.join('; ');
            }
        }

        //sTODO: move all this alias thing in the proper place.
        function initAliasesStr() {
            if (!vm.user || !vm.user.aliases) {
                vm.user.aliasesStr = "";
            } else {
                vm.user.aliasesStr = _.map(vm.user.aliases, "str").join("; ");
            }
        }

        function aliasesStrChanged() {
            if (!vm.user || !vm.user.aliasesStr) {
                vm.user.aliases = [];
                return;
            }
            var aliasesStr = vm.user.aliasesStr.split(";");
            aliasesStr = _.map(aliasesStr, _.trim);
            aliasesStr = _.reject(aliasesStr, _.isEmpty);
            aliasesStr = _.uniq(aliasesStr);
            vm.user.aliases = _.map(aliasesStr, getRealAlias);
        }

        function getRealAlias(aliasStr) {
            return {str: aliasStr};
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
            _.defaults(collaboration, Scientilla.collaboration);
            return collaboration;
        }

    }
})();
