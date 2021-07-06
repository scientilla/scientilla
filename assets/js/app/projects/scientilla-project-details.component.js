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
        vm.showBudgetDetails = false;
        vm.user = AuthService.user;

        /* jshint ignore:start */
        vm.$onInit = async function () {
            vm.subResearchEntity = await context.getSubResearchEntity();

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

            // Set visibility of the budget details
            if (
                vm.subResearchEntity.getType() === 'user' && vm.subResearchEntity.isSuperUser() || // = if user is SUPERUSER or ADMINISTRATOR
                vm.subResearchEntity.getType() === 'user' && vm.project.verifiedUsers.filter(u => u.id === vm.subResearchEntity.id).length > 0 || // if user has verified this project
                vm.subResearchEntity.getType() === 'user' && vm.project.verifiedGroups.some(g => vm.subResearchEntity.administratedGroups.includes(g)) || // if user is admin of group that has verified this project
                vm.subResearchEntity.getType() === 'group' && vm.project.verifiedGroups.find(g => g.id === vm.subResearchEntity.id) //if group has verified this project
            ) {
                vm.showBudgetDetails = true;
            }
        };

        async function isVerifiedUserOrGroup() {
            if (vm.user.isAdmin()) {
                return true;
            }

            if (vm.subResearchEntity.getType() === 'group') {
                return vm.project.verifiedGroups.find(g => g.id === vm.subResearchEntity.id);
            } else {
                return vm.project.verifiedUsers.find(u => u.id === vm.subResearchEntity.id);
            }
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