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
        'Notification',
        'researchEntityService',
        'EventsService',
        '$scope',
        '$timeout',
        'DocumentTypesService',
        'context',
        'Restangular'
    ];

    function scientillaDocumentFormController(Notification, researchEntityService, EventsService, $scope, $timeout, DocumentTypesService, context, Restangular) {
        var vm = this;
        vm.status = createStatus();
        vm.cancel = cancel;
        vm.deleteDocument = deleteDocument;
        vm.verify = verify;
        vm.documentTypes = DocumentTypesService.getDocumentTypes();
        vm.getSources = getSources;
        vm.getItSources = getItSources;
        vm.createSource = createSource;
        vm.closePopover = closePopover;
        var allSourceTypes = DocumentTypesService.getSourceTypes();

        var debounceTimeout = null;
        var debounceTime = 2000;
        var documentService = context.getDocumentService();
        vm.openDocumentAffiliationForm = openDocumentAffiliationsForm;

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
            watchDocument();
            watchDocumentSourceType();
            watchDocumentType();
        }

        function watchDocument() {
            var fieldsToWatch = vm.document.fields;
            _.forEach(fieldsToWatch, function (f) {
                $scope.$watch('vm.document.' + f, prepareSave, true);
            });
        }

        function watchDocumentSourceType() {
            $scope.$watch('vm.document.sourceType', function(newValue, oldValue) {
                if (newValue === oldValue)
                    return;
                closePopover();
                if (!newValue)
                    return;
                vm.sourceLabel = _.find(allSourceTypes, {id: newValue}).label;
                vm.document.source = null;
                vm.document.itSource = null;
            });
        }

        function watchDocumentType() {
            $scope.$watch('vm.document.type', function(newValue) {
                closePopover();
                var allowedSources = _.find(vm.documentTypes, {key: newValue}).allowedSources;
                vm.sourceTypes = _.filter(allSourceTypes, function(s) { return allowedSources.includes(s.id);});
            });
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

        function getSources(searchText) {
            var qs = {where: {title: {contains: searchText}, type: vm.document.sourceType}};
            return Restangular.all('sources').getList(qs);
        }

        function getItSources(searchText) {
            var sourcesData = {
                'institute' : {
                    query: {where: {name: {contains: searchText}}},
                    model: 'institutes'
                },
                'conference' : {
                    query: {where: {title: {contains: searchText}, type: vm.document.sourceType}},
                    model: 'sources'
                }
            };
            var sourceData = sourcesData[vm.document.sourceType];
            if (!sourceData)
                return [];
            return Restangular.all(sourceData.model).getList(sourceData.query);
        }


        function createSource() {
            vm.newSource.type = vm.document.sourceType;
            return Restangular.all('sources').post(vm.newSource)
                .then(function(source) {
                    vm.document.source = source;
                    vm.newSource = {};
                    closePopover();
                });
        }

        function closePopover() {
            vm["popover-is-open"] = false;
        }

        function openDocumentAffiliationsForm() {
            return saveDocument()
                .then(function() {return close();})
                .then(function() {
                    return documentService.openDocumentAffiliationForm(vm.document);
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
                return vm.closeFn()();
            return Promise.reject('no close function');
        }
    }
})();