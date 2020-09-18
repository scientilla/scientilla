/* global angular */
(function () {
    angular
        .module('users')
        .component('userProfile', {
            templateUrl: 'partials/user-profile.html',
            controller: controller,
            controllerAs: 'vm',
            bindings: {
                user: '<'
            }
        });

    controller.$inject = [
        'UsersService',
        'researchEntityService',
        'ResearchEntitiesService',
        'AccomplishmentService'
    ];

    function controller(
        UsersService,
        researchEntityService,
        ResearchEntitiesService,
        AccomplishmentService
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

        /* jshint ignore:start */
        vm.$onInit = async () => {
            vm.profile = await UsersService.getUserProfile(vm.user.researchEntity);

            vm.loading = false;

            vm.loadingDocuments = true;
            vm.loadingAccomplishments = true;
            setNumberOfItems();

            researchEntityService.getDocuments(vm.user).then(function (documents) {
                vm.documents = documents;
                vm.loadingDocuments = false;
                setNumberOfItems();
            });

            vm.researchEntity = await ResearchEntitiesService.getResearchEntity(vm.user.researchEntity);
            vm.accomplishments = await AccomplishmentService.get(vm.researchEntity, {});
            vm.loadingAccomplishments = false;
            setNumberOfItems();
        };
        /* jshint ignore:end */

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
