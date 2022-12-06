(function () {
    'use strict';

    angular.module('agreements')
        .component('agreementReferrerEditor', {
            templateUrl: 'partials/agreement-referrer-editor.html',
            controller: agreementReferrerEditor,
            controllerAs: 'vm',
            bindings: {
                referrers: '=',
                unsavedData: '=',
                authorsStr: '=',
                errors: '<',
                checkValidation: '&',
                fieldValueHasChanged: '&'
            }
        });

        agreementReferrerEditor.$inject = ['UsersService', 'Prototyper', '$scope'];

    function agreementReferrerEditor(UsersService, Prototyper, $scope) {
        const vm = this;

        vm.addReferrer = addReferrer;
        vm.removeReferrer = removeReferrer;
        vm.getUsers = getUsers;
        vm.canAddReferrer = false;

        let newReferrerWatcher;

        vm.$onInit = function () {
            vm.newReferrer = '';
            vm.isDuplicate = false;

            if (!_.isArray(vm.referrers)) {
                vm.referrers = [];
            }

            if (!vm.authorsStr) {
                vm.authorsStr = '';
            }

            newReferrerWatcher = $scope.$watch('vm.newReferrer', function() {
                vm.canAddReferrer = !!(vm.newReferrer && vm.newReferrer.username);
            });
        };

        vm.$onDestroy = function () {
            if (_.isFunction(newReferrerWatcher)) {
                newReferrerWatcher();
            }
        };

        function addReferrer($event = false) {

            if (!_.has(vm.newReferrer, 'username')) {
                return;
            }

            if (vm.referrers.find(r => r.email === vm.newReferrer.username)) {
                vm.isDuplicate = true;
            } else {
                if (vm.newReferrer) {
                    vm.newReferrer = Prototyper.toUserModel(vm.newReferrer);
                    vm.referrers.push({
                        email: vm.newReferrer.username,
                        surname: vm.newReferrer.getSurname(),
                        name: vm.newReferrer.getName()
                    });

                    setAuthorsStr(vm.newReferrer);

                    vm.newReferrer = '';
                    vm.isDuplicate = false;
                    vm.unsavedData = true;
                }
            }

            vm.checkValidation({field: 'pis'});

            if ($event) {
                $event.preventDefault();
            }
        }

        function setAuthorsStr(user) {
            let alias = false;

            if (user.aliases.length > 0) {
                alias = user.aliases[0];
            }

            if (alias && alias.str) {
                if (vm.authorsStr && vm.authorsStr.length > 0) {
                    vm.authorsStr = vm.authorsStr.concat(', ' + alias.str);
                } else {
                    vm.authorsStr = alias.str;
                }
            }
        }

        /* jshint ignore:start */
        async function removeReferrer(referrer) {
            vm.referrers = vm.referrers.filter(r => r.email !== referrer.email);
            const referrerUsers = await getReferrerUsers();

            vm.authorsStr = '';
            for (const referrer of vm.referrers) {
                const referrerUser = referrerUsers.find(u => u.username === referrer.email);
                if (referrerUser) {
                    setAuthorsStr(referrerUser);
                }
            }

            vm.checkValidation({field: 'pis'});
            vm.unsavedData = true;
        }

        async function getUsers(term) {
            return await UsersService.search(term, [
                userConstants.role.USER,
                userConstants.role.SUPERUSER,
                userConstants.role.ADMINISTRATOR
            ]);
        }
        /* jshint ignore:end */

        function getReferrerUsers() {
            const qs = { where: { username: vm.referrers.map(r => r.email) } };
            return UsersService.getUsers(qs);
        }
    }

})();
