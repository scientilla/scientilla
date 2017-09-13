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
                verificationFn: "&",
                onFailure: "&",
                onSubmit: "&"
            }
        });


    DocumentVerificationController.$inject = [
        'AuthService',
        '$scope',
        'Restangular',
        'context'
    ];

    function DocumentVerificationController(AuthService, $scope, Restangular, context) {
        var vm = this;
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
        vm.verificationData = {};

        var user = AuthService.user;

        const DocumentService = context.getDocumentService();

        vm.$onInit = function () {
            vm.verificationData.position = vm.document.getUserIndex(user);
            vm.verificationData.synchronize = vm.document.synchronized;
            vm.verificationData.public = true;

            $scope.$watch('vm.verificationData.position', userSelectedChanged);
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
            DocumentService.copyDocument(vm.document, context.getResearchEntity());
            executeOnSubmit(0);
        }

        function submit() {
            const data = {
                affiliations: _.map(vm.verificationData.affiliations, 'id'),
                position: vm.verificationData.position,
                corresponding: vm.verificationData.corresponding,
                synchronize: vm.verificationData.synchronize,
                public: vm.verificationData.public
            };
            return verify(user, vm.document.id, data)
                .then(function (user) {
                    executeOnSubmit(1);
                })
                .catch(function () {
                    executeOnFailure();
                });
        }

        function userSelectedChanged() {
            var authorship = vm.document.authorships[vm.verificationData.position];
            if (authorship)
                vm.verificationData.corresponding = authorship.corresponding;

            getInstitutes().then(function (institutes) {
                vm.verificationData.affiliations = institutes;
            });
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
            executeOnSubmit(0);
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

        function verify(user, documentId, verificationData) {
            if (_.isFunction(vm.verificationFn()))
                return vm.verificationFn()(user, documentId, verificationData);
            return Promise.reject('no verification function');
        }

        function executeOnSubmit(i) {
            if (_.isFunction(vm.onSubmit()))
                vm.onSubmit()(i);
        }

        function executeOnFailure() {
            if (_.isFunction(vm.onFailure()))
                vm.onFailure()();
        }

    }
})
();
