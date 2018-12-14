(function () {
    'use strict';

    angular.module('admin')
        .component('scientillaAdminExternalConnectors', {
            templateUrl: 'partials/scientilla-admin-external-connectors.html',
            controller: controller,
            controllerAs: 'vm',
            bindings: {}
        });

    controller.$inject = [
        'Restangular',
        'Notification',
        'ExternalConnectorService',
        'EventsService'
    ];

    function controller(Restangular, Notification, ExternalConnectorService, EventsService) {
        const vm = this;

        vm.connectors = {
            elsevier: {
                active: false,
                scopus: {},
                scival: {}
            }
        };

        vm.errors = {};

        vm.resetErrors = resetErrors;

        vm.saveElsevier = saveElsevier;

        vm.$onInit = function () {
            ExternalConnectorService.getConnectors().then((connectors) => {
                vm.connectors = connectors;
            });

            EventsService.subscribe(vm, EventsService.CONNECTORS_CHANGED, function (event, connectors) {
                vm.connectors = connectors;
            });
        };

        function saveConnector(connector) {

            ExternalConnectorService.setConnector(connector)
                .then((result) => {
                    switch(connector.type) {
                        case 'elsevier':
                            Notification.success('The elsevier connector is saved!');
                            break;
                        default:
                            break;
                    }

                    EventsService.publish(EventsService.CONNECTORS_CHANGED, result.connectors);
                })
                .catch(() => {
                    Notification.error('An error happened');
                });
        }

        function resetErrors(type) {
            switch(type) {
                case 'elsevier' :
                    vm.errors.elsevier = {
                        scopus: {},
                        scival: {}
                    };
                    break;
                default:
                    break;
            }
        }

        function validateElsevier() {
            vm.errors.elsevier = {
                scopus: {},
                scival: {}
            };

            if (vm.connectors.elsevier.active) {
                if (typeof vm.connectors.elsevier.scopus.url === 'undefined' || vm.connectors.elsevier.scopus.url === '') {
                    vm.errors.elsevier.scopus.url = [];
                    vm.errors.elsevier.scopus.url.push({
                        rule:'required',
                        message: 'This field is required.'
                    });
                }

                if (typeof vm.connectors.elsevier.scopus.apiKey === 'undefined' || vm.connectors.elsevier.scopus.apiKey === '') {
                    vm.errors.elsevier.scopus.apiKey = [];
                    vm.errors.elsevier.scopus.apiKey.push({
                        rule:'required',
                        message: 'This field is required.'
                    });
                }

                if (typeof vm.connectors.elsevier.scopus.token === 'undefined' || vm.connectors.elsevier.scopus.token === '') {
                    vm.errors.elsevier.scopus.token = [];
                    vm.errors.elsevier.scopus.token.push({
                        rule:'required',
                        message: 'This field is required.'
                    });
                }

                if (typeof vm.connectors.elsevier.scival.url === 'undefined' || vm.connectors.elsevier.scival.url === '') {
                    vm.errors.elsevier.scival.url = [];
                    vm.errors.elsevier.scival.url.push({
                        rule:'required',
                        message: 'This field is required.'
                    });
                }

                if (typeof vm.connectors.elsevier.scival.clientKey === 'undefined' || vm.connectors.elsevier.scival.clientKey === '') {
                    vm.errors.elsevier.scival.clientKey = [];
                    vm.errors.elsevier.scival.clientKey.push({
                        rule:'required',
                        message: 'This field is required.'
                    });
                }
            }
        }

        function saveElsevier(){
            validateElsevier();

            if (_.isEmpty(vm.errors.elsevier.scopus) && _.isEmpty(vm.errors.elsevier.scival)) {
                saveConnector({
                    type: 'elsevier',
                    data: vm.connectors.elsevier
                });
            }
        }
    }

})();