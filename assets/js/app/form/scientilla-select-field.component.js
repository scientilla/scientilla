(function () {
    'use strict';

    angular.module('scientilla-form')
        .component('scientillaSelectField', {
            templateUrl: 'partials/scientilla-select-field.html',
            controller: scientillaSelectField,
            controllerAs: 'vm',
            bindings: {
                model: '=',
                structure: '<',
                id: '<'
            }
        });

    scientillaSelectField.$inject = ['$scope'];

    function scientillaSelectField($scope) {
        const vm = this;
        vm.cssClass = 'form-control';
        vm.values = [{value: '?', label: 'Select'}];

        let valuesWatcher;

        vm.$onInit = function () {
            if (_.has(vm.structure, 'values')) {
                vm.values = vm.structure.values;
            }

            if (vm.model === undefined || vm.model === null) vm.model = '?';

            valuesWatcher = $scope.$watch('vm.structure.values', function () {
                if (_.has(vm.structure, 'values')) {
                    vm.values = vm.structure.values;
                }
            });
        };

        vm.$onDestroy = () => {
            if (_.isFunction(valuesWatcher)) {
                valuesWatcher();
            }
        };
    }

})();