/* global angular */
(function () {
    "use strict";

    angular
        .module('app')
        .component('scientillaGenerateAgreementGroupForm', {
            templateUrl: 'partials/scientilla-generate-agreement-group-form.html',
            controller: scientillaGenerateAgreementGroupFormController,
            controllerAs: 'vm',
            bindings: {
                agreement: "<",
                closeFn: "&",
                checkAndClose: "&"
            }
        });

    scientillaGenerateAgreementGroupFormController.$inject = [
        'ProjectService',
        'UsersService',
        'EventsService',
        'userConstants'
    ];

    function scientillaGenerateAgreementGroupFormController(ProjectService, UsersService, EventsService, userConstants) {
        const vm = this;

        vm.cancel = close;
        vm.generateGroup = generateGroup;
        vm.getUsersQuery = getUsersQuery;

        /* jshint ignore:start */
        vm.$onInit = async function () {
            vm.administrators = await UsersService.getUsers({username: vm.agreement.projectData.pis.map(pi => pi.email)});
        };

        function close() {
            if (_.isFunction(vm.checkAndClose()))
                vm.checkAndClose()(() => !vm.unsavedData);
        }

        function getUsersQuery(term) {
            return {model: 'users', qs: UsersService.getSearchQuery(term, [
                userConstants.role.USER,
                userConstants.role.SUPERUSER,
                userConstants.role.ADMINISTRATOR
            ])};
        }

        async function generateGroup() {
            await ProjectService.generateGroup(vm.agreement, vm.administrators);
            EventsService.publish(EventsService.PROJECT_GROUP_CREATED, vm.agreement);
            close();
        }

        /* jshint ignore:end */
    }
})();
