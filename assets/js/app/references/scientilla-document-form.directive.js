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
                onCancel: "&",
                onSubmit: "&"
            }
        };
    }

    scientillaDocumentFormController.$inject = [
        'FormForConfiguration',
        'Restangular',
        '$scope',
        '$route',
        '$location',
        '$q',
        '$timeout'
    ];

    function scientillaDocumentFormController(FormForConfiguration, Restangular, $scope, $route, $location, $q, $timeout) {
        var vm = this;
        if (!vm.document)
            vm.document = vm.researchEntity.getNewDocument();
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
                $scope.$watch('vm.document.' + f, _.debounce(saveDocument, 3000), true);
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
            $timeout(function() {vm.formVisible = true;}, 0);
        }

        function markModified(newValue, oldValue) {
            if (newValue === oldValue)
                return;
            vm.status = 'unsaved';
        }

        function saveDocument() {
            if (vm.status === 'saved')
                return $q(function (resolve) {
                    resolve(vm.document);
                });
            return vm.document.save().then(function () {
                vm.status = 'saved';
            });
        }

        function submit() {
            saveDocument().then(function () {
                vm.onSubmit()();
            });

        }

        function cancel() {
            vm.onCancel()();
        }
    }
})();