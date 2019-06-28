/**
 * Created by Fede on 2/27/2017.
 */

(function () {
    "use strict";
    angular
        .module('documents')
        .component('scientillaButtonNewDocument', {
            templateUrl: 'partials/scientilla-button-new-document.html',
            controller: ScientillaButtonNewDocument,
            controllerAs: 'vm'
        });

    ScientillaButtonNewDocument.$inject = [
        'context',
        'ModalService',
        'DocumentTypesService',
        'ExternalConnectorService',
        'EventsService'
    ];

    function ScientillaButtonNewDocument(context, ModalService, DocumentTypesService, ExternalConnectorService, EventsService) {
        var vm = this;

        vm.createNewDocument = createNewDocument;
        vm.openScientillaDocumentSearch = ModalService.openScientillaDocumentSearch;
        vm.types = DocumentTypesService.getDocumentTypes();

        vm.hasActiveExternalConnectors = false;

        function checkActiveConnectors() {

            vm.hasActiveExternalConnectors = false;

            Object.keys(vm.connectors).forEach(function(connector) {
                if (vm.connectors[connector].active) {
                    vm.hasActiveExternalConnectors = true;
                }
            });
        }

        vm.$onInit = function () {
            ExternalConnectorService.getConnectors().then((connectors) => {
                vm.connectors = connectors;
                checkActiveConnectors();
            });

            EventsService.subscribe(vm, EventsService.CONNECTORS_CHANGED, function (event, connectors) {
                vm.connectors = connectors;
                checkActiveConnectors();
            });
        };

        function createNewDocument(type) {
            const subResearchEntity = context.getSubResearchEntity();
            const draft = subResearchEntity.getNewDocument(type);

            ModalService.openScientillaDocumentForm(draft, subResearchEntity);
        }
    }
})();