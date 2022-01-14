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

    scientillaProjectDetails.$inject = ['context', 'AuthService', 'UserService', 'GroupsService', 'ModalService', '$filter'];

    function scientillaProjectDetails(context, AuthService, UserService, GroupsService, ModalService, $filter) {
        const vm = this;

        vm.getAlias = UserService.getAlias;
        vm.groups = [];
        vm.projectTypeCompetitive = projectTypeCompetitive;
        vm.projectTypeIndustrial = projectTypeIndustrial;
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

            if (_.has(vm.project, 'pi')) {
                vm.PIMembers = vm.project.projectData.members.filter(m => {
                    const pi = vm.project.pi.find(pi => pi.email === m.email);
                    if (pi) {
                        return m;
                    }
                });
            }

            vm.groups = await GroupsService.getGroups();

            if (vm.project.type.key === projectTypeCompetitive) {
                vm.annualContributionYears = [].concat.apply([], vm.project.researchLines.map(r => r.annualContribution.map(a => a.year))).filter((value, index, self) => self.indexOf(value) === index);
                vm.annualFundingPIYears = [].concat.apply([], vm.PIMembers.map(m => m.annualContribution.map(a => a.year))).filter((value, index, self) => self.indexOf(value) === index);
            }

            if (vm.project.type.key === projectTypeIndustrial) {
                vm.inCashAnnualContributionYears = [].concat.apply([], vm.project.researchLines.filter(r => _.has(r, 'InCashAnnualContribution')).map(r => r.InCashAnnualContribution.map(a => a.year))).filter((value, index, self) => self.indexOf(value) === index);
                vm.inCashAnnualFundingMembersYears = [].concat.apply([], vm.project.members.filter(m => _.has(m, 'InCashAnnualContribution')).map(m => m.InCashAnnualContribution.map(a => a.year))).filter((value, index, self) => self.indexOf(value) === index);
                vm.inKindAnnualContributionYears = [].concat.apply([], vm.project.researchLines.filter(r => _.has(r, 'InKindAnnualContribution')).map(r => r.InKindAnnualContribution.map(a => a.year))).filter((value, index, self) => self.indexOf(value) === index);
                vm.inKindAnnualFundingMembersYears = [].concat.apply([], vm.project.members.filter(m => _.has(m, 'InKindAnnualContribution')).map(m => m.InKindAnnualContribution.map(a => a.year))).filter((value, index, self) => self.indexOf(value) === index);
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

        vm.getAnnualContribution = function (item, year) {
            if (_.has(item, 'annualContribution')) {
                const annualContribution = item.annualContribution.find(a => a.year === year);

                if (annualContribution) {
                    return $filter('valuta')(annualContribution.contribution);
                }
            }

            return '';
        };

        vm.getInCashAnnualContribution = function (item, year) {
            if (_.has(item, 'InCashAnnualContribution')) {
                const inCashAnnualContribution = item.InCashAnnualContribution.find(a => a.year === year);

                if (inCashAnnualContribution) {
                    return $filter('valuta')(inCashAnnualContribution.contribution);
                }
            }

            return '';
        };

        vm.getInKindAnnualContribution = function (item, year) {
            if (_.has(item, 'InKindAnnualContribution')) {
                const inKindAnnualContribution = item.InKindAnnualContribution.find(a => a.year === year);

                if (inKindAnnualContribution) {
                    return $filter('valuta')(inKindAnnualContribution.contribution);
                }
            }

            return '';
        };
    }

})();
