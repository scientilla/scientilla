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

        function controller($scope, context, ResearchEntitiesService, ResearchItemService, UsersService, ModalService) {
            const vm = this;
            vm.submit = submit;
            vm.copyToDraft = copyToDraft;
            vm.cancel = cancel;
            vm.viewCopyToDraft = viewCopyToDraft;
            vm.canBeSubmitted = canBeSubmitted;
            vm.getInstitutesFilter = getInstitutesFilter;
            vm.getInstitutesQuery = getInstitutesQuery;
            vm.verificationData = {};
            vm.accomplishment = vm.researchItem;

            const researchEntity = context.getResearchEntity();
            let authors, user, deregisterer;

            vm.collapsed = true;

            vm.$onInit = function () {
                if (researchEntity.type === 'group')
                    return vm.onFailure()();


                authors = ResearchItemService.getCompleteAuthors(vm.accomplishment);
                vm.authorsNames = authors.map(a => a.authorStr);

                user = context.getSubResearchEntity();
                vm.position = ResearchItemService.getUserIndex(vm.accomplishment, user);
                deregisterer = $scope.$watch('vm.position', authorSelectedChange);
            };

            vm.$onDestroy = function () {
                deregisterer();
            };

            function copyToDraft() {
                ResearchEntitiesService.copyToDraft(vm.accomplishment);
                executeOnSubmit({buttonIndex: 0});
            }

            function canBeSubmitted() {
                return vm.position >= 0;
            }

            function authorSelectedChange() {
                vm.verificationData = _.cloneDeep(authors[vm.position]);
                console.log(vm.verificationData);
            }

            /* jshint ignore:start */

            async function submit() {
                if (vm.position >= vm.authorsNames.length)
                    return;

                const data = {
                    position: vm.verificationData.position,
                    'public': vm.verificationData.public,
                    favorite: vm.verificationData.favorite,
                    affiliations: vm.verificationData.affiliations.map(af => af.id)
                };

                const authorStr = vm.authorsNames[vm.position];
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
                    executeOnSubmit({buttonIndex: 1, data: res});
                } catch (e) {
                    executeOnFailure();
                }
            }

            /* jshint ignore:end */

            function getInstitutesFilter() {
                return vm.verificationData.affiliations;
            }

            function getInstitutesQuery(searchText) {
                const qs = {where: {name: {contains: searchText}, parentId: null}};
                const model = 'institutes';
                return {model: model, qs: qs};
            }

            function cancel() {
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
