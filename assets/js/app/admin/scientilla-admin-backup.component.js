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

        function restoreBackup() {
            ModalService
                .multipleChoiceConfirm('Restoring backup',
                    `Are you sure you want to restore the backup ${vm.dumpSelected.filename}?`,
                    ['Proceed'])
                .then(function (buttonIndex) {
                    switch (buttonIndex) {
                        case 0:
                            const postData = {filename: vm.dumpSelected.filename};
                            vm.loading = true;
                            return Restangular.one('backup', 'restore')
                                .customPOST(postData)
                                .then(e => {
                                    vm.loading = false;
                                    Notification.success('Backup correctly restored');
                                })
                                .catch(() => {
                                    Notification.error('An error happened');
                                    vm.loading = false;
                                });
                    }
                });
        }

        function makeBackup() {
            ModalService
                .multipleChoiceConfirm('Making backup',
                    `Are you sure you want to make a new backup?`,
                    ['Proceed'])
                .then(function (buttonIndex) {
                    switch (buttonIndex) {
                        case 0:
                            vm.loading = true;
                            return Restangular.one('backup', 'make')
                                .customPOST()
                                .then(res => {
                                    vm.loading = false;
                                    Notification.success(`Backup ${res.filename} correctly created`);
                                    loadDumps();
                                })
                                .catch(() => {
                                    Notification.error('An error happened');
                                    vm.loading = false;
                                });
                    }
                });
        }

        function loadDumps() {
            getDumps().then(dumps => {
                vm.dumps = dumps;
            });
        }

    }

})();