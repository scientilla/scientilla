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
        'userConstants'
    ];

    function UserFormController(UsersService, Notification, $scope, AuthService, GroupsService, Prototyper, userConstants) {
        var vm = this;
        vm.getCollaborationsFilter = getCollaborationsFilter;
        vm.getGroupsQuery = GroupsService.getGroupsQuery;
        vm.groupToCollaboration = groupToCollaboration;
        vm.submit = submit;
        vm.cancel = cancel;
        vm.userIsAdmin = AuthService.user.role === userConstants.role.ADMINISTRATOR;
        vm.roleSelectOptions = [
            {label: 'User', value: userConstants.role.USER},
            {label: 'Administrator', value: userConstants.role.ADMINISTRATOR}
        ];

        const deregisteres = [];

        vm.$onInit = function () {
            deregisteres.push($scope.$watch('vm.user.name', nameChanged));
            deregisteres.push($scope.$watch('vm.user.surname', nameChanged));
            deregisteres.push($scope.$watch('vm.user.aliasesStr', aliasesStrChanged));

            initAliasesStr();
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
            Prototyper.toCollaborationModel(collaboration);
            return collaboration;
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
