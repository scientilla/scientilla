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

        vm.activeTabIndex = 0;

        const tabIdentifiers = [
            {
                index: 0,
                slug: 'profile'
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

        vm.isActiveMember = (user, group) => {
            const groupMembership = user.groupMemberships
                .find(groupMembership => groupMembership.group === group.id);

            return groupMembership.active;
        };

        vm.getTypeTitle = (type, groups) => {
            switch (true) {
                case type === 'Research Line' && groups.length === 1:
                    return 'Research line';
                case type === 'Research Line' && groups.length > 1:
                    return 'Research lines';
                case type === 'Institute' && groups.length === 1:
                    return 'Institute';
                case type === 'Institute' && groups.length > 1:
                    return 'Institutes';
                case type === 'Center' && groups.length === 1:
                    return 'Center';
                case type === 'Center' && groups.length > 1:
                    return 'Centers';
                case type === 'Facility' && groups.length === 1:
                    return 'Facility';
                case type === 'Facility' && groups.length > 1:
                    return 'Facilities';
                case type === 'Directorate' && groups.length === 1:
                    return 'Directorate';
                case type === 'Directorate' && groups.length > 1:
                    return 'Directorates';
                default:
                    return '';
            }
        };

        /* jshint ignore:start */
        vm.$onInit = async () => {

            vm.user = await UsersService.getUser(vm.userId);
            vm.groupsByType = _.groupBy(vm.user.memberships, 'type');

            vm.researchEntity = await ResearchEntitiesService.getResearchEntity(vm.user.researchEntity);

            vm.initializeTabs(tabIdentifiers);
        };

        async function getData() {
            return await vm.getChartsData(vm.user);
        }
        /* jshint ignore:end */
    }

})();
