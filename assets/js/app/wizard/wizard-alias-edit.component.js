(function () {
    'use strict';

    angular.module('wizard')
        .component('wizardAliasEdit', {
            templateUrl: 'partials/wizard-alias-edit.html',
            controller: wizardAliasEdit,
            controllerAs: 'vm',
            bindings: {
                user: '=',
                originalUser: '='
            }
        });

    wizardAliasEdit.$inject = [
        'Notification',
        '$timeout',
        'context',
        'Restangular'
    ];

    function wizardAliasEdit(Notification, $timeout, context, Restangular) {
        const vm = this;

        vm.save = save;
        vm.saveStatus = saveStatus();

        vm.$onDestroy = function () {
        };

        /* jshint ignore:start */
        async function save() {
            vm.saveStatus.setState('saving');
            try {
                const newAliases = vm.user.aliases.map(a => {
                    return {str: a.str, main: a.main};
                });
                await Restangular.one('users', vm.user.id).customPUT(newAliases, 'aliases');
                vm.saveStatus.setState('saved');
                Notification.success(vm.saveStatus.message);
                vm.originalUser = angular.copy(vm.user);
                aliasesChanged();

                $timeout(function() {
                    vm.saveStatus.setState('ready to save');
                }, 1000);
            } catch(e) {
                vm.saveStatus.setState('failed');
                Notification.warning(vm.saveStatus.message);

                $timeout(function() {
                    vm.saveStatus.setState('ready to save');
                }, 1000);
            }
        }
        /* jshint ignore:end */

        function saveStatus() {
            return {
                setState: function (state) {
                    this.state = state;

                    switch(true) {
                        case state === 'ready to save':
                            this.message = 'Save aliases';
                            break;
                        case state === 'saving':
                            this.message = 'Saving aliases';
                            break;
                        case state === 'saved':
                            this.message = 'Aliases are saved!';
                            break;
                        case state === 'failed':
                            this.message = 'Failed to save aliases!';
                            break;
                    }
                },
                state: 'ready to save',
                message: 'Save aliases'
            };
        }

        function aliasesChanged() {
            const subResearchEntity = context.getSubResearchEntity();
            if (subResearchEntity.id === vm.user.id && subResearchEntity.getType() === 'user')
                subResearchEntity.aliases = vm.user.aliases;
        }
    }

})();