(function () {
    'use strict';

    angular.module('admin')
        .component('scientillaAdminCidAssociation', {
            templateUrl: 'partials/scientilla-admin-cid-association.html',
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

        vm.name = 'cidAssociation';
        vm.shouldBeReloaded = false;

        vm.associations = [];

        /* jshint ignore:start */
        vm.$onInit = async function () {
            const registerTab = requireParentMethod($element, 'registerTab');
            registerTab(vm);

            const res = await Restangular.one('general-setting', 'cid-associations').get();

            if (_.has(res, 'data') && !_.isEmpty(res.data)) {
                for (const association of res.data) {
                    vm.associations.push({
                        email: association.email,
                        cid: association.cid,
                        editable: false
                    })
                }
            }
        };
        /* jshint ignore:end */

        vm.$onDestroy = function () {
            const unregisterTab = requireParentMethod($element, 'unregisterTab');
            unregisterTab(vm);
        };

        vm.addAssociation = function () {
            vm.associations.push({
                email: '',
                cid: '',
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
            for (const association of vm.associations) {
                toBeSavedAssociations.push({
                    email: association.email,
                    cid: association.cid
                });
            }

            const formData = new FormData();
            formData.append('data', JSON.stringify(toBeSavedAssociations));

            const result = await Restangular.one('general-setting', 'cid-associations')
                .customPOST(formData, '', undefined, { 'Content-Type': undefined });

            if (!_.isEmpty(result)) {
                Notification.success('The associations are been saved!');
            } else {
                Notification.warning('Something went wrong, please try again!');
            }

            for (const association of vm.associations) {
                association.editable = false;
            }
        };
        /* jshint ignore:end */
    }

})();