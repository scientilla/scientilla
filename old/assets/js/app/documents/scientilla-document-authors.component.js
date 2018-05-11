(function () {
    "use strict";

    angular
        .module('documents')
        .component('scientillaDocumentAuthors', {
            templateUrl: 'partials/scientilla-document-authors.html',
            controller: controller,
            controllerAs: 'vm',
            bindings: {
                document: '<',
                type: '@?'
            },
        });

    controller.$inject = [];

    function controller() {
        const vm = this;

        vm.$onInit = () => {
            if (!vm.type)
                vm.type = 'default';
        };

    }
})();