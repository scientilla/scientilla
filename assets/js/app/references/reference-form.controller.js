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
        '$location'
    ];

    function ReferenceFormController(UsersService, ReferencesService, FormForConfiguration, $http, Restangular, AuthService, $scope, $route, $location) {
        var vm = this;
        vm.reference = ReferencesService.getNewReference();
        vm.userId = AuthService.userId;
        vm.getUsersQuery = getUsersQuery;
        vm.getCollaboratorsFilter = getCollaboratorsFilter;
        vm.submit = submit;
        vm.status = 'saved';

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
                        _.forEach(suggestedCollaborators, function(c) {
                            _.defaults(c, Scientilla.user);
                        })
                        return vm.reference.suggestedCollaborators = suggestedCollaborators;
                    });
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
                        //sTODO: refactor
                        $location.path('users' + AuthService.user + '/references');
                    });
        }
        
        function getUsersQuery(searchText) {
            var qs = {where: { or: [{ name : {contains: searchText}}, { surname : {contains: searchText}}]}};
            var model = 'users';
            return {model: model, qs:qs};
        }
        
        function getCollaboratorsFilter() {
            return _.union(vm.reference.collaborators, [AuthService.user]);
        }

    }
})();