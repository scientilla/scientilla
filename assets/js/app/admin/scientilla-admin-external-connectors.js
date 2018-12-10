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
        'Notification'
    ];

    function controller(Restangular, Notification) {
        const vm = this;

        vm.connectors = {
            scopus: {
                active: false
            },
            scival: {
                active: false
            }
        };

        vm.errors = {};

        vm.resetErrors = resetErrors;

        vm.saveScopus = saveScopus;
        vm.saveScival = saveScival;

        vm.$onInit = function () {
            getConnectors();
        };

        function getConnectors() {
            return Restangular.one('external-connectors')
                .get()
                .then(connectors => {
                    vm.connectors.scopus = connectors.scopus;
                    vm.connectors.scival = connectors.scival;
                });
        }

        function saveConnector(connector) {
            let formData = new FormData();
            formData.append('connector', JSON.stringify(connector));

            Restangular.one('external-connector')
                .customPOST(formData, '', undefined, {'Content-Type': undefined})
                .then(res => {
                    switch(connector.type) {
                        case 'scopus':
                            Notification.success('Scopus connector saved!');
                            break;
                        case 'scival':
                            Notification.success('SciVal connector saved!');
                            break;
                        default:
                            break;
                    }
                })
                .catch(() => {
                    Notification.error('An error happened');
                });
        }

        function resetErrors(type) {
            switch(type) {
                case 'scopus' :
                    vm.errors.scopus = {};
                    break;
                case 'scival' :
                    vm.errors.scival = {};
                    break;
                default:
                    break;
            }
        }

        function validateScopus() {
            vm.errors.scopus = {};

            if (vm.connectors.scopus.active) {
                if (typeof vm.connectors.scopus.url === 'undefined' || vm.connectors.scopus.url === '') {
                    vm.errors.scopus.url = [];
                    vm.errors.scopus.url.push({
                        rule:'required',
                        message: 'This field is required.'
                    });
                }

                if (typeof vm.connectors.scopus.api === 'undefined' || vm.connectors.scopus.api === '') {
                    vm.errors.scopus.api = [];
                    vm.errors.scopus.api.push({
                        rule:'required',
                        message: 'This field is required.'
                    });
                }

                if (typeof vm.connectors.scopus.token === 'undefined' || vm.connectors.scopus.token === '') {
                    vm.errors.scopus.token = [];
                    vm.errors.scopus.token.push({
                        rule:'required',
                        message: 'This field is required.'
                    });
                }
            }
        }

        function validateScival() {
            vm.errors.scival = {};

            if (vm.connectors.scival.active) {
                if (typeof vm.connectors.scival.url === 'undefined' || vm.connectors.scival.url === '') {
                    vm.errors.scival.url = [];
                    vm.errors.scival.url.push({
                        rule:'required',
                        message: 'This field is required.'
                    });
                }

                if (typeof vm.connectors.scival.client === 'undefined' || vm.connectors.scival.client === '') {
                    vm.errors.scival.client = [];
                    vm.errors.scival.client.push({
                        rule:'required',
                        message: 'This field is required.'
                    });
                }
            }
        }

        function saveScopus(){
            validateScopus();

            if (_.isEmpty(vm.errors.scopus)) {
                saveConnector({
                    type: 'scopus',
                    data: vm.connectors.scopus
                });
            }
        }

        function saveScival(){
            validateScival();

            if (_.isEmpty(vm.errors.scival)) {
                saveConnector({
                    type: 'scival',
                    data: vm.connectors.scival
                });
            }
        }
    }

})();