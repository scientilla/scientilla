(function () {
    'use strict';

    angular.module('scientilla-form')
        .component('scientillaDateField', {
            templateUrl: 'partials/scientilla-year-field.html',
            controller: scientillaDateField,
            controllerAs: 'vm',
            bindings: {
                model: '=',
                structure: '<',
                id: '<'
            }
        });

    scientillaDateField.$inject = [
        '$scope'
    ];

    function scientillaDateField($scope) {
        const vm = this;
        vm.cssClass = 'form-control';

        vm.openPopup = openPopup;
        vm.popupOpened = false;
        vm.dateObj = null;

        vm.datePickerOptions = {
            formatYear: 'yyyy',
            minMode: 'year'
        };

        let dateObjDeregisterer, modelDeregisterer;

        vm.$onInit = function () {
            // Set the dateObj when we specified it inside vm.model
            if (typeof vm.model !== 'undefined') {
                vm.dateObj = new Date(parseInt(vm.model), 1, 1);
            }

            dateObjDeregisterer = $scope.$watch('vm.dateObj', dateChanged);
            modelDeregisterer = $scope.$watch('vm.model', modelChanged);
        };

        vm.$onDestroy = function () {
            if (_.isFunction(dateObjDeregisterer))
                dateObjDeregisterer();
            if (_.isFunction(modelDeregisterer))
                modelDeregisterer();
        };

        function openPopup() {
            vm.popupOpened = true;
        }

        function dateChanged() {
            if (vm.dateObj)
                vm.model = vm.dateObj.getFullYear();
            else
                vm.model = null;
        }

        function modelChanged() {
            if (_.isNil(vm.model) && vm.dateObj)
                vm.dateObj = null;
        }
    }

})();