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
        var referenceType;
        var vm = this;
        vm.reference = ReferencesService.getNewReference();
        vm.userId = AuthService.userId;
        vm.getUsersQuery = getUsersQuery;
        vm.getCollaboratorsFilter = getCollaboratorsFilter;
        vm.getGroupsQuery = getGroupsQuery;
        vm.getCollaborationsFilter = getCollaborationsFilter;
        vm.submit = submit;
        vm.status = 'saved';
        vm.goToBrowsing = goToBrowsing;

        vm.validationAndViewRules = {
            title: {
                inputType: 'text',
//                required: true
            },
            authors: {
                inputType: 'text',
//                required: true
            },
            status: {
                inputType: 'radio',
                required: true,
                values: [
                    {value: Scientilla.reference.DRAFT, label: 'Draft'},
                    {value: Scientilla.reference.VERIFIED, label: 'Verified'},
                    {value: Scientilla.reference.PUBLIC, label: 'Public'}
                ]
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
                watchReference();
                getSuggestedCollaborators();
            });

        }

        function watchReference() {
            var fieldsToWatch = _.keys(vm.validationAndViewRules);
            _.forEach(fieldsToWatch, function (f) {
                $scope.$watch('vm.reference.' + f, markModified, true);
                $scope.$watch('vm.reference.' + f, _.debounce(saveReference, 3000), true);
            })
        }
        ;

        function markModified(newValue, oldValue) {
            if (newValue === oldValue)
                return;
            vm.status = 'unsaved';
        }

        function getSuggestedCollaborators() {
            return vm.reference.getList('suggested-collaborators')
                    .then(function (suggestedCollaborators) {
                        _.forEach(suggestedCollaborators, function (c) {
                            _.defaults(c, Scientilla.user);
                        });
                        vm.reference.suggestedCollaborators = suggestedCollaborators;
                        return vm.reference;
                    });
        }

        function saveReference() {
            if (!vm.reference.id || vm.status === 'saved')
                return Promise.resolve(vm.reference);
            return ReferencesService.save(vm.reference).then(function () {
                vm.status = 'saved';
                return getSuggestedCollaborators();
            });
        }

        function getReference() {

            var referenceId = $route.current.params.id;

            return Restangular
                    .one('references', referenceId)
                    .get({populate: ['collaborators', 'owner', 'groupOwner', 'groupCollaborations']})
                    .then(function (reference) {
                        vm.reference = reference;
                        return vm.reference;
                    });
        }

        function submit() {
            saveReference().then(function () {
                goToBrowsing();
            });
        }

        //STODO: refactor
        function getUsersQuery(searchText) {
            var qs = {where: {or: [{name: {contains: searchText}}, {surname: {contains: searchText}}]}};
            var model = 'users';
            return {model: model, qs: qs};
        }

        //STODO: refactor
        function getGroupsQuery(searchText) {
            var qs = {where: {or: [{name: {contains: searchText}}, {description: {contains: searchText}}]}};
            var model = 'groups';
            return {model: model, qs: qs};
        }

        function getCollaboratorsFilter() {
            return vm.reference.getRealAuthors();
        }

        function getCollaborationsFilter() {
            return vm.reference.getCollaborations();
        }

        //sTODO: refactor
        function goToBrowsing() {
            var url;
            switch (vm.reference.getType()) {
                case Scientilla.reference.USER_REFERENCE :
                    url = '/users/' + vm.reference.owner.id + '/references';
                    break;
                case Scientilla.reference.GROUP_REFERENCE :
                    url = '/groups/' + vm.reference.groupOwner.id + '/references';
                    break;
                default :
                    url = '/home';
            }
            $location.path(url);
        }

    }
})();