(function () {
    angular
            .module('references')
            .directive('scientillaDocumentForm', scientillaDocumentForm);

    function scientillaDocumentForm() {
        return {
            restrict: 'E',
            templateUrl: 'partials/scientillaDocumentForm.html',
            controller: scientillaDocumentFormController,
            controllerAs: 'vm',
            scope: {},
            bindToController: {
                document: "=",
                researchEntity: "=",
                onClose: "&",
                onSubmit: "&"
            }
        };
    }

    scientillaDocumentFormController.$inject = [
        'FormForConfiguration',
        '$scope',
        '$q',
        '$timeout'
    ];

    function scientillaDocumentFormController(FormForConfiguration, $scope, $q, $timeout) {
        var vm = this;
        vm.submit = submit;
        vm.status = 'saved';
        vm.cancel = cancel;
        vm.formVisible = true;
        activate();


        function activate() {
            FormForConfiguration.enableAutoLabels();

            loadDocumentFields();
            watchDocument();
        }

        function watchDocument() {
            $scope.$watch('vm.document.sourceType', loadDocumentFields, true);
            var fieldsToWatch = _.keys(vm.validationAndViewRules);
            _.forEach(fieldsToWatch, function (f) {
                $scope.$watch('vm.document.' + f, markModified, true);
                $scope.$watch('vm.document.' + f, prepareSave, true);
            });
        }

        function loadDocumentFields() {
            vm.validationAndViewRules = _.merge({
                sourceType: {
                    inputType: 'select',
                    label: 'Source type',
                    allowBlank: true,
                    preventDefaultOption: true,
                    required: true,
                    values: [
                        {value: 'journal', label: 'Journal'},
                        {value: 'book', label: 'Book'},
                        {value: 'conference', label: 'Conference'}
                    ]
                }
            }, Scientilla.reference.getDocumentsFields(vm.document.sourceType));
            refreshForm();
        }

        function refreshForm() {
            vm.formVisible = false;
            $timeout(function () {
                vm.formVisible = true;
            }, 0);
        }

        function markModified(newValue, oldValue) {
            if (newValue === oldValue || _.isUndefined(oldValue))
                return;
            vm.status = 'unsaved';
        }

        function prepareSave(newValue, oldValue) {
            if (newValue === oldValue || _.isUndefined(oldValue))
                return;
            if (vm.status === 'saved')
                return;
            _.debounce(saveDocument, 3000)();
        }

        function saveDocument() {
            if (vm.document.id)
                return vm.document.save().then(function () {
                    vm.status = 'saved';
                });
            else
                return vm.researchEntity.all('drafts')
                        .post(vm.document)
                        .then(function (draft) {
                            vm.document = draft;
                            vm.status = 'saved';
                        });
        }

        function submit() {
            saveDocument().then(function () {
                if (_.isFunction(vm.onSubmit()))
                    vm.onSubmit()(vm.document);
            });

        }

        function cancel() {
            if (_.isFunction(vm.onClose()))
                vm.onClose()();
        }
    }
})();