/* global Scientilla */

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
        'Notification',
        'researchEntityService',
        '$scope',
        '$rootScope',
        '$timeout'
    ];

    function scientillaDocumentFormController(FormForConfiguration, Notification, researchEntityService, $scope, $rootScope, $timeout) {
        var vm = this;
        vm.submit = submit;
        vm.status = createStatus();
        vm.cancel = cancel;
        vm.formVisible = true;
        vm.saveVerify = saveVerify;
        activate();
        
        function createStatus() {
            var isSavedVar = true;
            return {
                isSaved: function() {
                    return isSavedVar;
                },
                setSaved: function(isSaved) {
                    isSavedVar = isSaved;
                }
            };
        };


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
            var types = Scientilla.reference.getDocumentTypes()
                    .map(function(t) {
                        return {
                            value: t.key,
                            label: t.label
                        };
                    });
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
                },
                type: {
                    inputType: 'select',
                    label: 'Type',
                    allowBlank: true,
                    preventDefaultOption: true,
                    required: true,
                    values: types
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
            vm.status.setSaved(false);
        }

        function prepareSave(newValue, oldValue) {
            if (newValue === oldValue || _.isUndefined(oldValue))
                return;
            if (vm.status.isSaved())
                return;
            _.debounce(saveDocument, 3000)();
        }

        function saveDocument() {
            if (vm.document.id)
                return vm.document.save().then(function () {
                    vm.status.setSaved(true);
                });
            else
                return vm.researchEntity.all('drafts')
                        .post(vm.document)
                        .then(function (draft) {
                            vm.document = draft;
                            vm.status.setSaved(true);
                        });
        }
        
        function executeOnSubmit() {
            if (_.isFunction(vm.onSubmit()))
                vm.onSubmit()(vm.document);
            
        }

        function submit() {
            saveDocument()
                    .then(function () {
                        Notification.success("Document saved");
                        executeOnSubmit();

                    })
                    .catch(function () {
                        Notification.warning("Failed to save document");
                    });

        }

        function cancel() {
            if (_.isFunction(vm.onClose()))
                vm.onClose()();
        }
        
        function saveVerify() {
            saveDocument()
                    .then(function(){
                        return researchEntityService.verify(vm.researchEntity, vm.document);
                    })
                    .then(function (draft) {
                        Notification.success("Draft verified");
                        executeOnSubmit();
                        $rootScope.$broadcast("draft.verified", draft);
                    })
                    .catch(function () {
                        Notification.warning("Failed to verify draft");
                    });
        }
    }
})();