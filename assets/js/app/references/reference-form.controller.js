(function () {
    angular
            .module('references')
            .controller('ReferenceFormController', ReferenceFormController);

    ReferenceFormController.$inject = [
        'UsersService',
        'ReferencesService',
        'FormForConfiguration',
        '$http',
        'Restangular',
        'AuthService',
        '$scope',
        '$route',
        '$interval',
        '$rootScope',
        '$location'
    ];

    function ReferenceFormController(UsersService, ReferencesService, FormForConfiguration, $http, Restangular, AuthService, $scope, $route, $interval, $rootScope, $location) {
        var vm = this;
        vm.reference = ReferencesService.getNewReference();
        vm.userId = AuthService.userId;
        vm.suggestions = {};
        vm.removeCollaborator = removeCollaborator;

        vm.validationAndViewRules = {
            title: {
                inputType: 'text',
//                required: true
            },
            authors: {
                inputType: 'text',
//                required: true
            },
            collaborators: {
                collection: {
                    fields: {
                        id: {
                            required: true
                        },
                        name: {
                            required: true
                        },
                        username: {
                            required: true
                        }
                    }
                }
            }
        };

        vm.ta = {
            collaborators: [],
            querySearch: querySearch,
            searchText: "",
            selectedUserChange: selectedUserChange
        };

        vm.submit = submit;

        vm.status = 'saved';

        activate();


        function activate() {
            FormForConfiguration.enableAutoLabels();

            getReference().then(function () {
                $scope.$watch('vm.reference', markModified, true);
                $scope.$watch('vm.reference', _.debounce(saveReference, 3000), true);
                getSuggestedUsers();
            });


        }

        function markModified(newValue, oldValue) {
            if (newValue === oldValue)
                return;
            vm.status = 'unsaved';
        }

        function getSuggestedUsers() {
            return vm.reference.getList('suggested-collaborators')
                    .then(function (suggestedCollaborators) {
                        return vm.suggestions.users = suggestedCollaborators;
                    })
        }

        function saveReference() {
            if (!vm.reference.id)
                return;
            //sTODO refactor
            var url = '/users/' + AuthService.userId + '/references/' + vm.reference.id;
            return $http.put(
                    url,
                    vm.reference
                    ).then(function () {
                vm.status = 'saved';
                return getSuggestedUsers();
            });
        }

        function getReference() {

            var referenceId = $route.current.params.id;

            return Restangular
//                    .one('users', AuthService.userId)
                    .one('references', referenceId)
                    .get({populate: ['collaborators']})
                    .then(function (reference) {
                        vm.reference = reference;
                    });
        }

        function submit() {
            saveReference()
                    .then(function () {
                        $location.path('/references');
                    });
        }

        function removeCollaborator(user) {
            var userId = user.id;
            var referenceId = vm.reference.id;
            var url = '/references/' + referenceId + '/collaborators/' + userId;
            $http.delete(url)
                    .then(function () {
                        console.log(vm.reference.collaborators);
                        vm.reference.collaborators = _.reject(
                                vm.reference.collaborators,
                                function (u) {
                                    return u.id === user.id;
                                });
                        console.log(vm.collaborators);
                    });
        }

        function querySearch(query) {
            var queryStr = '?where={"or" : [    {"name":{"contains":"' + query + '"}},  {"surname":{"contains":"' + query + '"} } ]}';
            var url = '/users/' + queryStr;
            return $http.get(
                    url,
                    {
                        headers: {access_token: AuthService.jwtToken}
                    }
            ).then(function (result) {
                var users = filterOutUsedCollaborators(result.data);
                return users;
            });
        }

        function filterOutUsedCollaborators(toBeFiltered) {
            var alreadyUsedIds = _.map(vm.reference.collaborators, 'id');
            alreadyUsedIds.push(AuthService.userId);
            var users = _.filter(toBeFiltered, function (u) {
                return !_.includes(alreadyUsedIds, u.id);
            });
            return users;
        }

        function selectedUserChange(user) {
            if (!user)
                return;

            vm.ta.searchText = "";
            vm.reference.collaborators.push(user);
            vm.suggestions.users = filterOutUsedCollaborators(vm.suggestions.users);
        }

    }
})();
