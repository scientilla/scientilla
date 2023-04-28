(function () {
    'use strict';

    angular.module('admin')
        .component('scientillaAdminRoleAssociation', {
            templateUrl: 'partials/scientilla-admin-role-association.html',
            controller: controller,
            controllerAs: 'vm',
            bindings: {}
        });

    controller.$inject = [
        'Restangular',
        '$element',
        'Notification'
    ];

    function controller(Restangular, $element, Notification) {
        const vm = this;

        vm.name = 'roleAssociation';
        vm.shouldBeReloaded = false;

        vm.associations = [];

        /* jshint ignore:start */
        vm.$onInit = async function () {
            const registerTab = requireParentMethod($element, 'registerTab');
            registerTab(vm);

            await vm.getRoleAssociations();
        };
        /* jshint ignore:end */

        vm.$onDestroy = function () {
            const unregisterTab = requireParentMethod($element, 'unregisterTab');
            unregisterTab(vm);
        };

        /* jshint ignore:start */
        vm.getRoleAssociations = async function () {
            const res = await Restangular.one('general-setting', 'role-associations').get();

            if (_.has(res, 'data') && !_.isEmpty(res.data)) {
                vm.associations = [];
                for (const association of res.data) {
                    vm.associations.push({
                        originalRole: association.originalRole,
                        roleCategory: association.roleCategory,
                        editable: false
                    })
                }
            }
        };
        /* jshint ignore:end */

        vm.addAssociation = function () {
            vm.associations.push({
                originalRole: '',
                roleCategory: '',
                editable: true
            });
        };

        vm.editAssociation = function (index) {
            vm.associations[index].editable = true;
        };

        vm.lockAssociation = function (index) {
            vm.associations[index].editable = false;
        };

        vm.deleteAssociation = function (index) {
            vm.associations.splice(index, 1);
        };

        /* jshint ignore:start */
        vm.saveAssociations = async function () {
            const toBeSavedAssociations = [];
            const duplicateAssociations = [];
            for (const association of vm.associations) {
                const tmpDuplicate = toBeSavedAssociations.find(a => _.lowerCase(a.originalRole) === _.lowerCase(association.originalRole));
                if (!tmpDuplicate) {
                    toBeSavedAssociations.push({
                        originalRole: association.originalRole,
                        roleCategory: association.roleCategory
                    });
                } else {
                    duplicateAssociations.push(association);
                }
            }

            if (!_.isEmpty(duplicateAssociations)) {
                Notification.info(`The duplicate${duplicateAssociations.length > 1 ? 's' : ''}: "${duplicateAssociations.map(a => a.originalRole).join(', ')}" ${duplicateAssociations.length > 1 ? 'are' : 'is'} been removed automatically!`);
            }

            const formData = new FormData();
            formData.append('data', JSON.stringify(toBeSavedAssociations));

            const result = await Restangular.one('general-setting', 'role-associations')
                .customPOST(formData, '', undefined, { 'Content-Type': undefined });

            await vm.getRoleAssociations();

            if (!_.isEmpty(result)) {
                Notification.success('The associations are been saved!');
            } else {
                Notification.warning('Something went wrong, please try again!');
            }
        };
        /* jshint ignore:end */
    }

})();
