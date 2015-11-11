(function () {
    angular
            .module('groups')
            .controller('GroupFormController', GroupFormController);

    GroupFormController.$inject = [
        'GroupsService',
        'FormForConfiguration',
        '$scope',
        'group',
        'AuthService',
        '$location',
        '$http'
    ];

    function GroupFormController(GroupsService, FormForConfiguration, $scope, group, AuthService, $location, $http) {
        var vm = this;
        vm.group = group;
        vm.getUsers = getUsers;
        console.log(group);

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
            }
        };

        vm.submit = submit;

        activate();


        function activate() {
            FormForConfiguration.enableAutoLabels();
            
            getFullMemberships();

            $scope.$watch('vm.group.name', nameChanged);
        }

        //sTODO: to be removed with deep populate
        function getFullMemberships() {
            if (!vm.group || !vm.group.id) {
                return;
            }
            var url = '/memberships';
            $http.get(url,
                    {
                        params: {group: vm.group.id, populate: 'user'}
                    })
                    .then(function (result) {
                        group.memberships = result.data;
                        _.forEach(group.memberships, function(m) {
                            _.defaults(m, Scientilla.membership);
                            _.defaults(m.user, Scientilla.user);
                        });
                    });
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
            if (_.isUndefined(vm.group.id)) {
                console.log('create new group');
                GroupsService.post(vm.group);
            } else
                GroupsService.put(vm.group);
        }

        function getUsers(query) {
            var queryStr = '?where={"or" : [ {"name":{"contains":"' + query + '"}},  {"surname":{"contains":"' + query + '"} } ]}';
            var url = '/users/' + queryStr;
            return $http.get(url)
                    .then(function (result) {
                        var users = filterOutUsedElems(result.data, _.map(vm.group.memberships, 'user'));
                        //sTODO: refactor
                        var memberships = _.map(users, function (u) {
                            _.defaults(u, Scientilla.user);
                            var membership = {group: vm.group.id, user: u};
                            _.defaults(membership, Scientilla.membership);
                            return membership;
                        });
                        return memberships;
                    });
        }

        function filterOutUsedElems(toBeFiltered, filter) {
            var alreadyUsedIds = _.map(filter, 'id');
            var users = _.filter(toBeFiltered, function (u) {
                return !_.includes(alreadyUsedIds, u.id);
            });
            return users;
        }

    }
})();