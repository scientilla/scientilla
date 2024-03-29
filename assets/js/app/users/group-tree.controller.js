(function () {
    angular
        .module('users')
        .component('groupTree', {
            controller: controller,
            templateUrl: 'partials/group-tree.html',
            controllerAs: 'vm',
            bindings: {
                user: '<',
                active: '<?'
            }
        });

    controller.$inject = [
        'researchEntityService',
        'GroupsService',
        '$scope',
        'Prototyper',
        'context',
        'groupTypes'
    ];

    function controller(
        researchEntityService,
        GroupsService,
        $scope,
        Prototyper,
        context,
        groupTypes
    ) {
        const vm = this;

        vm.loading = false;

        let allMembershipGroups = [];
        let activeWatcher;

        vm.types = [];
        vm.hasTypes = false;
        vm.getTypeTitle = GroupsService.getTypeTitle;

        /* jshint ignore:start */
        vm.$onInit = async () => {

            if (_.has(vm, 'active')) {
                activeWatcher = $scope.$watch('vm.active', () => {

                    if (vm.active) {
                        loadGroupTree();
                    } else {
                        vm.mainMembership = false;
                    }
                });

                if (vm.active) {
                    loadGroupTree();
                }
            } else {
                loadGroupTree();
            }
        };

        async function loadGroupTree() {
            vm.loading = true;
            vm.subResearchEntity = context.getSubResearchEntity();

            allMembershipGroups = await researchEntityService.getAllMembershipGroups(vm.user.id, {});
            allMembershipGroups = allMembershipGroups.filter(m => m.group.type !== groupTypes.RESEARCH_DOMAIN && m.active);

            const groupedAllMembershipGroups = _.groupBy(allMembershipGroups, 'child_group.name');
            const uniqueMemberships = [];
            for (const membership of allMembershipGroups) {
                if (!uniqueMemberships.find(m => m.group.id === membership.group.id)) {
                    uniqueMemberships.push(membership);
                }
            }

            for (const name in groupedAllMembershipGroups) {
                const membershipGroup = _.orderBy(groupedAllMembershipGroups[name], 'level', 'asc');

                for (const membership of membershipGroup) {
                    const parentMembership = membershipGroup.find(m => m.level === membership.level + 1);
                    if (!parentMembership) {
                        continue;
                    }

                    const uniqueMembership = uniqueMemberships.find(m => m.group.id === parentMembership.group.id);
                    if (uniqueMembership) {
                        if (!_.has(uniqueMembership, 'childMemberships')) {
                            uniqueMembership.childMemberships = [];
                        }

                        if (!uniqueMembership.childMemberships.find(m => m.group.id === membership.group.id)) {
                            membership.group = Prototyper.toGroupModel(membership.group);
                            uniqueMembership.childMemberships.push(membership);
                            uniqueMembership.childMemberships = _.orderBy(uniqueMembership.childMemberships, 'group.name');
                        }

                        uniqueMembership.types = _.groupBy(uniqueMembership.childMemberships, 'group.type');
                    }
                }
            }

            vm.mainMembership = uniqueMemberships.find(m => m.group.id === 1);
            vm.mainMembership.group = Prototyper.toGroupModel(vm.mainMembership.group);
            vm.loading = false;
        }
        /* jshint ignore:end */

        vm.$onDestroy = () => {
            if (_.isFunction(activeWatcher)) {
                activeWatcher();
            }
        };

        vm.isActiveMember = (user, group) => {
            const membership = allMembershipGroups.find(m => m.user === user.id && group && m.group.id === group.id);
            if (membership) {
                return membership.active;
            }
            return false;
        };
    }
})();
