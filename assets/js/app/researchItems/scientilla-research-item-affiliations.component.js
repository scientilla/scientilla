(function () {
    "use strict";

    angular
        .module('app')
        .component('scientillaResearchItemAffiliations', {
            templateUrl: 'partials/scientilla-research-item-affiliations.html',
            controller: controller,
            controllerAs: 'vm',
            bindings: {
                researchItem: "<",
                collapsed: '=?'
            }
        });


    controller.$inject = [
        '$filter',
        '$scope',
        'ResearchItemService',
        'authorLimit'
    ];

    function controller($filter, $scope, ResearchItemService, authorLimit) {
        const vm = this;

        vm.getAffiliationInstituteIdentifier = getAffiliationInstituteIdentifier;
        vm.toggleCollapse = toggleCollapse;

        vm.affiliationInstitutes = [];

        vm.$onInit = () => {
            vm.collapsed = !!vm.collapsed;
            reloadAffiliations();
            $scope.$watch('vm.collapsed', () => reloadAffiliations());
        };

        function toggleCollapse() {
            vm.collapsed = !vm.collapsed;
        }

        function getAffiliationInstituteIdentifier(institute) {
            return ResearchItemService.getInstituteIdentifier(
                vm.researchItem.institutes.findIndex(i => i.id === institute.id)
            );
        }

        function reloadAffiliations() {
            let limit = vm.collapsed ? authorLimit : 0,
                shortAuthorString = $filter('authorsLength')(vm.researchItem.authorsStr, limit);

            vm.affiliationInstitutes = [];

            shortAuthorString.split(/,\s?/).map(function (authorStr, index) {
                const author = vm.researchItem.authors.find(a => a.position === index);

                if (author) {
                    const affiliations = vm.researchItem.affiliations.filter(af => af.author === author.id).map(af => af.institute);
                    const institutes = vm.researchItem.institutes.filter(i => affiliations.includes(i.id));
                    vm.affiliationInstitutes = vm.affiliationInstitutes.concat(institutes).unique();
                }
            });
        }

    }
})
();
