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
        'Restangular',
        'researchEntityService',
        'ResearchEntitiesService',
        'UsersService',
        'GroupsService',
        'documentListSections',
        'accomplishmentListSections',
        'AuthService',
        '$scope',
        '$controller'
    ];

    function controller(Restangular, researchEntityService, ResearchEntitiesService, UsersService, GroupsService, documentListSections, accomplishmentListSections, AuthService, $scope, $controller) {
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

            if (groupMembership) {
                return groupMembership.active;
            }

            return true;
        };

        vm.getTypeTitle = GroupsService.getTypeTitle;

        /* jshint ignore:start */
        vm.$onInit = async () => {

            vm.user = await UsersService.getUser(vm.userId);
            const groupIds = vm.user.memberships.map(g => g.id);
            console.log(groupIds);
            vm.institute = await GroupsService.getConnectedGroups(groupIds);
            vm.types = _.groupBy(vm.institute.childGroups, 'type');

            vm.initializeTabs(tabIdentifiers);
        };

        vm.getGroupTypes = (group) => {
            return _.groupBy(group.childGroups, 'type');
        };

        async function getData() {
            return await vm.getChartsData(vm.user);
        }
        /* jshint ignore:end */
    }

})();
