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
        '$controller',
        '$timeout'
    ];

    function controller(
        ResearchEntitiesService,
        UsersService,
        documentListSections,
        accomplishmentListSections,
        AuthService,
        $scope,
        $controller,
        $timeout
    ) {
        const vm = this;
        angular.extend(vm, $controller('TabsController', {$scope: $scope}));

        vm.documentListSections = documentListSections;
        vm.accomplishmentListSections = accomplishmentListSections;
        vm.loggedUser = AuthService.user;

        vm.activeTabIndex = 0;

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
                tabName: 'overview-tab'
            }, {
                index: 6,
                slug: 'bibliometric-charts',
                tabName: 'metrics-tab'
            }
        ];

        /* jshint ignore:start */
        vm.$onInit = async () => {

            activeTabWatcher = $scope.$watch('vm.activeTabIndex', () => {
                if (vm.activeTabIndex === 4) {
                    $timeout(function() {
                        $scope.$broadcast('rzSliderForceRender');
                    });
                }
            });

            await loadUser();

            vm.initializeTabs(tabIdentifiers);
        };
        /* jshint ignore:end */

        vm.$onDestroy = function () {
            activeTabWatcher();
        };

        vm.isAdmin = function () {
            return vm.loggedUser && vm.loggedUser.isAdmin();
        };

        /* jshint ignore:start */
        async function loadUser() {
            vm.user = await UsersService.getUser(vm.userId, ['memberships']);
            vm.researchEntity = await ResearchEntitiesService.getResearchEntity(vm.user.researchEntity);
        }
        /* jshint ignore:end */
    }

})();
