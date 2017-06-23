(function () {
    'use strict';

    angular.module('scientilla-form')
        .component('scientillaComponentForm', {
            templateUrl: 'partials/scientilla-component-form.html',
            controller: scientillaComponentForm,
            controllerAs: 'vm',
            bindings: {
                values: '=',
                structure: '<',
                cssClass: '@',
                onSubmit: '&',
                reset: '='
            },
            transclude: true,
        });

    scientillaComponentForm.$inject = [
        '$scope'
    ];

    function scientillaComponentForm($scope) {
        const vm = this;

        vm.submit = submit;

        let onChangeWatchesDeregisters = [];
        let onStructureChangeDeregisterer;

        vm.$onInit = function () {
            setDefault();
            clearNil();
            vm.reset = reset;

            onStructureChangeDeregisterer = $scope.$watch('vm.structure', onStructureChange, true);
        };

        vm.$onDestroy = function () {
            deregisterOnChanges();
            onStructureChangeDeregisterer();
        };

        function reset() {
            setDefault();
            clearNil();
        }

        function clearNil() {
            _.forEach(vm.values, (v, k) => {
                    if (_.isNil(v))
                        delete vm.values[k];
                }
            );
        }

        function setDefault() {
            _.forEach(vm.values, (value, key) => {
                const struct = vm.structure[key];
                if (struct.inputType === 'select')
                    vm.values[key] = "?";
                else {
                    if (struct.defaultValue)
                        vm.values[key] = struct.defaultValue;
                    else
                        vm.values[key] = null;
                }
            });
        }

        function submit() {
            clearNil();
            if (_.isFunction(vm.onSubmit()))
                vm.onSubmit()();
        }

        function onStructureChange() {
            deregisterOnChanges();

            const oldSearchValues = _.cloneDeep(vm.values);
            vm.values = {};

            _.forEach(vm.structure, function (struct, key) {
                if (!_.isUndefined(oldSearchValues[key]))
                    vm.values[key] = oldSearchValues[key];
                else if (!_.isUndefined(struct.defaultValue)) {
                    vm.values[key] = struct.defaultValue;
                }

                if (!_.isUndefined(struct.onChange))
                    onChangeWatchesDeregisters.push($scope.$watch('vm.values.' + key, struct.onChange));
            });
        }

        function deregisterOnChanges() {
            _.forEach(onChangeWatchesDeregisters, function (deregister) {
                deregister();
            });
            onChangeWatchesDeregisters = [];
        }

    }

})();