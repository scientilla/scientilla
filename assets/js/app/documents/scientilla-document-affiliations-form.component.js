/* global angular */

(function () {
    "use strict";

    angular
        .module('documents')
        .component('scientillaDocumentAffiliationsForm', {
            templateUrl: 'partials/scientilla-document-affiliations-form.html',
            controller: controller,
            controllerAs: 'vm',
            bindings: {
                document: "<",
                onFailure: "&",
                onSubmit: "&",
                checkAndClose: "&"
            }
        });


    controller.$inject = [
        '$scope'
    ];

    function controller($scope) {
        const vm = this;
        vm.getInstitutesFilter = getInstitutesFilter;
        vm.getInstitutesQuery = getInstitutesQuery;
        vm.submit = submit;
        vm.cancel = close;

        let originalObjectJson = [];
        vm.collapsed = true;

        vm.$onInit = () => {
            originalObjectJson = angular.toJson(vm.document.authorships);

            $scope.$watch('vm.position', userSelectedChanged);
            $scope.$watch('vm.authorship.affiliations', resetInstitutes, true);

            if (Array.isArray(vm.document.authorships) && vm.document.authorships.length)
                vm.position = 0;
        };

        function getInstitutesQuery(searchText) {
            const qs = {where: {name: {contains: searchText}, parentId: null}};
            const model = 'institutes';
            return {model: model, qs: qs};
        }

        function resetInstitutes() {
            vm.document.institutes = _.uniqBy(_.flatMap(vm.document.authorships, 'affiliations'), 'id');
        }

        function userSelectedChanged() {

            if (_.isUndefined(vm.position)) {
                return;
            }

            vm.author = vm.document.getAuthors()[vm.position];
            vm.authorship = vm.document.authorships.find(a => a.position === vm.position);
            if (!vm.authorship) {
                const newAuthorship = {
                    document: vm.document.id,
                    position: vm.position,
                    affiliations: []
                };
                vm.document.authorships.push(newAuthorship);
                vm.authorship = newAuthorship;
            }

        }

        function getInstitutesFilter() {
            return vm.authorship.affiliations;
        }

        /* jshint ignore:start */
        async function submit() {
            try {
                await save();
            } catch (e) {
                vm.onFailure()();
            }
            vm.onSubmit()(1);
        }

        /* jshint ignore:end */

        function save() {
            return vm.document.customPUT(vm.document.authorships, 'authorships');
        }

        function close() {
            if (_.isFunction(vm.checkAndClose())) {
                vm.checkAndClose()(() => originalObjectJson === angular.toJson(vm.document.authorships));
            }
        }
    }
})();
