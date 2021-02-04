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
        let watcher;

        vm.$onInit = function () {
            if (vm.model) {
                let id = parseInt(vm.model.slice(2).slice(0,-2));
                getGroups().then(groups => {
                    const group = groups.find(g => g.id === id);

                    if (group) {
                        vm.autocompleteModel = group;
                    }
                });
            }

            watcher = $scope.$watch('vm.autocompleteModel', function() {
                if (_.has(vm.autocompleteModel, 'id')) {
                    vm.model = `%-${ vm.autocompleteModel.id }-%`;
                } else {
                    vm.model = null;
                }
            });
        };

        vm.$onDestroy = function () {
            if (_.isFunction(watcher)) {
                watcher();
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