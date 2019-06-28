/* global Scientilla */

(function () {
        "use strict";

        angular
            .module('users')
            .component('scientillaDocumentVerificationForm', {
                templateUrl: 'partials/scientilla-document-verification-form.html',
                controller: DocumentVerificationController,
                controllerAs: 'vm',
                bindings: {
                    document: "<",
                    document2: "<",
                    verificationFn: "&",
                    onFailure: "&",
                    onSubmit: "&"
                }
            });


        DocumentVerificationController.$inject = [
            '$scope',
            'Restangular',
            'context',
            'UsersService',
            'ModalService'
        ];

        function DocumentVerificationController($scope, Restangular, context, UsersService, ModalService) {
            const vm = this;
            vm.instituteToId = instituteToId;
            vm.getInstitutesFilter = getInstitutesFilter;
            vm.getInstitutesQuery = getInstitutesQuery;
            vm.submit = submit;
            vm.copyToDraft = copyToDraft;
            vm.cancel = cancel;
            vm.viewSynchFields = viewSynchFields;
            vm.viewSynchMessage = viewSynchMessage;
            vm.viewAuthorshipFields = viewAuthorshipFields;
            vm.viewCopyToDraft = viewCopyToDraft;
            vm.viewLastCoauthor = viewLastCoauthor;
            vm.viewFirstCoauthor = viewFirstCoauthor;
            vm.viewOralPresentation = viewOralPresentation;
            vm.verificationData = {};
            vm.canBeSubmitted = canBeSubmitted;
            if (vm.document2)
                vm.document2id = vm.document2.id;

            let user;
            const DocumentService = context.getDocumentService();
            const deregisteres = [];
            const coauthorsDeregisteres = [];

            vm.collapsed = true;

            vm.$onInit = function () {

                user = context.getSubResearchEntity();
                vm.verificationData.position = vm.document.getUserIndex(user);

                if (user.getType() === 'group')
                    return vm.onFailure()();

                vm.verificationData.synchronize = vm.document.synchronized;
                vm.verificationData.public = true;

                deregisteres.push($scope.$watch('vm.verificationData.position', userSelectedChanged));
            };

            vm.$onDestroy = () => {
                for (const deregisterer of deregisteres)
                    deregisterer();

                for (const deregisterer of coauthorsDeregisteres)
                    deregisterer();
            };

            function getInstitutesQuery(searchText) {
                var qs = {where: {name: {contains: searchText}, parentId: null}};
                var model = 'institutes';
                return {model: model, qs: qs};
            }

            function instituteToId(institute) {
                return institute.id;
            }

            function copyToDraft() {
                DocumentService.copyDocument(vm.document);
                executeOnSubmit({buttonIndex: 0});
            }

            function canBeSubmitted() {
                return vm.verificationData.affiliations &&
                    vm.verificationData.affiliations.length &&
                    vm.verificationData.position >= 0;
            }

            /* jshint ignore:start */

            async function submit() {
                const authorsArr = vm.document.authorsStr.split(', ');
                if (vm.verificationData.position >= authorsArr.length)
                    return;

                const data = {
                    affiliations: _.map(vm.verificationData.affiliations, 'id'),
                    position: vm.verificationData.position,
                    corresponding: vm.verificationData.corresponding,
                    synchronize: vm.verificationData.synchronize,
                    'public': vm.verificationData.public,
                    first_coauthor: vm.verificationData.first_coauthor,
                    last_coauthor: vm.verificationData.last_coauthor,
                    oral_presentation: vm.verificationData.oral_presentation,
                };

                const authorStr = authorsArr[vm.verificationData.position];
                const alias = user.aliases.find(a => a.str.toLocaleLowerCase() === authorStr.toLocaleLowerCase());

                if (!alias) {
                    const aliases = user.aliases.map(a => a.str).join(', ');
                    const result = await ModalService.multipleChoiceConfirm('New alias!',
                        'You are verifying the document as "' + authorStr + '".\n' +
                        'By clicking on Proceed "' + authorStr + '" will be automatically added to your aliases (' + aliases + ').\n' +
                        'You can always manage them from your profile settings.\n',
                        {proceed: 'Proceed'});

                    if (result !== 'proceed')
                        return;
                }

                try {
                    const res = await verify(user, vm.document.id, data, vm.document2id);
                    const newUser = await UsersService.getProfile(user.id);
                    context.setSubResearchEntity(newUser);
                    executeOnSubmit({buttonIndex: 1, data: res});
                } catch (e) {
                    executeOnFailure();
                }
            }

            /* jshint ignore:end */

            function userSelectedChanged() {
                const authorship = vm.document.authorships.find(a => a.position === vm.verificationData.position);
                if (authorship) {
                    vm.verificationData.corresponding = authorship.corresponding;
                    vm.verificationData.first_coauthor = authorship.first_coauthor;
                    vm.verificationData.last_coauthor = authorship.last_coauthor;
                    vm.verificationData.oral_presentation = authorship.oral_presentation;
                }

                getInstitutes().then(function (institutes) {
                    vm.verificationData.affiliations = institutes;
                });

                if (coauthorsDeregisteres.length) {
                    coauthorsDeregisteres.pop()();
                    coauthorsDeregisteres.pop()();
                }
                coauthorsDeregisteres.push($scope.$watch('vm.verificationData.first_coauthor', getCoauthorChangedCB(0)));
                coauthorsDeregisteres.push($scope.$watch('vm.verificationData.last_coauthor', getCoauthorChangedCB(1)));
            }

            function getCoauthorChangedCB(field) {
                const fields = ['first_coauthor', 'last_coauthor'];
                return () => {
                    const index = (field - 1 + fields.length) % fields.length;
                    if (vm.verificationData.first_coauthor && vm.verificationData.last_coauthor)
                        vm.verificationData[fields[index]] = false;
                };
            }

            function getInstitutes() {
                if (_.isNil(vm.verificationData.position) || vm.verificationData.position < 0)
                    return Promise.resolve([]);
                var qs = {
                    where: {document: vm.document.id, position: vm.verificationData.position},
                    populate: 'affiliations'
                };
                return Restangular.all('authorships').getList(qs).then(function (authorships) {
                    if (_.isEmpty(authorships))
                        return [];
                    var authorship = authorships[0];
                    return authorship.affiliations;
                });
            }

            function getInstitutesFilter() {
                return vm.verificationData.affiliations;
            }

            function cancel() {
                executeOnSubmit({buttonIndex: 0});
            }

            function viewSynchFields() {
                return vm.document.kind === 'v' && vm.document.origin && vm.document.synchronized;
            }

            function viewAuthorshipFields() {
                return true;
            }

            function viewSynchMessage() {
                return vm.document.kind === 'v' && !vm.document.synchronized;
            }

            function viewCopyToDraft() {
                return vm.document.kind === 'v';
            }

            function viewFirstCoauthor() {
                return vm.verificationData.position > 0 && vm.verificationData.position < vm.document.getAuthors().length - 1 && vm.document.sourceTypeObj.type !== 'invited_talk';
            }

            function viewLastCoauthor() {
                return vm.verificationData.position > 0 && vm.verificationData.position < vm.document.getAuthors().length - 1 && vm.document.sourceTypeObj.type !== 'invited_talk';
            }

            function viewOralPresentation() {
                return vm.verificationData.position >= 0 && vm.document.sourceTypeObj.type !== 'invited_talk';
            }

            function verify(user, documentId, verificationData, document2id) {
                if (_.isFunction(vm.verificationFn()))
                    return vm.verificationFn()(user, documentId, verificationData, document2id);
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
