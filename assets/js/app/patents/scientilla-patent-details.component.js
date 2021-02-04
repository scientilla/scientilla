(function () {
    'use strict';

    angular.module('patents')
        .component('scientillaPatentDetails', {
            templateUrl: 'partials/scientilla-patent-details.html',
            controller: scientillaPatentDetails,
            controllerAs: 'vm',
            bindings: {
                patent: "<"
            }
        });

    scientillaPatentDetails.$inject = ['GroupsService', 'ModalService'];

    function scientillaPatentDetails(GroupsService, ModalService) {
        const vm = this;

        vm.groups = [];
        vm.collapsed = true;

        /* jshint ignore:start */
        vm.$onInit = async function () {
            vm.groups = await GroupsService.getGroups();
        };
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
    }

})();