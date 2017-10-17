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
        'documentFieldsRules',
        'context'
    ];

    function UserFormController(UsersService, Notification, $scope, AuthService, GroupsService, Prototyper, userConstants, documentFieldsRules, context) {
        const vm = this;
        vm.getCollaborationsFilter = getCollaborationsFilter;
        vm.getGroupsQuery = GroupsService.getGroupsQuery;
        vm.groupToCollaboration = groupToCollaboration;
        vm.addAlias = addAlias;
        vm.removeAlias = removeAlias;
        vm.submit = submit;
        vm.cancel = cancel;
        vm.userIsAdmin = AuthService.user.role === userConstants.role.ADMINISTRATOR;
        vm.roleSelectOptions = [
            {label: 'User', value: userConstants.role.USER},
            {label: 'Administrator', value: userConstants.role.ADMINISTRATOR}
        ];
        vm.newAlias = '';

        const deregisteres = [];

        vm.$onInit = function () {
            deregisteres.push($scope.$watch('vm.user.name', nameChanged));
            deregisteres.push($scope.$watch('vm.user.surname', nameChanged));
            getCollaborations();
        };

        vm.$onDestroy = function () {
            for (const deregisterer of deregisteres)
                deregisterer();
        };


        //sTODO to be removed when deep populate exists
        function getCollaborations() {
            return UsersService.getCollaborations(vm.user);
        }

        function submit() {
            UsersService
                .doSave(vm.user)
                .then(function (user) {
                    Notification.success("User data saved");
                    aliasesChanged();
                    if (_.isFunction(vm.onSubmit()))
                        vm.onSubmit()(1);
                })
                .catch(function () {
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

        function addAlias(event) {

            function capitalizeAll(str, wordSeparators) {
                function capitalize(str) {
                    return str.charAt(0).toLocaleUpperCase() + str.slice(1);
                }

                let retStr = str.toLocaleLowerCase();
                for (const c of wordSeparators)
                    retStr = retStr.split(c).map(capitalize).join(c);
                return retStr;
            }

            if (event.key === 'Enter') {
                event.preventDefault();

                const newAlias = capitalizeAll(vm.newAlias, [' ', '-', '.']);
                if (newAlias.match(documentFieldsRules.authorsStr.regex)) {
                    vm.user.aliases.push({str: newAlias});
                    vm.newAlias = '';
                }
            }
        }

        function removeAlias(alias) {
            vm.user.aliases = vm.user.aliases.filter(a => a.str !== alias.str);
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
