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

        vm.connectors = {};

        vm.errors = {};

        vm.resetErrors = resetErrors;

        vm.save = save;

        vm.reset = reset;

        vm.$onInit = function () {
            ExternalConnectorService.getConnectors().then((connectors) => {
                vm.connectors = connectors;
            });

            EventsService.subscribe(vm, EventsService.CONNECTORS_CHANGED, function (event, connectors) {
                vm.connectors = connectors;
            });
        };

        function saveConnectors(connectors) {
            ExternalConnectorService.setConnectors(connectors)
                .then((result) => {
                    Notification.success('The connectors are saved!');
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
            }
        }

        function save(){
            validateElsevier();

            if (_.isEmpty(vm.errors.elsevier.scopus)) {
                saveConnectors(vm.connectors);
            }
        }

        function reset() {
            ExternalConnectorService.resetConnectors().then(result => {
                EventsService.publish(EventsService.CONNECTORS_CHANGED, result.connectors);

                if (result.type === 'success') {
                    Notification.success(result.message);
                } else {
                    Notification.warning(result.message);
                }
            });
        }
    }

})();