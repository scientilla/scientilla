(function () {
    'use strict';

    angular.module('components')
        .component('scientillaDocumentSearchView', {
            templateUrl: 'partials/scientilla-document-search-view.html',
            controller: scientillaDocumentSearchView,
            controllerAs: 'vm',
            bindings: {
                resolve: '<'
            },
        });

    scientillaDocumentSearchView.$inject = [
        'context',
        'ModalService'
    ];

    function scientillaDocumentSearchView(context, ModalService) {
        const vm = this;
        vm.copyToDrafts = copyToDrafts;
        vm.cancel = cancel;
        vm.back = back;

        const DocumentService = context.getDocumentService();

        vm.$onInit = function () {
            console.log(vm.resolve);
            vm.document = vm.resolve.data.document;
        };

        function copyToDrafts() {
            DocumentService.copyDocument(vm.document);
            close();
        }

        function cancel() {
            close();
        }

        function back() {
            close();
            ModalService.openScientillaDocumentSearch();
        }

        function close(){
            if (_.isFunction(vm.resolve.callbacks.onClose))
                vm.resolve.callbacks.onClose();
        }

    }

})();