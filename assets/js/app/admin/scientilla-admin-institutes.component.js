(function () {
    'use strict';

    angular.module('admin')
        .component('scientillaAdminInstitutes', {
            templateUrl: 'partials/scientilla-admin-institutes.html',
            controller: controller,
            controllerAs: 'vm',
            bindings: {}
        });

    controller.$inject = [
        'Restangular',
        'Notification',
        'ModalService'
    ];

    function controller(Restangular, Notification, ModalService) {
        const vm = this;
        vm.getInstitutes = getInstitutes;
        vm.formatInstitute = formatInstitute;
        vm.editInstitute = editInstitute;
        vm.deleteInstitute = deleteInstitute;
        vm.onInstituteSearchKey = onInstituteSearchKey;
        vm.openInstituteModal = openInstituteModal;

        vm.$onInit = function () {
            vm.institute = {};
        };

        function getInstitutes(searchText) {

            const token = searchText.split(' | ')[0];
            if (token.length < 2)
                return [];

            const qs = {
                where: {
                    name: {
                        contains: token
                    }
                }
            };
            return Restangular.all('institutes').getList(qs);
        }

        function formatInstitute(institute) {
            if (!institute || !institute.id) return '';
            return institute.name + ' | ' + institute.id + ' | ' + institute.parentId;
        }

        function deleteInstitute() {
            if (!vm.selectedInstitute || !vm.selectedInstitute.id) return;
            Restangular.one('institutes', vm.selectedInstitute.id).remove()
                .then(() => {
                    Notification.info('Institute is been deleted!');
                    vm.selectedInstitute = undefined;
                })
                .catch(e => Notification.warning(e.data.details));
        }

        function onInstituteSearchKey(event) {
            if (event.key === 'Escape') {
                event.preventDefault();
                vm.selectedInstitute = undefined;
            }
        }

        function openInstituteModal() {
            ModalService
                .openInstituteModal(vm.institute);
        }

        function editInstitute() {
            ModalService
                .openInstituteModal(vm.selectedInstitute);
        }
    }

})();