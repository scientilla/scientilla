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
        '$http',
        'Restangular',
        'ModalService',
        'Notification'
    ];

    function scientillaAdminBackup($http, Restangular, ModalService, Notification) {
        const vm = this;
        vm.getDumps = getDumps;
        vm.restoreBackup = restoreBackup;
        vm.makeBackup = makeBackup;
        vm.removeBackup = removeBackup;
        vm.uploadBackup = uploadBackup;
        vm.downloadBackup = downloadBackup;

        vm.dumps = [];
        vm.makingBackup = false;
        vm.restoringBackup = false;
        vm.backupUpload = null;
        vm.uploadingBackup = false;

        vm.$onInit = function () {
            loadDumps();
        };

        function getDumps() {
            return Restangular.one('backup', 'dumps').getList();
        }

        /* jshint ignore:start */
        async function restoreBackup(dump) {
            const buttonKey = await ModalService.multipleChoiceConfirm('Restoring backup',
                `Are you sure you want to restore the backup ${dump.filename}${dump.extension}?`,
                {'proceed': 'Proceed'});

            if (buttonKey === 'proceed') {
                const postData = {
                    filename: dump.filename + dump.extension,
                    autoBackup: dump.autoBackup
                };
                vm.restoringBackup = true;

                try {
                    await Restangular.one('backup', 'restore').customPOST(postData);
                    vm.restoringBackup = false;
                    Notification.success('Backup successfully restored!');
                } catch (e) {
                    Notification.error('An error happened!');
                    vm.restoringBackup = false;
                }
            }
        }

        async function makeBackup() {
            const buttonKey = await ModalService.multipleChoiceConfirm('Making backup',
                `Are you sure you want to make a new backup?`,
                {'proceed': 'Proceed'});

            if (buttonKey === 'proceed') {
                vm.makingBackup = true;

                try {
                    const res = await Restangular.one('backup', 'make').customPOST();
                    vm.makingBackup = false;
                    Notification.success(`Backup ${res.filename} successfully created!`);
                    loadDumps();
                } catch (e) {
                    Notification.error('An error happened!');
                    vm.makingBackup = false;
                }
            }
        }

        async function removeBackup(dump) {
            const buttonKey = await ModalService.multipleChoiceConfirm('Remove backup',
                `Are you sure you want to remove the backup ${dump.filename}${dump.extension}?`,
                {'proceed': 'Proceed'});

            if (buttonKey === 'proceed') {
                const postData = {filename: dump.filename + dump.extension};

                const res = await Restangular.one('backup', 'remove').customPOST(postData);

                if (res.type && res.type === 'success') {
                    Notification.success(res.message);
                    loadDumps();
                } else if (res.type && res.type === 'failed') {
                    Notification.warning(res.message);
                }
            }
        }

        async function uploadBackup() {
            const formData = new FormData();
            if (vm.backupUpload) {
                formData.append('file', vm.backupUpload);
            }

            vm.uploadingBackup = true;

            const res = await Restangular.one('backup/upload').customPOST(formData, '', undefined, {'Content-Type': undefined});

            vm.backupUpload = null;
            document.getElementById('backupUpload').value = null;

            if (res.type && res.type === 'success') {
                Notification.success(res.message);
                loadDumps();
                vm.uploadingBackup = false;
            } else if (res.type && res.type === 'failed') {
                Notification.warning(res.message);
                vm.uploadingBackup = false;
            }
        }

        function downloadBackup(dump) {
            const filename = dump.filename + dump.extension

            function createObjectURL(file) {
                if (window.webkitURL) {
                    return window.webkitURL.createObjectURL(file);
                } else if (window.URL && window.URL.createObjectURL) {
                    return window.URL.createObjectURL(file);
                } else {
                    return null;
                }
            }

            $http.post('/api/v1/backup/download', {
                filename: filename,
                autoBackup: dump.autoBackup
            }, {responseType: 'blob'}).then(res => {
                const element = document.createElement('a');
                element.setAttribute('href', createObjectURL(res.data));
                element.setAttribute('download', filename);

                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
            }).catch(err => {
                const reader = new FileReader();
                reader.addEventListener('loadend', (e) => {
                    Notification.warning(JSON.parse(e.srcElement['result']));
                });
                reader.readAsText(err.data);
            })
        }
        /* jshint ignore:end */

        function loadDumps() {
            getDumps().then(dumps => {
                vm.dumps = dumps;
            });
        }
    }

})();