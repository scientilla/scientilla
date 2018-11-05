
(function () {
    "use strict";

    angular
        .module('documents')
        .component('scientillaDocumentAffiliations', {
            templateUrl: 'partials/scientilla-document-affiliations.html',
            controller: controller,
            controllerAs: 'vm',
            bindings: {
                document: "<",
                collapsed: '=?'
            }
        });


    controller.$inject = [
        '$filter',
        '$scope'
    ];

    function controller($filter, $scope) {
        const vm = this;

        vm.getAffiliationInstituteIdentifier = getAffiliationInstituteIdentifier;

        vm.toggleCollapse = toggleCollapse;

        vm.affiliationInstitutes = [];

        vm.$onInit = () => {
            if (!vm.collapsed) {
                vm.collapsed = false;
            }

            shortenAuthorString();

            $scope.$watch('vm.collapsed', function() {
                shortenAuthorString();
            });
        };

        function toggleCollapse() {
            vm.collapsed = !vm.collapsed;
        }

        function getAffiliationInstituteIdentifier(institute) {
            return vm.document.getInstituteIdentifier(
                vm.document.institutes.findIndex(i => i.id === institute.id)
            );
        }

        function shortenAuthorString() {
            let limit = vm.collapsed ? vm.document.getAuthorLimit() : 0,
                shortAuthorString = $filter('authorsLength')(vm.document.authorsStr, limit);

            vm.affiliationInstitutes = [];

            shortAuthorString.split(/,\s?/).map(function (author, index) {
                const authorship = _.find(vm.document.authorships, a => a.position === index);

                vm.affiliationInstitutes = vm.affiliationInstitutes.concat(authorship.affiliations).unique();
            });
        }

    }
})
();
