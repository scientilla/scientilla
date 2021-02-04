(function () {
    'use strict';

    angular.module('scientilla-form')
        .component('scientillaAutocompleteGroupField', {
            templateUrl: 'partials/scientilla-autocomplete-group-field.html',
            controller: scientillaAutocompleteGroupField,
            controllerAs: 'vm',
            bindings: {
                model: '=',
                structure: '<',
                id: '<',
                name: '<',
                errors: '<',
                onValidate: '&',
                onChange: '&'
            }
        });

    scientillaAutocompleteGroupField.$inject = ['$scope', 'GroupsService'];

    function scientillaAutocompleteGroupField($scope, GroupsService) {
        const vm = this;
        vm.cssClass = 'form-control';
        let watcherAutocompleteModel;
        let watcherModel;
        let groups = [];

        /* jshint ignore:start */
        vm.$onInit = async function () {
            watcherAutocompleteModel = $scope.$watch('vm.autocompleteModel', function() {
                if (_.has(vm.autocompleteModel, 'id')) {
                    vm.model = vm.autocompleteModel.id;
                } else {
                    vm.model = null;
                }
            });

            watcherModel = $scope.$watch('vm.model', function() {
                if (!vm.model) {
                    vm.autocompleteModel = null;
                }
            });

            if (vm.model) {
                let id = parseInt(vm.model);

                if (_.isEmpty(groups)) {
                    groups = await getGroups();

                    const group = groups.find(g => g.id === id);

                    if (group) {
                        vm.autocompleteModel = group;
                    }
                }
            }
        };
        /* jshint ignore:end */

        vm.$onDestroy = function () {
            if (_.isFunction(watcherAutocompleteModel)) {
                watcherAutocompleteModel();
            }

            if (_.isFunction(watcherModel)) {
                watcherModel();
            }
        };

        vm.validate = validate;
        vm.valueChanged = valueChanged;
        vm.getGroups = getGroups;

        function validate(name = false) {
            if (_.isFunction(vm.onValidate)) {
                vm.onValidate({name});
            }
        }

        function valueChanged(name = false) {
            if (_.isFunction(vm.onChange)) {
                vm.onChange({name});
            }
        }

        function getGroups(searchText = '') {
            const qs = {where: {name: {contains: searchText}}};
            return GroupsService.getGroups(qs);
        }
    }

})();