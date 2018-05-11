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
        'Notification'
    ];

    function controller(Restangular, Notification) {
        const vm = this;
        vm.getInstitutes = getInstitutes;
        vm.formatInstitute = formatInstitute;
        vm.saveInstitute = saveInstitute;
        vm.deleteInstitute = deleteInstitute;
        vm.createInstitute = createInstitute;
        vm.onInstituteSearchKey = onInstituteSearchKey;

        vm.$onInit = function () {
            vm.newInstitute = {};
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

        function saveInstitute() {
            if (!vm.selectedInstitute)
                return;

            for (const field in vm.selectedInstitute)
                if (vm.selectedInstitute[field] === '')
                    vm.selectedInstitute[field] = null;

            vm.selectedInstitute.save()
                .then(() => {
                    Notification.info('saved');
                    vm.selectedInstitute = undefined;
                })
                .catch(e => Notification.warning(e.data.details));
        }

        function createInstitute() {
            if (!vm.newInstitute.name) return;
            Restangular.all('institutes').post(vm.newInstitute)
                .then(() => {
                    Notification.info('Created');
                    vm.newInstitute = {};
                })
                .catch(e => Notification.warning(e.data.details));
        }

        function deleteInstitute() {
            if (!vm.selectedInstitute || !vm.selectedInstitute.id) return;
            if (!confirm('Delete this institute')) return;
            Restangular.one('institutes', vm.selectedInstitute.id).remove()
                .then(() => {
                    Notification.info('Deleted');
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

    }

})();