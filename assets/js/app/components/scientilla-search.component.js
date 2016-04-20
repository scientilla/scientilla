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

        _.forEach(vm.formStructure, function (value, key) {
            if (value.defaultValue)
                vm.searchValues[key] = value.defaultValue;
        });


        function search() {

            var where = {};

            _.forEach(this.searchValues,
                    function (value, key) {

                        var struct = vm.formStructure[key];

                        var whereAdd = {};

                        if (struct.matchRule === 'is null') {
                            if (!value)
                                whereAdd[struct.matchColumn] = null;
                        } else {
                            whereAdd[struct.matchColumn] = {};
                            whereAdd[struct.matchColumn][struct.matchRule] = value;
                        }
                        where = _.merge(where, whereAdd);
                    });
            vm.onSearch()(where);

        }
        function reset() {
            _.forEach(this.searchValues,
                    function (value, key) {

                        var struct = vm.formStructure[key];
                        if (struct.defaultValue)
                            vm.searchValues[key] = struct.defaultValue;
                        else
                            vm.searchValues[key] = '';
                    });
            vm.search();
        }
    }


})();