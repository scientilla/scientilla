(function () {
    angular
            .module('references')
            .controller('ReferenceCreationController', ReferenceCreationController);

    ReferenceCreationController.$inject = [
        'AuthService',
        'ReferencesService',
        '$scope',
        '$location',
        'reference',
        'researchEntity'
    ];

    function ReferenceCreationController(AuthService, ReferencesService, $scope, $location, reference, researchEntity) {
        activate();

        function activate() {
            researchEntity.all('references').post(reference).then(function (r) {
                var referenceId = r.id;
                $location.path('/references/' + referenceId + '/edit');
            });

        }
    }

})();
