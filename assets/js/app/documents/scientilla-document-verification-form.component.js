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
        'FormForConfiguration',
        'AuthService',
        '$scope',
        'Restangular',
        'researchEntityService'
    ];

    function DocumentVerificationController(FormForConfiguration, AuthService, $scope, Restangular, researchEntityService) {
        var vm = this;
        vm.instituteToId = instituteToId;
        vm.getInstitutesFilter = getInstitutesFilter;
        vm.getInstitutesQuery = getInstitutesQuery;
        vm.submit = submit;
        vm.cancel = cancel;
        vm.verificationData = {};
        vm.affiliations = [];

        var user = AuthService.user;

        vm.validationAndViewRules = {
            position: {
                allowBlank: true,
                inputType: 'select',
                label: 'Who are you?',
                required: true,
                values: vm.document.getAuthors().map(function (a, i) {
                    return {
                        label: a,
                        value: i
                    };
                })
            }
        };


        activate();


        function activate() {
            FormForConfiguration.enableAutoLabels();

            vm.verificationData.position = vm.document.getUserIndex(user);

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
            vm.verificationData.affiliations = _.map(vm.affiliations, 'id');
            return verify(user, vm.document.id, vm.verificationData)
                .then(function (user) {
                    executeOnSubmit(1);
                })
                .catch(function () {
                    executeOnFailure();
                });
        }

        function userSelectedChanged() {
            getInstitutes().then(function (institutes) {
                vm.affiliations = _.map(institutes, 'id');
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
            })
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
