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
        'context'
    ];

    function controller(
        researchEntityService,
        GroupsService,
        $scope,
        Prototyper,
        context
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
            if (
                (vm.subResearchEntity.getType() === 'user' && !vm.subResearchEntity.isSuperViewer()) ||
                vm.subResearchEntity.getType() === 'group'
            ) {
                allMembershipGroups = allMembershipGroups.filter(m => m.active)
            }
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
                        }
                    }
                }
            }

            vm.mainMembership = uniqueMemberships.find(m => m.group.id === 1);
            vm.mainMembership.group = Prototyper.toGroupModel(vm.mainMembership.group);

            if (allMembershipGroups.length > 1) {
                vm.types = _.groupBy(vm.mainMembership.childMemberships, 'group.type');
            }

            if (!_.isEmpty(vm.types)) {
                vm.hasTypes = true;
            }

            vm.loading = false;
        }
        /* jshint ignore:end */

        vm.$onDestroy = () => {
            if (_.isFunction(activeWatcher)) {
                activeWatcher();
            }
        };

        vm.isActiveMember = (user, group) => {
            const membership = allMembershipGroups.find(m => m.user === user.id && m.group.id === group.id);
            if (membership) {
                return membership.active;
            }
            return false;
        };

        vm.getGroupTypes = (group) => {
            return _.groupBy(group.childMemberships, 'group.type');
        };

        vm.getLength = (subtypes) => {
            return Object.keys(subtypes).length;
        };
    }
})();
