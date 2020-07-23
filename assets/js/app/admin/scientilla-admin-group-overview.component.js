(function () {
    'use strict';

    angular.module('admin')
        .component('scientillaAdminGroupOverview', {
            templateUrl: 'partials/scientilla-admin-group-overview.html',
            controller: controller,
            controllerAs: 'vm',
            bindings: {}
        });

    controller.$inject = [
        'Restangular',
        '$element',
        'GroupsService'
    ];

    function controller(Restangular, $element, GroupsService) {
        const vm = this;

        vm.name = 'groupOverview';
        vm.shouldBeReloaded = false;

        vm.institute = false;
        vm.types = [];

        /* jshint ignore:start */
        vm.$onInit = async function () {
            const registerTab = requireParentMethod($element, 'registerTab');
            registerTab(vm);

            // We get all the connections between the groups
            const membershipGroups = await GroupsService.getMembershipGroups();

            // Map the index of membershipGroups with child group => index = value, child group id = key
            const indexMapping = membershipGroups.reduce((acc, el, i) => {
                acc[el.child_group.id] = i;
                return acc;
            }, {});

            // Loop over membership groups
            membershipGroups.forEach(el => {

                let parentEl;

                // Handle the main institute
                if (el.parent_group.id === 1) {
                    // Store the parent group as institute if it's empty
                    if (_.isEmpty(vm.institute)) {
                        vm.institute = el.parent_group;
                    }
                    // Set the parent element to the institute
                    parentEl = vm.institute;
                } else {
                    // Use our mapping to locate the parent element in our data array
                    parentEl = membershipGroups[indexMapping[el.parent_group.id]];
                }

                // Skip if the parent element is empty
                if (!parentEl) {
                    return;
                }

                // Add our current element to its parent's `childGroups` array
                const group = el.child_group;
                group.childGroups = el.childGroups || [];
                if (!_.has(parentEl, 'childGroups')) {
                    parentEl.childGroups = [];
                }
                parentEl.childGroups.push(group);
            });

            vm.types = _.groupBy(vm.institute.childGroups, 'type');
        };
        /* jshint ignore:end */

        vm.$onDestroy = function () {
            const unregisterTab = requireParentMethod($element, 'unregisterTab');
            unregisterTab(vm);
        };

        vm.getGroupTypes = (group) => {
            return _.groupBy(group.childGroups, 'type');
        };

        vm.getTypeTitle = GroupsService.getTypeTitle;
    }

})();