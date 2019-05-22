/* global angular */

(function () {
    "use strict";

    angular
        .module('app')
        .component('scientillaResearchItemAffiliationsForm', {
            templateUrl: 'partials/scientilla-research-item-affiliations-form.html',
            controller: controller,
            controllerAs: 'vm',
            bindings: {
                researchItem: "<",
                closeFn: "&",
                checkAndClose: "&"
            }
        });


    controller.$inject = [
        '$scope',
        'context',
        'ResearchEntitiesService',
        'ResearchItemService'
    ];

    function controller($scope, context, ResearchEntitiesService, ResearchItemService) {
        const vm = this;
        vm.getInstitutesFilter = getInstitutesFilter;
        vm.getInstitutesQuery = getInstitutesQuery;
        vm.submit = save;
        vm.cancel = close;

        let researchEntity, originalAuthors, positionDeregisterer, affiliationsDeregisterer;
        vm.collapsed = true;
        vm.newResearchItem = _.cloneDeep(vm.researchItem);

        /* jshint ignore:start */
        vm.$onInit = async () => {
            researchEntity = await context.getResearchEntity();

            vm.authorStrs = vm.researchItem.authors.map(a => a.authorStr);

            vm.authors = ResearchItemService.getCompleteAuthors(vm.researchItem);
            originalAuthors = _.cloneDeep(vm.authors);

            positionDeregisterer = $scope.$watch('vm.position', userSelectedChanged);
            vm.position = 0;
        };

        vm.$onDestroy = () => {
            positionDeregisterer();
            if (_.isFunction(affiliationsDeregisterer))
                affiliationsDeregisterer();
        };

        /* jshint ignore:end */

        function getInstitutesQuery(searchText) {
            const qs = {where: {name: {contains: searchText}, parentId: null}};
            const model = 'institutes';
            return {model: model, qs: qs};
        }

        function userSelectedChanged() {
            if (!Number.isInteger(vm.position))
                return;

            if (_.isFunction(affiliationsDeregisterer))
                affiliationsDeregisterer();

            vm.author = vm.authors[vm.position];

            affiliationsDeregisterer = $scope.$watch('vm.author.affiliations', updateResearchItemInstitutes, true);
        }

        function updateResearchItemInstitutes() {
            vm.newResearchItem.affiliations = vm.newResearchItem.affiliations.filter(a => a.author !== vm.author.id);
            const institutesIds = vm.newResearchItem.affiliations.map(a => a.institute);
            vm.newResearchItem.institutes = vm.newResearchItem.institutes.filter(i => institutesIds.includes(i.id));

            vm.author.affiliations.forEach(i => {
                vm.newResearchItem.affiliations.push({
                    author: vm.author.id,
                    institute: i.id
                });

                vm.newResearchItem.institutes.push(i);
            });

            const uniqInstitutesIds = [...new Set(vm.newResearchItem.institutes.map(i => i.id))];
            vm.newResearchItem.institutes = uniqInstitutesIds.map(id => vm.newResearchItem.institutes.find(i => i.id === id));
        }

        function getInstitutesFilter() {
            return vm.author.affiliations;
        }

        /* jshint ignore:start */

        function checkChanges() {
            return angular.toJson(vm.authors) === angular.toJson(originalAuthors);
        }

        async function save() {
            await ResearchEntitiesService.updateAuthors(researchEntity, vm.researchItem, vm.authors);

            if (_.isFunction(vm.closeFn())) {
                vm.closeFn()();
            }
        }

        /* jshint ignore:end */

        function close() {
            if (_.isFunction(vm.checkAndClose())) {
                vm.checkAndClose()(checkChanges);
            }
        }
    }
})();
