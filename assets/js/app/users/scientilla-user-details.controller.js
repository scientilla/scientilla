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

        vm.numberOfItems = 0;
        vm.loading = true;

        vm.urlAllDocuments = '/#/users/' + vm.userId + '/documents';
        vm.urlFavoriteDocuments = '';
        vm.urlAllAccomplishments = '/#/users/' + vm.userId + '/accomplishments';
        vm.urlFavoriteAccomplishments = '';

        /* jshint ignore:start */
        vm.$onInit = async () => {

            vm.user = await UsersService.getUser(vm.userId);

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

            vm.initializeTabs(tabIdentifiers);

            vm.researchEntity = await ResearchEntitiesService.getResearchEntity(vm.user.researchEntity);

            vm.profile = await UsersService.getUserProfile(vm.user.researchEntity);

            //vm.profile.experiences = [];
            //vm.profile.education = [];
            //vm.profile.certificates = [];
            //vm.profile.skillCategories = [];
            //vm.profile.documents = [];
            //vm.profile.accomplishments = [];

            setNumberOfItems();
            vm.loading = false;
        };

        async function getData() {
            return await vm.getChartsData(vm.user);
        }

        function setNumberOfItems() {
            let count = 1;

            if (
                (_.has(vm.profile, 'description') && vm.profile.description.length > 0) ||
                (_.has(vm.profile, 'interests') && vm.profile.interests.length > 0)
            ) {
                count++;
            }

            if (_.has(vm.profile, 'experiences') && vm.profile.experiences.length > 0) {
                count++;
            }

            if (_.has(vm.profile, 'education') && vm.profile.education.length > 0) {
                count++;
            }

            if (_.has(vm.profile, 'certificates') && vm.profile.certificates.length > 0) {
                count++;
            }

            if (_.has(vm.profile, 'skillCategories') && vm.profile.skillCategories.length > 0) {
                count++;
            }

            if (_.has(vm.profile, 'documents') && vm.profile.documents.length > 0) {
                count++;
            }

            if (_.has(vm.profile, 'accomplishments') && vm.profile.accomplishments.length > 0) {
                count++;
            }

            vm.numberOfItems = count;
        }
        /* jshint ignore:end */
    }

})();
