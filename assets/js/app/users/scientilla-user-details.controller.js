/* global angular */
(function () {
    angular
        .module('users')
        .component('scientillaUserDetails', {
            controller: controller,
            templateUrl: 'partials/scientilla-user-details.html',
            controllerAs: 'vm',
            bindings: {
                userId: '<'
            }
        });

    controller.$inject = [
        'ResearchEntitiesService',
        'UsersService',
        'documentListSections',
        'accomplishmentListSections',
        'AuthService',
        '$scope',
        '$controller'
    ];

    function controller(ResearchEntitiesService, UsersService, documentListSections, accomplishmentListSections, AuthService, $scope, $controller) {
        const vm = this;
        angular.extend(vm, $controller('SummaryInterfaceController', {$scope: $scope}));
        angular.extend(vm, $controller('TabsController', {$scope: $scope}));

        vm.documentListSections = documentListSections;
        vm.accomplishmentListSections = accomplishmentListSections;
        vm.loggedUser = AuthService.user;

        /* jshint ignore:start */
        vm.$onInit = async () => {

            vm.user = await UsersService.getUser(vm.userId);

            const tabIdentifiers = [
                {
                    index: 0,
                    slug: 'info'
                }, {
                    index: 1,
                    slug: 'groups'
                }, {
                    index: 2,
                    slug: 'documents'
                }, {
                    index: 3,
                    slug: 'accomplishments'
                }, {
                    index: 4,
                    slug: 'documents-overview',
                    tabName: 'overview',
                    getData: getData
                }, {
                    index: 5,
                    slug: 'bibliometric-charts',
                    tabName: 'metrics',
                    getData: getData
                }
            ];

            vm.initializeTabs(tabIdentifiers);

            vm.researchEntity = await ResearchEntitiesService.getResearchEntity(vm.user.researchEntity);
        };

        async function getData() {
            return await vm.getChartsData(vm.user);
        }
        /* jshint ignore:end */
    }

})();
