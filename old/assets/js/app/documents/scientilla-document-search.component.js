(function () {
    'use strict';

    angular.module('components')
        .component('scientillaDocumentSearch', {
            templateUrl: 'partials/scientilla-document-search.html',
            controller: scientillaDocumentSearch,
            controllerAs: 'vm',
            bindings: {
                resolve: '<'
            },
        });

    scientillaDocumentSearch.$inject = [
        'researchEntityService',
        'ModalService',
        'Notification'
    ];

    function scientillaDocumentSearch(researchEntityService, ModalService, Notification) {
        const vm = this;

        vm.doSearch = doSearch;
        vm.cancel = cancel;
        vm.isSearchDisabled = isSearchDisabled;
        vm.getValueExplanation = getValueExplanation;

        vm.$onInit = function () {
            vm.statuses = {
                IDLE: 'Idle',
                SEARCHING: 'searching'
            };
            vm.status = vm.statuses.IDLE;

            vm.search = {
                key: 'doi',
                value: ''
            };

            vm.origin = 'scopus';
            vm.documentOrigins = [
                {
                    key: 'scopus',
                    label: 'Scopus'
                }
            ];
        };

        function doSearch() {
            if (!vm.search.value)
                return;

            vm.status = 'searching';
            researchEntityService.searchExternalDocument(vm.origin, vm.search.key, vm.search.value)
                .then(document => {
                    if (!document.id) throw 'document not found';
                    vm.resolve.callbacks.onClose();
                    return document;
                })
                .then(document => {
                    vm.status = 'idle';
                    close();
                    ModalService.openScientillaDocumentSearchView(document);
                })
                .catch(err => {
                    vm.status = 'idle';
                    Notification.warning(err);
                });
        }

        function cancel() {
            close();
        }

        function getValueExplanation() {
            if (vm.origin === 'scopus' && vm.search.key === 'originId')
                return '(Numeric identifier in the scopus document URL: e.g., https://www.scopus.com/[..]eid=2-s2.0-<b>84888368243</b>[..])';
            if (vm.origin === 'scopus' && vm.search.key === 'doi')
                return '(e.g., 10.1038/nnano.2013.238)';

            return '';
        }

        function isSearchDisabled() {
            return vm.status === vm.statuses.SEARCHING;
        }

        function close() {
            if (_.isFunction(vm.resolve.callbacks.onClose))
                vm.resolve.callbacks.onClose();

        }

    }

})();