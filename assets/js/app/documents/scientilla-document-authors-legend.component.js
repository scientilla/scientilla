/* global Scientilla */

(function () {
    "use strict";

    angular
        .module('documents')
        .component('scientillaDocumentAuthorsLegend', {
            templateUrl: 'partials/scientilla-document-authors-legend.html',
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

        vm.hasCorresponding = hasCorresponding;
        vm.hasCoFirst = hasCoFirst;
        vm.hasCoLast = hasCoLast;
        vm.hasOral = hasOral;

        vm.$onInit = () => {
        };

        function hasCorresponding() {
            return !!vm.document.authorships.find(a => a.corresponding);
        }

        function hasCoFirst() {
            return !!vm.document.authorships.find(a => a.first_coauthor);
        }

        function hasCoLast() {
            return !!vm.document.authorships.find(a => a.last_coauthor);
        }

        function hasOral() {
            return !!vm.document.authorships.find(a => a.oral_presentation);
        }

    }
})
();
