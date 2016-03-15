(function () {
    angular.module("components").factory("ModalService", ModalService);

    ModalService.$inject = ['$uibModal'];


    function ModalService($uibModal) {
        var service = {
            modal: null
        };


        service.dismiss = function (reason) {
            service.modal.dismiss(reason);
            service.modal = null;
        };

        service.close = function (reason) {
            service.modal.close(reason);
            service.modal = null;
        };


        service.openScientillaDocumentForm = function (document, researchEntity) {
            var scopeVars = {
                document: document,
                researchEntity: researchEntity
            };
            
            service.modal = openModal(
                    '<scientilla-document-form\
                        document="vm.document"\
                        research-entity="vm.researchEntity"\
                        on-close="vm.onClose"\
                        on-submit="vm.onSubmit" >\
                    </scientilla-document-form>',
                    scopeVars
                    );

            return service.modal.result;
        };


        function openModal(template, scope) {
            var callbacks = getDefaultCallbacks();
            
            _.defaults(scope,callbacks);
            
            var controller = function() {
                _.assign(this, scope);
            };
            
            return $uibModal.open({
                animation: true,
                template: template,
                controller: controller,
                controllerAs: 'vm'
            });
        }

        function getDefaultCallbacks() {
            var callbacks = {
                onClose: service.close,
                onSubmit: service.close
            };

            return callbacks;
        }

        return service;
    }

}());