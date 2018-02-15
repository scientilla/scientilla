(function () {
    "use strict";

    angular
        .module('documents')
        .component('scientillaDocumentAuthors', {
            templateUrl: 'partials/scientilla-document-authors.html',
            controller: controller,
            controllerAs: 'vm',
            bindings: {
                document: '<'
            },
        });

    controller.$inject = [
    ];

    function controller() {
        const vm = this;
    }
})();