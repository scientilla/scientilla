(function () {
    'use strict';

    angular.module('projects')
        .component('scientillaProjectDetails', {
            templateUrl: 'partials/scientilla-project-details.html',
            controller: scientillaProjectDetails,
            controllerAs: 'vm',
            bindings: {
                project: "<"
            }
        });

    scientillaProjectDetails.$inject = ['context', 'AuthService'];

    function scientillaProjectDetails(context, AuthService) {
        const vm = this;

        /* jshint ignore:start */
        vm.$onInit = async function () {

            vm.showAnnualContribution = isVerifiedUserOrGroup();

            vm.PIMembers = vm.project.projectData.members.filter(m => {
                const pi = vm.project.pi.find(pi => pi.email === m.email);
                if (pi) {
                    return m;
                }
            });
        };

        async function isVerifiedUserOrGroup() {
            vm.subResearchEntity = await context.getSubResearchEntity();
            vm.user = AuthService.user;

            if (vm.user.isAdmin()) {
                return true;
            }

            if (vm.subResearchEntity.getType() === 'group') {
                return vm.project.verifiedGroups.find(g => g.id === vm.subResearchEntity.id);
            } else {
                return vm.project.verifiedUsers.find(u => u.id === vm.subResearchEntity.id);
            }

            return false;
        }
        /* jshint ignore:end */
    }

})();