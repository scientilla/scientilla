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
        'Prototyper'
    ];

    function controller(
        researchEntityService,
        GroupsService,
        $scope,
        Prototyper
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
                        vm.institute = false;
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

            let institute = false;

            allMembershipGroups = await researchEntityService.getAllMembershipGroups(vm.user.id, {});
            allMembershipGroups = _.orderBy(allMembershipGroups, 'level', 'desc');
            const groupedAllMembershipGroups = _.cloneDeep(_.groupBy(allMembershipGroups, 'child_group.name'));

            for (const name in groupedAllMembershipGroups) {

                const subgroups = groupedAllMembershipGroups[name];

                for (const subgroup of subgroups) {

                    if (subgroup.group.id === 1) {
                        // Store the parent group as institute if it's empty
                        if (_.isEmpty(institute)) {
                            institute = Prototyper.toGroupModel(subgroup.group);
                        }

                        continue;
                    }

                    let parent = subgroups.find(s => s.level === subgroup.level + 1);

                    // Skip if the parent element is empty
                    if (!parent || !_.has(parent, 'group')) {
                        continue;
                    }

                    parent = parent.group;

                    if (parent.id === 1) {
                        parent = institute;
                    }

                    if (!_.has(parent, 'childGroups')) {
                        parent.childGroups = [];
                    }
                    parent.childGroups.push(Prototyper.toGroupModel(subgroup.group));
                }
            }

            vm.institute = institute;

            if (allMembershipGroups.length > 1) {
                vm.types = _.groupBy(vm.institute.childGroups, 'type');
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
            return _.groupBy(group.childGroups, 'type');
        };

        vm.getLength = (subtypes) => {
            return Object.keys(subtypes).length;
        };
    }
})();