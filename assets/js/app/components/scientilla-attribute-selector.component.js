(function () {
    'use strict';

    angular.module('components')
        .component('scientillaAttributeSelector', {
            templateUrl: 'partials/scientilla-attribute-selector.html',
            controller: scientillaAttributeSelector,
            controllerAs: 'vm',
            bindings: {
                mode: '<',
                category: '<',
                ngModel: '='
            }
        });

    scientillaAttributeSelector.$inject = ['$scope', 'Restangular'];

    function scientillaAttributeSelector($scope, Restangular) {
        const vm = this;
        vm.attributes = [{
            key: null,
            category: null,
            label: 'Select',
        }];
        const deregisteres = [];

        /* jshint ignore:start */
        vm.$onInit = async function () {
            if (!vm.ngModel)
                vm.ngModel = [];

            const selected = vm.mode === 'single' ? vm.ngModel.find(attrFilter(true)) : vm.ngModel.filter(attrFilter(true));

            deregisteres.push($scope.$watch('vm.selected', onChange));

            const attributes = await Restangular.all('attributes').getList({category: vm.category});
            vm.attributes = vm.attributes.concat(Restangular.stripRestangular(attributes));
            if (!_.isArray(selected))
                if (selected && selected.id)
                    vm.selected = vm.attributes.find(a => a.id === selected.id);
                else
                    vm.selected = vm.attributes[0];

            $scope.$apply();
        };
        /* jshint ignore:end */

        vm.$onDestroy = function () {
            for (const deregisterer of deregisteres)
                deregisterer();
        };

        function onChange(newValue) {
            let newModel = vm.ngModel.filter(attrFilter(false));

            if (newValue && newValue.id)
                newModel.push(newValue);
            else if (_.isArray(newValue))
                newModel = newModel.concat(newValue);

            vm.ngModel = newModel;
        }

        function attrFilter(equal) {
            return attr => attr.category === vm.category ^ !equal;
        }

    }

})();