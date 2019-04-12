/* global angular */

(function () {
        "use strict";

        angular.module('app')
            .component('scientillaAccomplishmentVerificationForm', {
                templateUrl: 'partials/scientilla-accomplishment-verification-form.html',
                controller,
                controllerAs: 'vm',
                bindings: {
                    researchItem: "<",
                    verificationFn: "&",
                    onFailure: "&",
                    onSubmit: "&"
                }
            });


        controller.$inject = [
            '$scope',
            'context',
            'ResearchEntitiesService',
            'ResearchItemService',
            'UsersService',
            'ModalService'
        ];

        function controller($scope, context, ResearchEntitiesService, ResearchItemService,UsersService, ModalService) {
            const vm = this;
            vm.submit = submit;
            vm.copyToDraft = copyToDraft;
            vm.cancel = cancel;
            vm.viewCopyToDraft = viewCopyToDraft;
            vm.canBeSubmitted = canBeSubmitted;
            vm.verificationData = {};
            vm.accomplishment = vm.researchItem;

            const researchEntity = context.getResearchEntity();
            let user;

            let originalVerificationData = {};

            vm.collapsed = true;

            vm.$onInit = function () {
                if (researchEntity.type === 'group')
                    return vm.onFailure()();

                vm.authorsNames = vm.accomplishment.authors.map(a => a.authorStr);

                user = context.getSubResearchEntity();
                vm.verificationData.position = ResearchItemService.getUserIndex(vm.accomplishment, user);
                vm.verificationData.public = true;
                vm.verificationData.favorite = false;

                originalVerificationData = angular.copy(vm.verificationData);
            };

            function copyToDraft() {
                ResearchEntitiesService.copyToDraft(vm.accomplishment);
                executeOnSubmit({buttonIndex: 0});
            }

            function canBeSubmitted() {
                return vm.verificationData.position >= 0;
            }

            /* jshint ignore:start */

            async function submit() {
                if (vm.verificationData.position >= vm.authorsNames.length)
                    return;

                const data = {
                    position: vm.verificationData.position,
                    'public': vm.verificationData.public,
                };

                const authorStr = vm.authorsNames[vm.verificationData.position];
                const alias = user.aliases.find(a => a.str.toLocaleLowerCase() === authorStr.toLocaleLowerCase());

                if (!alias) {
                    const aliases = user.aliases.map(a => a.str).join(', ');
                    const result = await ModalService.multipleChoiceConfirm('New alias!',
                        'You are verifying the item as "' + authorStr + '".\n' +
                        'By clicking on Proceed "' + authorStr + '" will be automatically added to your aliases (' + aliases + ').\n' +
                        'You can always manage them from your profile settings.\n',
                        ['Proceed']);

                    if (result === -1)
                        return;
                }

                try {
                    const res = await verify(data);
                    const newUser = await UsersService.getProfile(user.id);
                    context.setSubResearchEntity(newUser);
                    originalVerificationData = angular.copy(vm.verificationData);
                    executeOnSubmit({buttonIndex: 1, data: res});
                } catch (e) {
                    executeOnFailure();
                }
            }

            /* jshint ignore:end */


            function cancel() {
                vm.verificationData = angular.copy(originalVerificationData);
                executeOnSubmit({buttonIndex: 0});
            }

            function viewCopyToDraft() {
                return vm.accomplishment.kind === 'v';
            }

            function verify(verificationData) {
                if (_.isFunction(vm.verificationFn()))
                    return vm.verificationFn()(verificationData);
                return Promise.reject('no verification function');
            }

            function executeOnSubmit(res) {
                if (_.isFunction(vm.onSubmit()))
                    vm.onSubmit()(res);
            }

            function executeOnFailure() {
                if (_.isFunction(vm.onFailure()))
                    vm.onFailure()();
            }

        }
    }

)
();
