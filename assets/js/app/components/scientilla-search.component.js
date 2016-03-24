(function () {
    'use strict';

    angular.module('components')
            .component('scientillaSearch', {
                templateUrl: 'partials/scientillaSearch.html',
                controller: scientillaSearchController,
                controllerAs: 'vm',
                bindings: {
                    formStructure: '<',
                    onSearch: '&'
                }
            });



    scientillaSearchController.$inject = [
    ];

    function scientillaSearchController() {
        var vm = this;

        vm.validationAndViewRules = vm.formStructure;

        vm.search = search;
        vm.reset = reset;

        vm.searchValues = {};


        function search() {

            var where = {};

            _.forEach(this.searchValues,
                    function (value, key) {

                        var struct = vm.formStructure[key];

                        var whereAdd = {};
                        whereAdd[struct.matchColumn] = {};
                        whereAdd[struct.matchColumn][struct.matchRule] = value;

                        where = _.merge(where, whereAdd);
                    });
            vm.onSearch()(where);

        }
        function reset() {
            _.forEach(this.searchValues,
                    function (value, key) {
                        vm.searchValues[key] = '';
                    });
            vm.search();
        }
    }


})();