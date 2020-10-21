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
        vm.loading = false;

        /* jshint ignore:start */
        vm.$onInit = async function () {
            const registerTab = requireParentMethod($element, 'registerTab');
            registerTab(vm);

            vm.loading = true;

            // We get all the connections between the groups
            const membershipGroups = await GroupsService.getMembershipGroups();

            vm.institute = GroupsService.createInstituteStructure(vm.institute, membershipGroups);

            vm.types = _.groupBy(vm.institute.childGroups, 'type');

            vm.loading = false;
        };
        /* jshint ignore:end */

        vm.$onDestroy = function () {
            const unregisterTab = requireParentMethod($element, 'unregisterTab');
            unregisterTab(vm);
        };

        vm.getGroupTypes = (group) => {
            return _.groupBy(group.childGroups, 'type');
        };

        vm.getLength = (subtypes) => {
            return Object.keys(subtypes).length;
        };

        vm.getTypeTitle = GroupsService.getTypeTitle;
    }

})();