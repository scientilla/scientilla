(function () {
    'use strict';

    angular.module('scientilla-form')
        .component('scientillaComponentForm', {
            templateUrl: 'partials/scientilla-component-form.html',
            controller: scientillaComponentForm,
            controllerAs: 'vm',
            bindings: {
                structure: '=',
                cssClass: '@',
                onSubmit: '&',
                onReset: '&',
                errors: '<',
                onValidate: '&',
                onChange: '&',
                values: '='
            },
            transclude: true,
        });

    scientillaComponentForm.$inject = [
        '$scope',
        '$rootScope'
    ];

    function scientillaComponentForm($scope, $rootScope) {
        const vm = this;

        vm.submit = submit;
        vm.reset = reset;

        let onChangeWatchesDeregisters = [];
        let onStructureChangeDeregisterer;

        vm.fields = filterStructure('field');
        vm.actions = filterStructure('action');
        vm.connectors = filterStructure('connector');
        vm.getObjectSize = getObjectSize;

        vm.$onInit = function () {
            setDefaultsForMissingValues();
            clearNil();

            onStructureChangeDeregisterer = $scope.$watch('vm.structure', onStructureChange, true);
        };

        vm.$onDestroy = function () {
            deregisterOnChanges();
            onStructureChangeDeregisterer();
        };

        function reset() {
            setDefault();
            clearNil();

            if (_.isFunction(vm.onSubmit())) {
                vm.onSubmit()(vm.values);
            }
        }

        function clearNil() {
            _.forEach(vm.values, (v, k) => {
                    if (_.isNil(v))
                        delete vm.values[k];
                }
            );
        }

        function setDefaultsForMissingValues() {
            _.forEach(vm.structure, (struct, key) => {
                if (_.isNil(vm.values[key])) {
                    if (struct.inputType === 'select' && !struct.defaultValue) {
                        vm.values[key] = '?';
                    } else {
                        if (struct.defaultValue) {
                            vm.values[key] = struct.defaultValue;
                        }
                    }
                }
            });
        }

        function setDefault() {
            _.forEach(vm.values, (value, key) => {
                const struct = vm.structure[key];
                if (struct.inputType === 'select' && !struct.defaultValue)
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
                vm.onSubmit()(vm.values);
        }

        function onStructureChange() {
            deregisterOnChanges();

            vm.fields = filterStructure('field');
            vm.actions = filterStructure('action');
            vm.connectors = filterStructure('connector');

            const oldSearchValues = _.cloneDeep(vm.values);
            vm.values = {};

            _.forEach(vm.structure, function (struct, key) {
                // Check if old search values has this key
                if (_.has(oldSearchValues, key)) {
                    vm.values[key] = oldSearchValues[key];
                } else if (struct && !_.isUndefined(struct.defaultValue)) {
                    vm.values[key] = struct.defaultValue;
                }
            });

            _.forEach(vm.structure, function (struct, key) {
                if (struct && !_.isUndefined(struct.onChange)) {
                    onChangeWatchesDeregisters.push($scope.$watch('vm.values.' + key, (newValue, oldValue) => {
                        // Execute function only if values have changed
                        if (newValue !== oldValue) {
                            execEvent(struct.onChange)();
                        }
                    }));
                }

                if (!_.isUndefined(vm.structure.onChange)) {
                    onChangeWatchesDeregisters.push($scope.$watch('vm.values.' + key, function(evt) {
                        vm.structure.onChange(vm.values);
                    }));
                }
            });
        }

        function execEvent(fn) {
            if (_.isFunction(fn))
                return fn;
            if (fn === 'submit')
                return submit;
            if (fn === 'reset')
                return reset;
        }

        function deregisterOnChanges() {
            _.forEach(onChangeWatchesDeregisters, function (deregister) {
                deregister();
            });
            onChangeWatchesDeregisters = [];
        }

        function filterStructure(type) {
            let structs = {};

            Object.keys(vm.structure).forEach(function(name) {
                let struct = vm.structure[name];

                if (struct && struct.type === type) {
                    structs[name] = struct;
                }
            });

            return structs;
        }

        function getObjectSize(object) {
            return Object.keys(object).length;
        }
    }

})();