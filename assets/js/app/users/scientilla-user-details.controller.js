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
        '$controller',
        '$timeout'
    ];

    function controller(
        Restangular,
        researchEntityService,
        ResearchEntitiesService,
        UsersService,
        GroupsService,
        documentListSections,
        accomplishmentListSections,
        AuthService,
        $scope,
        $controller,
        $timeout
    ) {
        const vm = this;
        angular.extend(vm, $controller('SummaryInterfaceController', {$scope: $scope}));
        angular.extend(vm, $controller('TabsController', {$scope: $scope}));

        vm.documentListSections = documentListSections;
        vm.accomplishmentListSections = accomplishmentListSections;
        vm.loggedUser = AuthService.user;

        vm.activeTabIndex = 0;
        vm.types = [];
        vm.hasTypes = false;

        let allMemberships = [];

        let activeTabWatcher = null;

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
                slug: 'projects'
            }, {
                index: 5,
                slug: 'documents-overview',
                tabName: 'overview',
                getData: getData
            }, {
                index: 6,
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
            activeTabWatcher = $scope.$watch('vm.activeTabIndex', () => {
                if (vm.activeTabIndex === 4) {
                    $timeout(function() {
                        $scope.$broadcast('rzSliderForceRender');
                    });
                }
            });

            vm.user = await UsersService.getUser(vm.userId);
            vm.researchEntity = await ResearchEntitiesService.getResearchEntity(vm.user.researchEntity);
            allMemberships = await researchEntityService.getAllMemberships({ user: vm.user.id });

            const groupIds = vm.user.memberships.map(g => g.id);
            vm.institute = await GroupsService.getConnectedGroups(groupIds);

            if (groupIds.length > 1) {
                vm.types = _.groupBy(vm.institute.childGroups, 'type');
            }

            if (!_.isEmpty(vm.types)) {
                vm.hasTypes = true;
            }

            vm.initializeTabs(tabIdentifiers);
        };

        vm.$onDestroy = function () {
            activeTabWatcher();
        };

        vm.getGroupTypes = (group) => {
            return _.groupBy(group.childGroups, 'type');
        };

        async function getData() {
            return await vm.getChartsData(vm.user);
        }
        /* jshint ignore:end */

        vm.isAdmin = function () {
            return vm.loggedUser && vm.loggedUser.isAdmin();
        };
    }

})();
