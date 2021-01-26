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

    scientillaProjectDetails.$inject = ['context', 'AuthService', 'UserService', 'GroupsService', 'ModalService'];

    function scientillaProjectDetails(context, AuthService, UserService, GroupsService, ModalService) {
        const vm = this;

        vm.getAlias = UserService.getAlias;
        vm.groups = [];
        vm.projectTypeCompetitive = projectTypeCompetitive;

        /* jshint ignore:start */
        vm.$onInit = async function () {
            vm.project.category = industrialProjectCategories[vm.project.category];
            vm.project.payment = industrialProjectPayments[vm.project.payment];

            vm.groups = await GroupsService.getGroups();

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

        vm.getGroupName = function(researchLine) {
            if (!_.isEmpty(vm.groups)) {
                const group = vm.groups.find(g => g.code === researchLine.code);

                if (group) {
                    return group.name;
                }
            }
            return researchLine.description;
        };

        vm.getGroupUrl = function(researchLine) {
            if (!_.isEmpty(vm.groups)) {
                const group = vm.groups.find(g => g.code === researchLine.code);

                if (group) {
                    return '/#' + group.getProfileUrl();
                }
            }
            return;
        };

        vm.closeModal = function () {
            ModalService.close('close');
        };

        vm.isGroup = function(researchLine) {
            if (!_.isEmpty(vm.groups)) {
                const group = vm.groups.find(g => g.code === researchLine.code);

                if (group) {
                    return group;
                }
            }
            return false;
        };
    }

})();