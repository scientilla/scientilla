/* global Scientilla */

(function () {
    "use strict";

    angular
        .module('documents')
        .component('scientillaDocumentAuthorsForm', {
            templateUrl: 'partials/scientilla-document-authors-form.html',
            controller: controller,
            controllerAs: 'vm',
            bindings: {
                document: "<",
                onFailure: "&",
                onSubmit: "&"
            }
        });


    controller.$inject = [
        '$scope'
    ];

    function controller($scope) {
        const vm = this;
        vm.viewFirstCoauthor = viewFirstCoauthor;
        vm.viewLastCoauthor = viewLastCoauthor;
        vm.submit = submit;
        vm.cancel = cancel;

        vm.$onInit = () => {
            $scope.$watch('vm.position', userSelectedChanged);
        };

        function viewFirstCoauthor() {
            return vm.authorship.position > 0 && vm.authorship.position < vm.document.getAuthors().length - 1;
        }

        function viewLastCoauthor() {
            return vm.authorship.position > 0 && vm.authorship.position < vm.document.getAuthors().length - 1;
        }

        function userSelectedChanged() {
            if (_.isUndefined(vm.position))
                return;
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

        function cancel() {
            executeOnSubmit(0);
        }

        function submit() {
            return save()
                .then(function (user) {
                    executeOnSubmit(1);
                })
                .catch(function () {
                    executeOnFailure();
                });
        }

        function save() {
            return vm.document.customPUT(vm.document.authorships, 'authorships')
                .then(() => vm.document.save());
        }

        function executeOnSubmit(i) {
            if (_.isFunction(vm.onSubmit()))
                vm.onSubmit()(i);
        }

        function executeOnFailure() {
            if (_.isFunction(vm.onFailure()))
                vm.onFailure()();
        }

    }
})
();
