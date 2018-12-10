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
    ];

    function controller() {
        const vm = this;

        vm.scopus = {
            active: false
        };
        vm.scival = {
            active: false
        };

        vm.errors = {};

        vm.resetErrors = resetErrors;

        vm.saveScopus = saveScopus;
        vm.saveScival = saveScival;

        vm.$onInit = function () {
        };

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

            if (vm.scopus.active) {
                if (typeof vm.scopus.url === 'undefined' || vm.scopus.url === '') {
                    vm.errors.scopus.url = [];
                    vm.errors.scopus.url.push({
                        rule:'required',
                        message: 'This field is required.'
                    });
                }

                if (typeof vm.scopus.api === 'undefined' || vm.scopus.api === '') {
                    vm.errors.scopus.api = [];
                    vm.errors.scopus.api.push({
                        rule:'required',
                        message: 'This field is required.'
                    });
                }

                if (typeof vm.scopus.token === 'undefined' || vm.scopus.token === '') {
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

            if (vm.scival.active) {
                if (typeof vm.scival.url === 'undefined' || vm.scival.url === '') {
                    vm.errors.scival.url = [];
                    vm.errors.scival.url.push({
                        rule:'required',
                        message: 'This field is required.'
                    });
                }

                if (typeof vm.scival.client === 'undefined' || vm.scival.client === '') {
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

            if (!_.isEmpty(vm.errors.scopus)) {
                // Try to save
            }
        }

        function saveScival(){
            validateScival();

            if (!_.isEmpty(vm.errors.scival)) {
                // Try to save
            }
        }
    }

})();