(function () {

    angular
            .module('groups')
            .component('scientillaGroupForm', {
               templateUrl: 'partials/scientilla-group-form.html',
                controller: GroupFormController,
                controllerAs: 'vm',
                bindings: {
                    group: "<",
                    onClose: "&",
                    onSubmit: "&"
                }
            });

    GroupFormController.$inject = [
        'GroupsService',
        'FormForConfiguration',
        '$scope',
        '$http'
    ];

    function GroupFormController(GroupsService, FormForConfiguration, $scope, $http) {
        var vm = this;
        vm.getMembers = getMembers;
        vm.getUsersQuery = getUsersQuery;
        vm.userToMembership = userToMembership;
        vm.closeDialog = function () {
            vm.onClose()(vm.group);
        };

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
            publicationsAcronym: {
                inputType: 'text',
                label: 'Publications: Group Acronym'
            },
            scopusId: {
                inputType: 'text',
                label: 'Scopus ID'
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
                        vm.group.memberships = result.data;
                        _.forEach(vm.group.memberships, function (m) {
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
            GroupsService.doSave(vm.group)
                    .then(function (group) {
                        vm.onSubmit()(group);
                    });
        }

        function getUsersQuery(searchText) {
            var qs = {where: {or: [{name: {contains: searchText}}, {surname: {contains: searchText}}]}};
            var model = 'users';
            return {model: model, qs: qs};
        }

        function userToMembership(u) {
            var membership = {group: vm.group.id, user: u};
            _.defaults(membership, Scientilla.membership);
            return membership;
        }

        function getMembers() {
            return _.map(vm.group.memberships, 'user');
        }
    }
})();
