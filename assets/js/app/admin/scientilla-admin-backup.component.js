(function () {
    'use strict';

    angular.module('admin')
        .component('scientillaAdminBackup', {
            templateUrl: 'partials/scientilla-admin-backup.html',
            controller: scientillaAdminBackup,
            controllerAs: 'vm',
            bindings: {}
        });

    scientillaAdminBackup.$inject = [
        'Restangular',
        'ModalService',
        'Notification'
    ];

    function scientillaAdminBackup(Restangular, ModalService, Notification) {
        const vm = this;
        vm.getDumps = getDumps;
        vm.toggleDump = toggleDump;
        vm.restoreBackup = restoreBackup;
        vm.makeBackup = makeBackup;

        vm.dumps = [];
        vm.loading = false;


        vm.$onInit = function () {
            loadDumps();
        };

        function getDumps() {
            return Restangular.one('backup', 'dumps').getList()
                .then(dumps =>
                    dumps.sort(function (a, b) {
                        if (a.filename > b.filename) return -1;
                        if (a.filename < b.filename) return 1;
                        return 0;
                    }));
        }

        function toggleDump(dumpFilename) {
            if (vm.loading)
                return;
            vm.dumpSelected = !vm.dumpSelected;
            vm.dumps.filter(d => d.selected && d.filename !== dumpFilename).forEach(d => d.selected = false);
            vm.dumpSelected = vm.dumps.find(d => d.filename === dumpFilename);
            if (vm.dumpSelected) {
                vm.dumpSelected.selected = !vm.dumpSelected.selected;
                if (!vm.dumpSelected.selected)
                    delete vm.dumpSelected;
            }
        }

        /* jshint ignore:start */

        async function restoreBackup() {
            const buttonKey = await ModalService.multipleChoiceConfirm('Restoring backup',
                `Are you sure you want to restore the backup ${vm.dumpSelected.filename}?`,
                {'proceed': 'Proceed'});

            if (buttonKey === 'proceed') {
                const postData = {filename: vm.dumpSelected.filename};
                vm.loading = true;

                try {
                    await Restangular.one('backup', 'restore').customPOST(postData);
                    vm.loading = false;
                    Notification.success('Backup correctly restored');
                } catch (e) {
                    Notification.error('An error happened');
                    vm.loading = false;
                }
            }

        }

        async function makeBackup() {
            const buttonKey = await ModalService.multipleChoiceConfirm('Making backup',
                `Are you sure you want to make a new backup?`,
                {'proceed': 'Proceed'});

            if (buttonKey === 'proceed') {
                vm.loading = true;

                try {
                    const res = await Restangular.one('backup', 'make').customPOST();
                    vm.loading = false;
                    Notification.success(`Backup ${res.filename} correctly created`);
                    loadDumps();
                } catch (e) {
                    Notification.error('An error happened');
                    vm.loading = false;
                }
            }
        }

        /* jshint ignore:end */

        function loadDumps() {
            getDumps().then(dumps => {
                vm.dumps = dumps;
            });
        }

    }

})();