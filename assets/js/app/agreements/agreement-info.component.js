(function () {
    angular
        .module('agreements')
        .component('agreementInfo', {
            controller: controller,
            templateUrl: 'partials/agreement-info.html',
            controllerAs: 'vm',
            bindings: {
                group: '<',
                active: '<?'
            }
        });

    controller.$inject = ['$element', 'ProjectService'];

    function controller($element, ProjectService) {
        const vm = this;

        vm.name = 'group-info';
        vm.shouldBeReloaded = true;

        let activeWatcher;

        vm.agreement = {};

        /* jshint ignore:start */
        vm.$onInit = async () => {
            const registerTab = requireParentMethod($element, 'registerTab');
            registerTab(vm);

            if (_.has(vm, 'active')) {
                activeWatcher = $scope.$watch('vm.active', async () => {
                    if (vm.active) {
                        await vm.reload();
                    } else {
                        vm.agreement = {};
                    }
                });
            }

        };
        /* jshint ignore:end */

        vm.$onDestroy = () => {
            const unregisterTab = requireParentMethod($element, 'unregisterTab');
            unregisterTab(vm);
        };

        /* jshint ignore:start */
        vm.reload = async function () {
            vm.agreement = await ProjectService.getAgreementOfGroup(vm.group);
        };
        /* jshint ignore:end */
    }
})();