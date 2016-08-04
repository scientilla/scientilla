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
                onFailure: "&",
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
        vm.status = createStatus();
        vm.cancel = cancel;
        vm.deleteDocument = deleteDocument;
        vm.formVisible = true;
        vm.verify = verify;

        var debounceTimeout = null;

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
            var types = Scientilla.reference.getDocumentTypes()
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
            }, Scientilla.reference.getDocumentsFields(vm.document.sourceType));
            refreshForm();
        }

        function refreshForm() {
            vm.formVisible = false;
            $timeout(function () {
                vm.formVisible = true;
            }, 0);
        }
        
        function prepareSave(newValue, oldValue) {
            var isChanged = (newValue === oldValue);
            var isNewAndEmpty = ((_.isNil(oldValue)) && newValue === "");
            var isStillEmpty = (_.isNil(oldValue) && _.isNil(newValue));

            if (isChanged || isNewAndEmpty || isStillEmpty)
                return;

            vm.status.setSaved(false);

            if (debounceTimeout !== null)
                $timeout.cancel(debounceTimeout);

            debounceTimeout = $timeout(saveDocument, 3000);
        }

        function saveDocument() {
            if (vm.document.id)
                return vm.document.save().then(function () {
                    vm.status.setSaved(true);
                    $rootScope.$broadcast("draft.updated", vm.document);
                });
            else
                return vm.researchEntity.all('drafts')
                        .post(vm.document)
                        .then(function (draft) {
                            vm.document = draft;
                            vm.status.setSaved(true);
                            $rootScope.$broadcast("draft.updated", vm.document);
                        });
        }

        function cancel() {
            if (debounceTimeout !== null) {
                $timeout.cancel(debounceTimeout);
            }
            if (vm.status.isSaving())
                saveDocument();

            executeOnSubmit(0);
        }

        function deleteDocument() {
            if (vm.document.id)
                researchEntityService
                        .deleteDraft(vm.researchEntity, vm.document.id)
                        .then(function (d) {
                            Notification.success("Draft deleted");
                            $rootScope.$broadcast("draft.deleted", d);
                            executeOnSubmit(1);
                        })
                        .catch(function () {
                            Notification.warning("Failed to delete draft");
                        });
        }

        function verify() {
            saveDocument()
                    .then(function () {
                        return researchEntityService.verifyDraft(vm.researchEntity, vm.document);
                    })
                    .then(function (document) {
                        if (document.draft) {
                            Notification.warning("Draft is not valid and cannot be verified");
                        }
                        else {
                            executeOnSubmit(2);
                            Notification.success("Draft verified");
                            $rootScope.$broadcast("draft.verified", document);
                        }
                    })
                    .catch(function () {
                        Notification.warning("Failed to verify draft");
                        executeOnFailure();
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
    }
})();