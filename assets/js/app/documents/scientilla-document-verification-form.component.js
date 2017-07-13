/* global Scientilla */

(function () {

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
        'researchEntityService'
    ];

    function DocumentVerificationController(AuthService, $scope, Restangular, researchEntityService) {
        var vm = this;
        vm.instituteToId = instituteToId;
        vm.getInstitutesFilter = getInstitutesFilter;
        vm.getInstitutesQuery = getInstitutesQuery;
        vm.submit = submit;
        vm.cancel = cancel;
        vm.verificationData = {};

        var user = AuthService.user;

        activate();


        function activate() {
            vm.verificationData.position = vm.document.getUserIndex(user);
            vm.verificationData.autoUpdate = !vm.document.editedAfterImport;

            $scope.$watch('vm.verificationData.position', userSelectedChanged);
        }

        function getInstitutesQuery(searchText) {
            var qs = {where: {name: {contains: searchText}}};
            var model = 'institutes';
            return {model: model, qs: qs};
        }

        function instituteToId(institute) {
            return institute.id;
        }

        function submit() {
            var data = {
                affiliations: _.map(vm.verificationData.affiliations, 'id'),
                position: vm.verificationData.position,
                corresponding: vm.verificationData.corresponding,
                autoUpdate: vm.verificationData.autoUpdate
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
