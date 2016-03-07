(function () {
    'use strict';

    angular.module('references')
            .directive('scientillaExternalDocuments', scientillaExternalDocuments);

    function scientillaExternalDocuments() {
        return {
            restrict: 'E',
            templateUrl: 'partials/scientillaExternalDocuments.html',
            controller: scientillaExternalDocumentsController,
            controllerAs: 'vm',
            scope: {},
            bindToController: {
                researchEntity: "="
            }
        };
    }
    
    scientillaExternalDocumentsController.$inject =[
        '$rootScope'
    ];

    function scientillaExternalDocumentsController($rootScope) {
        var vm = this;
        vm.STATUS_WAITING = 0;
        vm.STATUS_LOADING = 1;
        vm.STATUS_READY = 2;
        vm.STATUS_ERROR = 3;
        vm.copyReference = copyReference;
        vm.connectorChanged = connectorChanged;
        vm.reset = reset;

        activate();

        function activate() {
            reset();
        }

        function reset() {
            vm.status = vm.STATUS_WAITING;
            vm.references = [];
        }

        function connectorChanged(connector) {
            vm.status = vm.STATUS_LOADING;
            return getExternalReferences(vm.researchEntity, connector).then(function () {

            });
        }
        ;

        function getExternalReferences(researchEntity, connector) {
            //sTODO move to a service
            return researchEntity.getList('external-references', {connector: connector})
                    .then(function (references) {
                        vm.references = references;
                        vm.status = vm.STATUS_READY;
                    })
                    .catch(function (err) {
                        vm.status = vm.STATUS_ERROR;
                    });
        }

        function copyReference(reference, researchEntity) {
            //sTODO-urgent owner must be changed server-side
            //sTODO move to a service
            var newReference = Scientilla.reference.create(reference, researchEntity);
            researchEntity.post('drafts', newReference)
                    .then(function (draft) {
                        $rootScope.$broadcast("draft.created", draft);
                        _.remove(vm.references, reference);
                    });
        }
    }
})();
