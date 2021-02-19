(function () {
    'use strict';

    angular.module('agreements')
        .component('agreementReferrerEditor', {
            templateUrl: 'partials/agreement-referrer-editor.html',
            controller: agreementReferrerEditor,
            controllerAs: 'vm',
            bindings: {
                referrers: '=',
                authorStr: '='
            }
        });

        agreementReferrerEditor.$inject = ['UsersService'];

    function agreementReferrerEditor(UsersService) {
        const vm = this;

        vm.addReferrer = addReferrer;
        vm.removeReferrer = removeReferrer;
        vm.getUsers = getUsers;

        vm.$onInit = function () {
            vm.newReferrer = '';
            vm.isDuplicate = false;

            if (!_.isArray(vm.referrers)) {
                vm.referrers = [];
            }

            if (!vm.authorStr) {
                vm.authorStr = '';
            }
        };

        vm.$onDestroy = function () {
        };

        function addReferrer($event = false) {
            console.log(vm.newReferrer);
            if (vm.referrers.find(r => r.email === vm.newReferrer.username)) {
                vm.isDuplicate = true;
            } else {
                if (vm.newReferrer) {
                    vm.referrers.push({
                        email: vm.newReferrer.username,
                        surname: vm.newReferrer.surname,
                        name: vm.newReferrer.name
                    });

                    let alias = false;
                    if (vm.newReferrer.aliases.length > 0) {
                        alias = vm.newReferrer.aliases[0];
                    }

                    if (alias && alias.str) {
                        if (vm.authorStr.length > 0) {
                            vm.authorStr = vm.authorStr.concat(', ' + alias.str);
                        } else {
                            vm.authorStr = alias.str;
                        }
                    }

                    vm.newReferrer = '';
                    vm.isDuplicate = false;
                }
            }

            if ($event) {
                $event.preventDefault();
            }
        }

        function removeReferrer(referrer) {
            //vm.referrer = vm.referrer.filter(r => r.id !== referrer.id);
            console.log(referrer);
        }

        function getUsers(searchText) {
            const qs = {where: {or: [
                {name: {contains: searchText}},
                {surname: {contains: searchText}},
                {display_name: {contains: searchText}},
                {display_surname: {contains: searchText}},
                {username: {contains: searchText}}
            ]}};
            return UsersService.getUsers(qs);
        }
    }

})();