
(function () {
    "use strict";

    angular
        .module('documents')
        .component('scientillaDocumentAffiliations', {
            templateUrl: 'partials/scientilla-document-affiliations.html',
            controller: controller,
            controllerAs: 'vm',
            bindings: {
                document: "<"
            }
        });


    controller.$inject = [
    ];

    function controller() {
        const vm = this;

        vm.$onInit = () => {
        };

    }
})
();
