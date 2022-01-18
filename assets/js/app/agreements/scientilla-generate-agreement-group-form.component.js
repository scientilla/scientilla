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
        'EventsService'
    ];

    function scientillaGenerateAgreementGroupFormController(ProjectService, UsersService, EventsService) {
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

        function getUsersQuery(searchText) {
            const qs = {
                where: {
                    or: [
                        {name: {contains: searchText}},
                        {surname: {contains: searchText}},
                        {displayName: {contains: searchText}},
                        {displaySurname: {contains: searchText}},
                    ]
                }
            };
            const model = 'users';
            return {model: model, qs: qs};
        }

        async function generateGroup() {
            await ProjectService.generateGroup(vm.agreement, vm.administrators);
            EventsService.publish(EventsService.PROJECT_GROUP_CREATED, vm.agreement);
            close();
        }

        /* jshint ignore:end */
    }
})();