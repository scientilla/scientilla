(function () {
    angular
            .module('users')
            .controller('UserFormController', UserFormController);

    UserFormController.$inject = [
        'UsersService',
        'FormForConfiguration',
        '$scope',
        'user',
        'AuthService',
        '$location',
        'Restangular',
        '$http'
    ];

    function UserFormController(UsersService, FormForConfiguration, $scope, user, AuthService, $location, Restangular, $http) {
        var vm = this;
        vm.user = user;
        vm.removeItem = removeItem;

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
            password: {
                inputType: 'password',
                required: true,
            },
            aliasesStr: {
                inputType: 'text',
                label: 'aliases'
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
            role: {
                allowBlank: false,
                inputType: 'select',
                label: 'Role',
                required: true,
                values: [
                    {label: 'User', value: Scientilla.user.USER},
                    {label: 'Administrator', value: Scientilla.user.ADMINISTRATOR}
                ]
            }
        };

        vm.submit = submit;

        vm.collaborationsSettings = {
            collaborations: [],
            querySearch: querySearch,
            searchText: "",
            selectedItemChange: selectedItemChange
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
            if (!vm.user || !vm.user.id) {
                user.collaborations = [];
                return;
            }
            var userGroupsIds = _.map(vm.user.collaborations, 'id');
            //sTODO: substitute with es6 spread operator, restangularify
//                    Restangular.several('collaborations', ...userGroupsIds)
//                    .get({ user: vm.user.id, populate: 'group' })
//          RESTANGULAR sucks
//            var getCollaborations = _.spread(Restangular.several);
//            var args = userGroupsIds;
//            args.unshift('collaborations');
//            getCollaborations(args)
//                    .get({ user: vm.user.id, populate: 'group' })
            var url = '/collaborations';
            $http.get(url,
                    {
                        params: {user: vm.user.id, populate: 'group'}
                    })
                    .then(function (result) {
                        var collaborations = result.data;
                        user.collaborations = collaborations;
                    });
        }

        function submit() {

            if (_.isUndefined(vm.user.id)) {
                UsersService.post(vm.user);
            } else
                UsersService.put(vm.user);
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
            var fullName = _.trim(name + " " + surname)
            var slug = fullName.toLowerCase().replace(/\s+/gi, '-');
            return slug;
        }

        function removeItem(item) {
            var itemId = item.id;
            var userId = AuthService.user.id;
            var url = '/users/' + userId + '/collaborations/' + itemId;
            $http.delete(url)
                    .then(function () {
                        vm.user.collaborations = _.reject(
                                vm.user.collaborations,
                                function (c) {
                                    return c.id === itemId;
                                });
                    });
        }

        function querySearch(query) {
            var queryStr = '?where={"name":{"contains":"' + query + '"}}';
            var url = '/groups' + queryStr;
            return $http.get(url)
                    .then(function (result) {
                        var users = filterOutUsedGroups(result.data);
                        return users;
                    });
        }

        function filterOutUsedGroups(toBeFiltered) {
            var alreadyUsedIds = _.map(vm.user.collaborations, 'group.id');
            alreadyUsedIds.push(AuthService.userId);
            var users = _.filter(toBeFiltered, function (u) {
                return !_.contains(alreadyUsedIds, u.id);
            });
            return users;
        }

        function selectedItemChange(group) {
            if (!group)
                return;

            vm.collaborationsSettings.searchText = "";
            var collaboration = {user: user.id, group: group};
            vm.user.collaborations.push(collaboration);
        }

    }
})();
