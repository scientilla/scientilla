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
        vm.onInstituteSearchKey = onInstituteSearchKey;

        vm.$onInit = function () {
            vm.selectedInstitute = undefined;
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

        function onInstituteSearchKey(event) {
            if (event.key === 'Escape') {
                event.preventDefault();
                vm.selectedInstitute = undefined;

            }
        }

    }

})();