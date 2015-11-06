(function () {
    angular
            .module('references')
            .controller('ReferenceCreationController', ReferenceCreationController);

    ReferenceCreationController.$inject = [
        'AuthService',
        'ReferencesService',
        '$scope',
        '$location',
        'reference'
    ];

    function ReferenceCreationController(AuthService, ReferencesService, $scope, $location, reference) {

        activate();

        function activate() {
            ReferencesService.post(reference).then(function (r) {
                var referenceId = r.id;
                $location.path('/references/' + referenceId);
            });

        }
    }

})();
