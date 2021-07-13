(function () {
    'use strict';

    angular.module('scientilla-form')
        .component('scientillaComponentForm', {
            templateUrl: 'partials/scientilla-component-form.html',
            controller: scientillaComponentForm,
            controllerAs: 'vm',
            bindings: {
                category: '<?',
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
        '$timeout'
    ];

    function scientillaComponentForm($scope, $timeout) {
        const vm = this;

        vm.submit = submit;
        vm.reset = reset;

        let onChangeWatchesDeregisters = [];
        let onStructureChangeDeregisterer;

        vm.options = filterStructure('option');
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
            if (_.isFunction(vm.onSubmit())) {
                vm.onSubmit()(vm.values);
            }
        }

        function onStructureChange() {
            deregisterOnChanges();

            vm.options = filterStructure('option');
            vm.fields = filterStructure('field');
            vm.actions = filterStructure('action');
            vm.connectors = filterStructure('connector');

            const oldSearchValues = _.cloneDeep(vm.values);
            vm.values = {};
            vm.ignoreValueChange = [];

            _.forEach(vm.structure, function (struct, key) {
                // Check if old search values has this key
                if (_.has(oldSearchValues, key)) {
                    vm.values[key] = oldSearchValues[key];
                } else if (struct && !_.isUndefined(struct.defaultValue)) {
                    vm.values[key] = struct.defaultValue;
                }
            });

            _.forEach(vm.structure, function (struct, key) {

                onChangeWatchesDeregisters.push($scope.$watch('vm.values.' + key, (newOption, oldOption) => {

                    const index = vm.ignoreValueChange.indexOf(key);
                    if (index >= 0) {
                        vm.ignoreValueChange.splice(index, 1);
                        return;
                    }

                    const changedStruct = vm.structure[key];

                    if (
                        changedStruct && (
                            (changedStruct.type === 'option' && newOption !== vm.option) ||
                            (_.has(changedStruct, 'listenForChange') && changedStruct.listenForChange)
                        )
                    ) {
                        let refresh = false;

                        if (changedStruct.valueType === 'boolean') {
                            if (_.has(changedStruct, 'mapField') && _.has(changedStruct, 'mapData')) {
                                if (newOption) {
                                    vm.option = changedStruct.mapData.true;
                                } else {
                                    vm.option = changedStruct.mapData.false;
                                }
                            } else {
                                return;
                            }
                        } else {
                            vm.option = newOption;
                        }

                        vm.fields = filterStructure('field');
                        vm.actions = filterStructure('action');
                        setFilterValue(newOption, key);

                        // Remove the values that are not a field of this option and no action
                        _.forEach(vm.values, function(value, valueKey) {
                            if (
                                valueKey !== key &&
                                !_.has(vm.fields, valueKey) &&
                                !_.has(vm.actions, valueKey)
                            ) {
                                delete vm.values[valueKey];
                            }
                        });

                        for (const fieldName in vm.fields) {
                            const field = vm.fields[fieldName];
                            if (_.has(field, 'inputType') && field.inputType === "range") {
                                refresh = true;
                                break;
                            }
                        }

                        if (refresh) {
                            $timeout(function() {
                                $scope.$broadcast('rzSliderForceRender');
                            });
                        }
                    }
                }));

                if (struct && !_.isUndefined(struct.onChange)) {
                    onChangeWatchesDeregisters.push($scope.$watch('vm.values.' + key, (newValue, oldValue) => {
                        // Execute function only if values have changed
                        if (newValue !== oldValue) {
                            execEvent(struct.onChange)();
                        }
                    }));
                }

                if (!_.isUndefined(vm.structure.onChange)) {
                    onChangeWatchesDeregisters.push($scope.$watch('vm.values.' + key, () => {
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

                    if (_.has(struct, 'visibleFor')) {
                        if (struct.visibleFor.indexOf(vm.option) >= 0) {
                            structs[name] = struct;
                        }
                    } else {
                        structs[name] = struct;
                    }

                    struct.disabled = false;
                    if (_.has(struct, 'disabledFor')) {
                        if (struct.disabledFor.indexOf(vm.option) >= 0) {
                            struct.disabled = true;
                            vm.values[name] = false;
                            vm.ignoreValueChange.push(name);
                        }
                    }
                }
            });

            return structs;
        }

        function setFilterValue(value, name) {
            const structs = [];
            Object.keys(vm.structure).forEach(function(structName) {
                let struct = vm.structure[structName];

                if (struct.dependingOn === name) {
                    structs.push(struct);
                }
            });

            _.forEach(structs, function (struct) {
                let yearValue = struct.defaultValues.find(v => v.item_key === value);
                if (_.isNil(yearValue)) {
                    yearValue = {
                        min: 2000,
                        max: new Date().getFullYear()
                    };
                }
                struct.values = {
                    min: parseInt(yearValue.min),
                    max: parseInt(yearValue.max)
                };
            });
        }

        function getObjectSize(object) {
            return Object.keys(object).length;
        }
    }

})();