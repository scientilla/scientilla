(function () {
    angular
            .module('references')
            .controller('ReferenceFormController', ReferenceFormController);

    ReferenceFormController.$inject = [
        'ReferencesService',
        'FormForConfiguration',
        'Restangular',
        'AuthService',
        '$scope',
        '$route',
        '$location',
        '$q'
    ];

    function ReferenceFormController(ReferencesService, FormForConfiguration, Restangular, AuthService, $scope, $route, $location, $q) {
        var vm = this;
        vm.reference = ReferencesService.getNewReference();
        vm.userId = AuthService.userId;
        vm.submit = submit;
        vm.status = 'saved';
        vm.goToBrowsing = goToBrowsing;

        vm.validationAndViewRules = {
            title: {
                inputType: 'text'
            },
            authors: {
                inputType: 'text'
            }
        };

        activate();


        function activate() {
            FormForConfiguration.enableAutoLabels();

            getReference().then(function () {
                watchReference();
            });

        }

        function watchReference() {
            var fieldsToWatch = _.keys(vm.validationAndViewRules);
            _.forEach(fieldsToWatch, function (f) {
                $scope.$watch('vm.reference.' + f, markModified, true);
                $scope.$watch('vm.reference.' + f, _.debounce(saveReference, 3000), true);
            });
        };

        function markModified(newValue, oldValue) {
            if (newValue === oldValue)
                return;
            vm.status = 'unsaved';
        }

        function saveReference() {
            if (!vm.reference.id || vm.status === 'saved')
                return $q(function (resolve) { resolve(vm.reference);});
            return ReferencesService.save(vm.reference).then(function () {
                vm.status = 'saved';
            });
        }

        function getReference() {

            var referenceId = $route.current.params.id;

            return Restangular
                    .one('references', referenceId)
                    .get({populate: ['draftCreator', 'draftGroupCreator']})
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

        //sTODO: refactor
        function goToBrowsing() {
            var url = vm.reference.getDraftCreator().getReferenceBrowsingUrl();
            $location.path(url);
        }

    }
})();