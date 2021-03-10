/* global angular */
(function () {
    angular
        .module('users')
        .component('userProfile', {
            templateUrl: 'partials/user-profile.html',
            controller: controller,
            controllerAs: 'vm',
            bindings: {
                user: '<',
                active: '<?'
            }
        });

    controller.$inject = [
        'UsersService',
        'researchEntityService',
        'ResearchEntitiesService',
        'AccomplishmentService',
        '$scope'
    ];

    function controller(
        UsersService,
        researchEntityService,
        ResearchEntitiesService,
        AccomplishmentService,
        $scope
    ) {
        const vm = this;

        vm.urlAllDocuments = '/#/users/' + vm.user.id + '/documents';
        vm.urlFavoriteDocuments = '';
        vm.urlAllAccomplishments = '/#/users/' + vm.user.id + '/accomplishments';
        vm.urlFavoriteAccomplishments = '';

        vm.numberOfItems = 0;
        vm.loading = true;
        vm.profile = false;

        vm.documents = [];
        vm.accomplishments = [];

        vm.loadingDocuments = false;
        vm.loadingAccomplishments = false;

        vm.loadProfile = false;

        let activeWatcher;

        /* jshint ignore:start */
        vm.$onInit = async () => {
            if (_.has(vm, 'active')) {
                vm.loadProfile = angular.copy(vm.active);

                activeWatcher = $scope.$watch('vm.active', () => {
                    vm.loading = true;
                    vm.loadProfile = angular.copy(vm.active);

                    if (vm.loadProfile) {
                        loadProfile();
                    } else {
                        vm.profile = false;
                        vm.documents = [];
                        vm.accomplishments = [];
                    }
                });
            } else {
                loadProfile();
            }
        };

        async function loadProfile() {
            vm.researchEntity = vm.user.researchEntity;
            vm.profile = await UsersService.getUserProfile(vm.researchEntity);
            setNumberOfItems();

            vm.loading = false;

            if (vm.user.isScientific()) {
                vm.loadingDocuments = true;
                vm.loadingAccomplishments = true;
                setNumberOfItems();

                vm.documents = await researchEntityService.getDocuments(vm.user, {limit: 1}, false, []);
                vm.favoriteDocuments = await researchEntityService.getDocuments(vm.user, {}, true, []);
                vm.loadingDocuments = false;
                setNumberOfItems();

                vm.researchEntity = await ResearchEntitiesService.getResearchEntity(vm.user.researchEntity);
                vm.accomplishments = await AccomplishmentService.get(vm.researchEntity, {}, false, []);
                vm.favoriteAccomplishments = await AccomplishmentService.get(vm.researchEntity, {}, true, []);
                vm.loadingAccomplishments = false;
                setNumberOfItems();
            }
        }

        /* jshint ignore:end */

        vm.$onDestroy = () => {
            if (_.isFunction(activeWatcher)) {
                activeWatcher();
            }
        };

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

            if (
                vm.documents.length > 0 ||
                vm.loadingDocuments &&
                vm.user.isScientific()
            ) {
                count++;
            }

            if (
                vm.accomplishments.length > 0 ||
                vm.loadingAccomplishments &&
                vm.user.isScientific()
            ) {
                count++;
            }

            vm.numberOfItems = count;
        }
    }
})();
