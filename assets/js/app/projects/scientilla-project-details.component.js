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

            // Set visibility of the budget details
            if (
                vm.subResearchEntity.getType() === 'user' && vm.subResearchEntity.isSuperUser() || // = if user is SUPERUSER or ADMINISTRATOR
                vm.subResearchEntity.getType() === 'user' && vm.project.verifiedUsers.filter(u => u.id === vm.subResearchEntity.id).length > 0 || // if user has verified this project
                vm.subResearchEntity.getType() === 'user' && vm.project.verifiedGroups.map(g => g.id).some(id => vm.subResearchEntity.administratedGroups.map(g => g.id).includes(id)) || // if user is admin of group that has verified this project
                vm.subResearchEntity.getType() === 'group' && vm.project.verifiedGroups.find(g => g.id === vm.subResearchEntity.id) //if group has verified this project
            ) {
                vm.showBudgetDetails = true;
            }

            vm.showAnnualContribution = isVerifiedUserOrGroup();

            vm.PIMembers = vm.project.projectData.members.filter(m => {
                const pi = vm.project.pi.find(pi => pi.email === m.email);
                if (pi) {
                    return m;
                }
            });

            vm.project.category = industrialProjectCategories[vm.project.category];
            vm.project.payment = industrialProjectPayments[vm.project.payment];

            vm.groups = await GroupsService.getGroups();
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