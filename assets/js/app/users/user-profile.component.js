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

    controller.$inject = ['UsersService'];

    function controller(UsersService) {
        const vm = this;

        vm.urlAllDocuments = '/#/users/' + vm.userId + '/documents';
        vm.urlFavoriteDocuments = '';
        vm.urlAllAccomplishments = '/#/users/' + vm.userId + '/accomplishments';
        vm.urlFavoriteAccomplishments = '';

        vm.numberOfItems = 0;
        vm.loading = true;
        vm.profile = false;

        /* jshint ignore:start */
        vm.$onInit = async () => {
            vm.profile = await UsersService.getUserProfile(vm.user.researchEntity);

            vm.loading = false;

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

            if (_.has(vm.profile, 'documents') && vm.profile.documents.length > 0) {
                count++;
            }

            if (_.has(vm.profile, 'accomplishments') && vm.profile.accomplishments.length > 0) {
                count++;
            }

            vm.numberOfItems = count;
        }
    }
})();
