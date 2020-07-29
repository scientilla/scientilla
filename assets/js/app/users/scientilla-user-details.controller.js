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
        vm.types = [];

        let allMemberships = [];

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

        vm.getTypeTitle = GroupsService.getTypeTitle;

        /* jshint ignore:start */
        vm.isActiveMember = (user, group) => {
            const membership = allMemberships.find(m => m.user === user.id && m.group === group.id);
            if (membership) {
                return membership.active;
            }
            return false;
        };

        vm.$onInit = async () => {
            allMemberships = await researchEntityService.getAllMemberships();
            vm.user = await UsersService.getUser(vm.userId);
            const groupIds = vm.user.memberships.map(g => g.id);
            vm.institute = await GroupsService.getConnectedGroups(groupIds);

            if (groupIds.length > 1) {
                vm.types = _.groupBy(vm.institute.childGroups, 'type');
            }

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
