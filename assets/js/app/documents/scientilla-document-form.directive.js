/* global Scientilla */

(function () {
    angular
        .module('documents')
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
                onFailure: "&",
                onSubmit: "&",
                closeFn: "&"
            }
        };
    }

    scientillaDocumentFormController.$inject = [
        'FormForConfiguration',
        'Notification',
        'researchEntityService',
        'EventsService',
        '$scope',
        '$timeout',
        'DocumentTypesService',
        'context'
    ];

    function scientillaDocumentFormController(FormForConfiguration, Notification, researchEntityService, EventsService, $scope, $timeout, DocumentTypesService, context) {
        var vm = this;
        vm.status = createStatus();
        vm.cancel = cancel;
        vm.deleteDocument = deleteDocument;
        vm.formVisible = true;
        vm.verify = verify;

        var debounceTimeout = null;
        var debounceTime = 2000;
        var documentService = context.getDocumentService();

        activate();

        function createStatus() {
            var isSavedVar = false;
            var isSavingVar = false;
            return {
                isSaved: function () {
                    return isSavedVar;
                },
                isSaving: function () {
                    return isSavingVar;
                },
                setSaved: function (isSaved) {
                    isSavedVar = isSaved;
                    isSavingVar = !isSaved;

                    if (isSavedVar) {
                        this.class = "saved";
                        this.message = "Saved";
                    }
                    else {
                        this.class = "unsaved";
                        this.message = "Saving";
                    }
                },
                message: "",
                class: "default"
            };
        }


        function activate() {
            FormForConfiguration.enableAutoLabels();

            loadDocumentFields();
            watchDocument();
        }

        function watchDocument() {
            $scope.$watch('vm.document.sourceType', loadDocumentFields, true);
            var fieldsToWatch = _.keys(vm.validationAndViewRules);
            _.forEach(fieldsToWatch, function (f) {
                $scope.$watch('vm.document.' + f, prepareSave, true);
            });
        }

        function loadDocumentFields() {
            var types = DocumentTypesService.getDocumentTypes()
                .map(function (t) {
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
            }, DocumentTypesService.getDocumentsFields(vm.document.sourceType));
            refreshForm();
        }

        function refreshForm() {
            vm.formVisible = false;
            $timeout(function () {
                vm.formVisible = true;
            }, 0);
        }

        function prepareSave(newValue, oldValue) {
            var isNotChanged = (newValue === oldValue);
            var isNewAndEmpty = ((_.isNil(oldValue)) && newValue === "");
            var isStillEmpty = (_.isNil(oldValue) && _.isNil(newValue));

            if (isNotChanged || isNewAndEmpty || isStillEmpty)
                return;

            vm.status.setSaved(false);

            if (debounceTimeout !== null)
                $timeout.cancel(debounceTimeout);

            debounceTimeout = $timeout(saveDocument, debounceTime);
        }

        function saveDocument() {
            if (vm.document.id)
                return vm.document.save().then(function () {
                    vm.status.setSaved(true);
                    EventsService.publish(EventsService.DRAFT_UPDATED, vm.document);
                });
            else
                return researchEntityService
                    .copyDocument(vm.researchEntity, vm.document)
                    .then(function (draft) {
                        vm.document = draft;
                        vm.status.setSaved(true);
                        EventsService.publish(EventsService.DRAFT_UPDATED, vm.document );
                    });
        }

        function cancel() {
            if (debounceTimeout !== null) {
                $timeout.cancel(debounceTimeout);
            }
            if (vm.status.isSaving())
                saveDocument();

            close();
        }

        function deleteDocument() {
            if (vm.document.id)
                researchEntityService
                    .deleteDraft(vm.researchEntity, vm.document.id)
                    .then(function (d) {
                        Notification.success("Draft deleted");
                        EventsService.publish(EventsService.DRAFT_DELETED, d);
                        executeOnSubmit(1);
                    })
                    .catch(function () {
                        Notification.warning("Failed to delete draft");
                    });
        }

        function verify() {
            saveDocument()
                .then(function() {return close();})
                .then(function() {
                    return documentService.verifyDraft(vm.document);
                });
        }

        function executeOnSubmit(i) {
            if (_.isFunction(vm.onSubmit()))
                vm.onSubmit()(i);
        }

        function executeOnFailure() {
            if (_.isFunction(vm.onFailure()))
                vm.onFailure()();
        }

        function close() {
            if (_.isFunction(vm.closeFn()))
            if (_.isFunction(vm.closeFn()))
                return vm.closeFn()();
            return Promise.reject('no close function');
        }
    }
})();