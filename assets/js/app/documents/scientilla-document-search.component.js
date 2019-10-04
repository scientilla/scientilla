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
        'EventsService',
        'researchEntityService',
        'ModalService',
        'Notification',
        'ExternalConnectorService'
    ];

    function scientillaDocumentSearch(EventsService, researchEntityService, ModalService, Notification, ExternalConnectorService) {
        const vm = this;

        vm.doSearch = doSearch;
        vm.cancel = cancel;
        vm.isSearchDisabled = isSearchDisabled;
        vm.getValueExplanation = getValueExplanation;

        vm.getSearchOptions = getSearchOptions;
        vm.status = status();
        vm.searchValueChanged = searchValueChanged;

        vm.origins = [];

        vm.$onInit = function () {
            vm.status.setState('idle');

            vm.search = {};
            vm.origin = null;

            ExternalConnectorService.getConnectors().then((connectors) => {
                vm.connectors = connectors;
                getOrigins();
            });

            EventsService.subscribe(vm, EventsService.CONNECTORS_CHANGED, function (event, connectors) {
                vm.connectors = connectors;
                getOrigins();
            });
        };

        function status() {
            return {
                setState: function (state) {
                    this.state = state;

                    switch (state) {
                        case 'idle':
                            this.message = 'Search';
                            break;
                        case 'searching':
                            this.message = 'Searching';
                            break;
                        default:
                            break;
                    }
                },
                state: 'idle',
                message: 'Search'
            };
        }

        function getOrigins() {
            Object.keys(vm.connectors).forEach(function (connector) {
                Object.keys(vm.connectors[connector]).forEach(function (origin) {
                    if (_.has(vm.connectors[connector][origin], 'searchOptions')) {
                        vm.origins[origin] = {
                            disabled: !vm.connectors[connector].active,
                            label: vm.connectors[connector][origin].label,
                            searchOptions: vm.connectors[connector][origin].searchOptions
                        };
                    }
                });
            });

            if (_.keys(vm.origins).length > 0) {
                vm.origin = Object.keys(vm.origins)[0];
            }

            getSearchOptions();
        }

        function getSearchOptions() {
            vm.searchOptions = null;

            Object.keys(vm.connectors).forEach(function (connector) {
                if (vm.connectors[connector].active) {
                    Object.keys(vm.connectors[connector]).forEach(function (origin) {
                        if (vm.origin === origin && _.keysIn(vm.connectors[connector][origin].searchOptions).length > 0) {
                            vm.searchOptions = vm.connectors[connector][origin].searchOptions;
                        }
                    });
                }
            });

            if (_.keys(vm.searchOptions).length > 0) {
                vm.search.key = Object.keys(vm.searchOptions)[0];
            }
        }

        function doSearch() {
            vm.error = '';
            vm.status.setState('searching');

            researchEntityService.searchExternalDocument(vm.origin, vm.search.key, vm.search.value)
                .then(document => {
                    if (!document.id) throw 'document not found';
                    vm.resolve.callbacks.onClose();
                    return document;
                })
                .then(document => {
                    vm.status.setState('idle');
                    close();
                    ModalService.openScientillaDocumentSearchView(document);
                })
                .catch(err => {
                    vm.error = 'No search results.';
                    vm.status.setState('idle');
                    Notification.warning(vm.error);
                });
        }

        function cancel() {
            close();
        }

        function getValueExplanation() {
            if (vm.origins[vm.origin] &&
                vm.origins[vm.origin].searchOptions[vm.search.key] &&
                vm.origins[vm.origin].searchOptions[vm.search.key].info) {
                return vm.origins[vm.origin].searchOptions[vm.search.key].info;
            }

            return '';
        }

        function isSearchDisabled() {
            return vm.status === 'searching' || !vm.search.value;
        }

        function close() {
            if (_.isFunction(vm.resolve.callbacks.onClose))
                vm.resolve.callbacks.onClose();

        }

        function searchValueChanged() {
            vm.error = '';
        }
    }

})();