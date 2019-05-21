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

        let researchEntity, originalAuthors;
        vm.collapsed = true;
        vm.newResearchItem = _.cloneDeep(vm.researchItem);

        /* jshint ignore:start */
        vm.$onInit = async () => {
            researchEntity = await context.getResearchEntity();

            vm.authorStrs = vm.researchItem.authors.map(a => a.authorStr);

            vm.authors = ResearchItemService.getCompleteAuthors(vm.researchItem);
            originalAuthors = _.cloneDeep(vm.authors);

            $scope.$watch('vm.position', userSelectedChanged);
            vm.position = 0;
        };

        /* jshint ignore:end */

        function getInstitutesQuery(searchText) {
            const qs = {where: {name: {contains: searchText}, parentId: null}};
            const model = 'institutes';
            return {model: model, qs: qs};
        }

        function userSelectedChanged() {

            if (_.isUndefined(vm.position)) {
                return;
            }

            vm.author = vm.authors[vm.position];
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
