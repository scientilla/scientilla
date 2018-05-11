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
        const deregisteres = [];
        const coauthorsDeregisteres = [];

        vm.viewFirstCoauthor = viewFirstCoauthor;
        vm.viewLastCoauthor = viewLastCoauthor;
        vm.submit = submit;
        vm.cancel = cancel;

        vm.$onInit = () => {
            deregisteres.push($scope.$watch('vm.position', userSelectedChanged));
        };
        vm.$onDestroy = () => {
            for (const deregisterer of deregisteres)
                deregisterer();

            for (const deregisterer of coauthorsDeregisteres)
                deregisterer();
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
            if (coauthorsDeregisteres.length) {
                coauthorsDeregisteres.pop()();
                coauthorsDeregisteres.pop()();
            }
            coauthorsDeregisteres.push($scope.$watch('vm.authorship.first_coauthor', getCoauthorChangedCB(0)));
            coauthorsDeregisteres.push($scope.$watch('vm.authorship.last_coauthor', getCoauthorChangedCB(1)));
        }

        function getCoauthorChangedCB(field) {
            const fields = ['first_coauthor', 'last_coauthor'];
            return () => {
                const index = (field - 1 + fields.length) % fields.length;
                if (vm.authorship.first_coauthor && vm.authorship.last_coauthor)
                    vm.authorship[fields[index]] = false;
            };
        }

        function cancel() {
            executeOnSubmit(0);
        }

        function submit() {
            return save()
                .then(() => executeOnSubmit(1))
                .catch(() => executeOnFailure());
        }

        function save() {
            return vm.document.customPUT(vm.document.authorships, 'authorships');
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
