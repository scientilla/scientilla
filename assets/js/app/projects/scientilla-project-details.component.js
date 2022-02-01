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

    scientillaProjectDetails.$inject = ['context', 'AuthService', 'UserService', 'UsersService', 'GroupsService', 'ModalService', '$filter'];

    function scientillaProjectDetails(context, AuthService, UserService, UsersService, GroupsService, ModalService, $filter) {
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

            if (vm.project.type.key === projectTypeCompetitive) {
                vm.annualContributionYears = [].concat.apply([], vm.project.researchLines.map(r => r.annualContribution.map(a => a.year))).filter((value, index, self) => self.indexOf(value) === index);
                vm.annualFundingPIYears = [].concat.apply([], vm.PIMembers.map(m => m.annualContribution.map(a => a.year))).filter((value, index, self) => self.indexOf(value) === index);
            }

            if (vm.project.type.key === projectTypeIndustrial) {
                vm.inCashAnnualContributionYears = [].concat.apply([], vm.project.researchLines.filter(r => _.has(r, 'inCashAnnualContribution')).map(r => r.inCashAnnualContribution.map(a => a.year))).filter((value, index, self) => self.indexOf(value) === index);
                vm.inCashAnnualFundingMembersYears = [].concat.apply([], vm.project.members.filter(m => _.has(m, 'inCashAnnualContribution')).map(m => m.inCashAnnualContribution.map(a => a.year))).filter((value, index, self) => self.indexOf(value) === index);
                vm.inKindAnnualContributionYears = [].concat.apply([], vm.project.researchLines.filter(r => _.has(r, 'inKindAnnualContribution')).map(r => r.inKindAnnualContribution.map(a => a.year))).filter((value, index, self) => self.indexOf(value) === index);
                vm.inKindAnnualFundingMembersYears = [].concat.apply([], vm.project.members.filter(m => _.has(m, 'inKindAnnualContribution')).map(m => m.inKindAnnualContribution.map(a => a.year))).filter((value, index, self) => self.indexOf(value) === index);
            }

            vm.industrialProjectPayments = industrialProjectPayments;

            const groupCodes = vm.project.researchLines.map(researchLine => researchLine.code);
            vm.groups = await GroupsService.getGroups({ where: {
                or: groupCodes.map(code => {
                    return {
                        code: code
                    }
                })
            }});

            const emailAddresses = vm.project.members.map(m => m.email);
            vm.users = await UsersService.getUsers({ username: emailAddresses });
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

        vm.getUserUrl = function(member) {
            if (!_.isEmpty(vm.users)) {
                const user = vm.users.find(u => u.username === member.email);

                if (user) {
                    return '/#' + user.getProfileUrl();
                }
            }
            return;
        };

        vm.closeModal = function () {
            ModalService.close('close');
        };

        vm.isGroup = function (researchLine) {
            if (!_.isEmpty(vm.groups)) {
                const group = vm.groups.find(g => g.code === researchLine.code);

                if (group) {
                    return group;
                }
            }
            return false;
        };

        vm.isUser = function (member) {
            if (!_.isEmpty(vm.users)) {
                const user = vm.users.find(u => u.username === member.email);

                if (user) {
                    return user;
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

            return $filter('valuta')(0);
        };

        vm.getInCashAnnualContribution = function (item, year) {
            if (_.has(item, 'inCashAnnualContribution')) {
                const inCashAnnualContribution = item.inCashAnnualContribution.find(a => a.year === year);

                if (inCashAnnualContribution) {
                    return $filter('valuta')(inCashAnnualContribution.contribution);
                }
            }

            return $filter('valuta')(0);
        };

        vm.getInKindAnnualContribution = function (item, year) {
            if (_.has(item, 'inKindAnnualContribution')) {
                const inKindAnnualContribution = item.inKindAnnualContribution.find(a => a.year === year);

                if (inKindAnnualContribution) {
                    return $filter('valuta')(inKindAnnualContribution.contribution);
                }
            }

            return $filter('valuta')(0);
        };
    }

})();
