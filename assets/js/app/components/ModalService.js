(function () {
    angular.module("components").factory("ModalService", ModalService);

    ModalService.$inject = ['$uibModal', '$rootScope'];


    function ModalService($uibModal, $rootScope) {
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

            var modalScope = getScope({
                document: document,
                researchEntity: researchEntity
            });

            service.modal = openModal(
                    '<scientilla-document-form\
                        document="vm.document"\
                        research-entity="vm.researchEntity"\
                        on-close="vm.onClose"\
                        on-submit="vm.onSubmit" >\
                    </scientilla-document-form>',
                    modalScope
                    );

            return service.modal.result;
        };


        function openModal(template, scope) {
            return $uibModal.open({
                animation: true,
                template: template,
                scope: scope
            });
        }

        function getScope(params) {

            var modalScope = $rootScope.$new();

            var callbacks = {
                onClose: service.close,
                onSubmit: service.close

            };

            modalScope.vm = _.merge(callbacks, params);
            return modalScope;

        }

        return service;
    }

}());