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
            'EventsService'
        ];

        function SummaryProfileComponent(
            AuthService,
            $element,
            $scope,
            EventsService
        ) {
            const vm = this;

            vm.numberOfItems = 0;
            vm.loading = true;

            let deregister;

            vm.$onInit = () => {
                deregister = $scope.$watch('profile', () => {
                    loadProfile();
                });

                EventsService.subscribeAll(vm, [
                    EventsService.USER_PROFILE_CHANGED,
                ], (evt, profile) => {
                    vm.profile = profile;
                    loadProfile();
                });

                loadProfile();

                vm.user = AuthService.user;
            };

            vm.$onDestroy = () => {
                const unregisterTab = requireParentMethod($element, 'unregisterTab');
                unregisterTab(vm);

                deregister();

                EventsService.unsubscribeAll(vm);
            };

            function loadProfile() {
                if (!_.isEmpty(vm.profile)) {
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

                if (_.has(vm.profile, 'accomplishments') && vm.profile.accomplishments.length > 0) {
                    count++;
                }

                if (_.has(vm.profile, 'documents') && vm.profile.documents.length > 0) {
                    count++;
                }

                vm.numberOfItems = count;
            }
        }
    }

)();