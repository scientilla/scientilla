(function () {
    'use strict';

    angular.module('agreements')
        .component('scientillaAgreementDetails', {
            templateUrl: 'partials/scientilla-agreement-details.html',
            controller: scientillaAgreementDetails,
            controllerAs: 'vm',
            bindings: {
                agreement: "<"
            }
        });

    scientillaAgreementDetails.$inject = ['context', 'AuthService', 'UserService', 'GroupsService'];

    function scientillaAgreementDetails(context, AuthService, UserService, GroupsService) {
        const vm = this;

        vm.getAlias = UserService.getAlias;
        vm.groups = [];

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
    }

})();