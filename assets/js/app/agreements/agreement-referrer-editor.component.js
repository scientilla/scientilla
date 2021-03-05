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
                piStr: '=',
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

            if (!vm.piStr) {
                vm.piStr = '';
            }

            newReferrerWatcher = $scope.$watch('vm.newReferrer', function() {
                if (vm.newReferrer && vm.newReferrer.username) {
                    vm.canAddReferrer = true;
                } else {
                    vm.canAddReferrer = false;
                }
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

                    setPiStr(vm.newReferrer);

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

        function setPiStr(user) {
            let alias = false;

            if (user.aliases.length > 0) {
                alias = user.aliases[0];
            }

            if (alias && alias.str) {
                if (vm.piStr.length > 0) {
                    vm.piStr = vm.piStr.concat(', ' + alias.str);
                } else {
                    vm.piStr = alias.str;
                }
            }
        }

        /* jshint ignore:start */
        async function removeReferrer(referrer) {
            vm.referrers = vm.referrers.filter(r => r.email !== referrer.email);
            const referrerUsers = await getReferrerUsers();

            vm.piStr = '';
            for (const referrer of vm.referrers) {
                const referrerUser = referrerUsers.find(u => u.username === referrer.email);
                if (referrerUser) {
                    setPiStr(referrerUser);
                }
            }

            vm.checkValidation({field: 'pis'});
            vm.unsavedData = true;
        }
        /* jshint ignore:end */

        function getUsers(searchText) {
            const qs = { where: { or: [
                { name: { contains: searchText } },
                { surname: { contains: searchText } },
                { display_name: { contains: searchText } },
                { display_surname: { contains: searchText } },
                { username: { contains: searchText } }
            ]}};
            return UsersService.getUsers(qs);
        }

        function getReferrerUsers() {
            const qs = { where: { username: vm.referrers.map(r => r.email) } };
            return UsersService.getUsers(qs);
        }
    }

})();