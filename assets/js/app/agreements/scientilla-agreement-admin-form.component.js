/* global angular */

(function () {

    angular
        .module('agreements')
        .component('scientillaAgreementAdminForm', {
            templateUrl: 'partials/scientilla-agreement-admin-form.html',
            controller: AgreementAdminFormController,
            controllerAs: 'vm',
            bindings: {
                group: "<",
                onFailure: "&",
                onSubmit: "&",
                checkAndClose: "&"
            }
        });

    AgreementAdminFormController.$inject = [
        'GroupsService',
        'Notification',
        'EventsService',
        'UsersService',
        'userConstants'
    ];

    function AgreementAdminFormController(
        GroupsService,
        Notification,
        EventsService,
        UsersService,
        userConstants
    ) {
        const vm = this;
        vm.getUsersQuery = getUsersQuery;
        vm.cancel = cancel;
        vm.submit = submit;

        let originalGroupJson = '';

        vm.$onInit = function () {
            originalGroupJson = angular.toJson(vm.group);
        };

        function submit() {
            GroupsService.doSave(vm.group)
                .then(function () {
                    Notification.success("Group administrators saved");
                    EventsService.publish(EventsService.GROUP_UPDATED);
                    originalGroupJson = angular.copy(vm.group);
                    if (_.isFunction(vm.onSubmit()))
                        vm.onSubmit()(1);
                }, function (res) {
                    Notification.error("Something went wrong while saving!");
                });
        }

        function getUsersQuery(term) {
            return {model: 'users', qs: UsersService.getSearchQuery(term, [
                userConstants.role.USER,
                userConstants.role.SUPERUSER,
                userConstants.role.ADMINISTRATOR
            ])};
        }

        function cancel() {
            vm.checkAndClose()(() => originalGroupJson === angular.toJson(vm.group));
        }
    }
})();
