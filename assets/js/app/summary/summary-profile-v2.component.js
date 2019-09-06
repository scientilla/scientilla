(function () {
        "use strict";

        angular
            .module('summary')
            .component('summaryProfileV2', {
                templateUrl: 'partials/summary-profile-v2.html',
                controller: SummaryProfileV2Component,
                controllerAs: 'vm',
                bindings: {
                }
            });

        SummaryProfileV2Component.$inject = [
            '$element'
        ];

        function SummaryProfileV2Component($element) {
            const vm = this;

            vm.$onInit = () => {
                vm.isExperiencesCollapsed = true;
                vm.isEducationsCollapsed = true;
                vm.isCertificatesCollapsed = true;
                vm.isSkillsCollapsed = true;
                vm.isPublicationsCollapsed = true;
                vm.isAccomplishmentsCollapsed = true;
            };

            vm.$onDestroy = () => {
                const unregisterTab = requireParentMethod($element, 'unregisterTab');
                unregisterTab(vm);
            };
        }
    }

)();