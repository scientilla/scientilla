(function () {
        "use strict";

        angular
            .module('summary')
            .component('summaryProfile', {
                templateUrl: 'partials/summary-profile.html',
                controller: SummaryProfileComponent,
                controllerAs: 'vm',
                bindings: {
                    profile: '='
                }
            });

        SummaryProfileComponent.$inject = [
            'AuthService',
            '$element',
            '$scope',
            'EventsService',
            'context',
            'researchEntityService',
            'AccomplishmentService'
        ];

        function SummaryProfileComponent(
            AuthService,
            $element,
            $scope,
            EventsService,
            context,
            researchEntityService,
            AccomplishmentService
        ) {
            const vm = this;

            vm.numberOfItems = 0;
            vm.loading = true;
            vm.missingProfile = false;

            vm.documents = [];
            vm.accomplishments = [];

            vm.loadingDocuments = false;
            vm.loadingAccomplishments = false;

            vm.urlAllDocuments = '/#/documents/verified';
            vm.urlFavoriteDocuments = '/#/documents/verified?favorites';
            vm.urlAllAccomplishments = '/#/accomplishments/verified';
            vm.urlFavoriteAccomplishments = '/#/accomplishments/verified?favorites';

            let deregister;

            /* jshint ignore:start */
            vm.$onInit = async () => {
                deregister = $scope.$watch('profile', () => {
                    loadProfile();
                });

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

                vm.loadingDocuments = true;
                vm.loadingAccomplishments = true;
                setNumberOfItems();

                vm.subResearchEntity = context.getSubResearchEntity();
                researchEntityService.getDocuments(vm.subResearchEntity, {}).then(function (documents) {
                    vm.documents = documents;
                    vm.loadingDocuments = false;
                    setNumberOfItems();
                });

                vm.researchEntity = await context.getResearchEntity();
                vm.accomplishments = await AccomplishmentService.get(vm.researchEntity, {});
                vm.loadingAccomplishments = false;
                setNumberOfItems();
            };
            /* jshint ignore:end */

            vm.$onDestroy = () => {
                const unregisterTab = requireParentMethod($element, 'unregisterTab');
                unregisterTab(vm);

                deregister();

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

                if (vm.documents.length > 0 || vm.loadingDocuments) {
                    count++;
                }

                if (vm.accomplishments.length > 0 || vm.loadingAccomplishments) {
                    count++;
                }

                vm.numberOfItems = count;
            }
        }
    }

)();