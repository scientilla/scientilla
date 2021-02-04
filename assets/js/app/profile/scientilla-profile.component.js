(function () {
        "use strict";

        angular
            .module('profile')
            .component('scientillaProfile', {
                templateUrl: 'partials/scientilla-profile.html',
                controller,
                controllerAs: 'vm',
                bindings: {
                    profile: '<'
                }
            });

        controller.$inject = [
            'AuthService',
            'EventsService',
            'context',
            'researchEntityService',
            'AccomplishmentService',
            'UsersService',
        ];

        function controller(
            AuthService,
            EventsService,
            context,
            researchEntityService,
            AccomplishmentService,
            UsersService
        ) {
            const vm = this;

            vm.numberOfItems = 0;
            vm.loading = true;
            vm.missingProfile = false;

            vm.documents = [];
            vm.favoriteDocuments = [];
            vm.accomplishments = [];

            vm.loadingDocuments = false;
            vm.loadingAccomplishments = false;

            vm.urlAllDocuments = '/#/documents/verified';
            vm.urlFavoriteDocuments = '/#/documents/verified?favorites';
            vm.urlAllAccomplishments = '/#/accomplishments/verified';
            vm.urlFavoriteAccomplishments = '/#/accomplishments/verified?favorites';

            /* jshint ignore:start */
            vm.$onInit = async () => {

                vm.researchEntity = AuthService.user.researchEntity;
                vm.profile = await UsersService.getProfile(vm.researchEntity);

                EventsService.subscribeAll(vm, [
                    EventsService.USER_PROFILE_CHANGED,
                ], (evt, profile) => {
                    vm.profile = profile;
                    loadProfile();
                });

                EventsService.subscribe(vm, EventsService.AUTH_USER_CHANGED, (evt, user) => {
                    vm.user = user;
                });

                EventsService.subscribe(vm, EventsService.USER_PROFILE_SAVED, () => {
                    AuthService.savedProfile();

                    vm.user = AuthService.user;
                });

                loadProfile();

                vm.user = AuthService.user;

                if (vm.user.isScientific()) {
                    vm.loadingDocuments = true;
                    vm.loadingAccomplishments = true;

                    vm.subResearchEntity = context.getSubResearchEntity();
                    setNumberOfItems();

                    vm.documents = await researchEntityService.getDocuments(vm.subResearchEntity, {limit: 1}, false, []);
                    vm.favoriteDocuments = await researchEntityService.getDocuments(vm.subResearchEntity, {}, true, []);
                    vm.loadingDocuments = false;
                    setNumberOfItems();

                    vm.researchEntity = await context.getResearchEntity();
                    vm.accomplishments = await AccomplishmentService.get(vm.researchEntity, {limit: 1}, false, []);
                    vm.favoriteAccomplishments = await AccomplishmentService.get(vm.researchEntity, {}, true, []);
                    vm.loadingAccomplishments = false;
                }

                setNumberOfItems();
            };
            /* jshint ignore:end */

            vm.$onDestroy = () => {
                EventsService.unsubscribeAll(vm);
            };

            function loadProfile() {
                if (!_.isEmpty(vm.profile)) {
                    vm.missingProfile = _.isEmpty(vm.profile.plain());
                    setNumberOfItems();
                    vm.loading = false;
                }
            }

            function setNumberOfItems() {
                let count = 0;

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
                    (vm.documents.length > 0 || vm.loadingDocuments) &&
                    vm.subResearchEntity.isScientific()
                ) {
                    count++;
                }

                if (
                    (vm.accomplishments.length > 0 || vm.loadingAccomplishments) &&
                    vm.subResearchEntity.isScientific()
                ) {
                    count++;
                }

                vm.numberOfItems = count;
            }
        }
    }

)();