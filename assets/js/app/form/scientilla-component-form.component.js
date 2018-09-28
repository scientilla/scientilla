(function () {
    'use strict';

    angular.module('scientilla-form')
        .component('scientillaComponentForm', {
            templateUrl: 'partials/scientilla-component-form.html',
            controller: scientillaComponentForm,
            controllerAs: 'vm',
            bindings: {
                structure: '<',
                cssClass: '@',
                onSubmit: '&',
                actionCount: '<',
                fieldCount: '<'
            },
            transclude: true,
        });

    scientillaComponentForm.$inject = [
        '$scope'
    ];

    function scientillaComponentForm($scope) {
        const vm = this;

        vm.submit = submit;
        vm.reset = reset;

        vm.values = {};
        let onChangeWatchesDeregisters = [];
        let onStructureChangeDeregisterer;
        let actionCount = 0;
        let fieldCount = 0;

        vm.$onInit = function () {
            setDefault();
            clearNil();

            onStructureChangeDeregisterer = $scope.$watch('vm.structure', onStructureChange, true);

            _.forEach(vm.structure, (name, struct) => {
                //console.log(struct);
                if (actions(struct) || other(struct)) {
                    actionCount++;
                }

                if (fields(struct)) {
                    fieldCount++;
                }
            });
            vm.actionCount = actionCount;
            vm.fieldCount = fieldCount;
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

            const oldSearchValues = _.cloneDeep(vm.values);
            vm.values = {};

            _.forEach(vm.structure, function (struct, key) {
                if (!_.isUndefined(oldSearchValues[key]))
                    vm.values[key] = oldSearchValues[key];
                else if (!_.isUndefined(struct.defaultValue)) {
                    vm.values[key] = struct.defaultValue;
                }

                if (!_.isUndefined(struct.onChange))
                    onChangeWatchesDeregisters.push($scope.$watch('vm.values.' + key, execEvent(struct.onChange)));
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

        function fields(name) {
            if (name === 'title' || name === 'author' || name === 'minYear' || 
                name === 'maxYear' || name === 'documentType' || name === 'sourceType' ||
                name === 'name' || name === 'surname' || name === 'type' || name === 'code' ||
                name === 'slug' || name === 'shortname' || name === 'description' ||
                name === 'scopusId') {
                return true;
            }

            return false;
        }

        function actions(name) {
            if (name === 'buttonReset' || name === 'buttonSearch' || name === 'itemsPerPage' || name === 'active') {
                return true;
            }

            return false;
        }

        function other(name) {
            if (name === 'rejected') {
                return true;
            }

            return false;
        }

        $scope.fields = fields;
        $scope.actions = actions;
        $scope.other = other;
    }

})();