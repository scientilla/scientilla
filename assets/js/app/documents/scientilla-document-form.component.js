/* global Scientilla */

(function () {
    "use strict";

    angular
        .module('documents')
        .component('scientillaDocumentForm', {
            templateUrl: 'partials/scientilla-document-form.html',
            controller: scientillaDocumentFormController,
            controllerAs: 'vm',
            bindings: {
                document: "<",
                researchEntity: "<",
                onFailure: "&",
                onSubmit: "&",
                closeFn: "&"
            }
        });

    scientillaDocumentFormController.$inject = [
        'EventsService',
        'documentFieldsRules',
        '$scope',
        '$timeout',
        'DocumentTypesService',
        'context',
        'Restangular',
        'ModalService'
    ];

    function scientillaDocumentFormController(EventsService,
                                              documentFieldsRules,
                                              $scope,
                                              $timeout,
                                              DocumentTypesService,
                                              context,
                                              Restangular,
                                              ModalService) {
        const vm = this;
        vm.status = createStatus();
        vm.cancel = cancel;
        vm.undo = undo;
        vm.verify = verify;
        vm.documentTypes = DocumentTypesService.getDocumentTypes();
        vm.getSources = getSources;
        vm.getItSources = getItSources;
        vm.createSource = createSource;
        vm.openPopover = openPopover;
        vm.closePopover = closePopover;
        vm.checkSource = checkSource;
        vm.documentFieldsRules = documentFieldsRules;
        const allSourceTypes = DocumentTypesService.getSourceTypes();
        vm.sourceLabel = _.get(_.find(allSourceTypes, {id: vm.document.sourceType}), 'label');

        let documentBackup = null;
        let debounceTimeout = null;
        const debounceTime = 2000;
        const documentService = context.getDocumentService();
        const deregisteres = [];
        vm.openDocumentAffiliationForm = openDocumentAffiliationsForm;

        vm.$onInit = function () {
            if (_.isFunction(vm.document.clone))
                documentBackup = vm.document.clone();
            else
                documentBackup = _.cloneDeep(vm.document);

            watchDocument();
            watchDocumentSourceType();
            watchDocumentType();
        };

        vm.$onDestroy = function () {
            for (const deregisterer of deregisteres)
                deregisterer();
        };

        function watchDocument() {
            const fieldsToWatch = vm.document.fields;
            _.forEach(fieldsToWatch, function (f) {
                deregisteres.push($scope.$watch('vm.document.' + f, prepareSave, true));
            });
        }

        function watchDocumentSourceType() {
            const dereg = $scope.$watch('vm.document.sourceType', (newValue, oldValue) => {
                if (newValue === oldValue)
                    return;
                closePopover();
                if (!newValue) {
                    vm.sourceLabel = '';
                    return;
                }

                vm.sourceLabel = _.find(allSourceTypes, {id: newValue}).label;
                if (vm.document.source.type !== vm.document.sourceType)
                    vm.document.source = null;
            });

            deregisteres.push(dereg);
        }

        function watchDocumentType() {
            const dereg = $scope.$watch('vm.document.type', newValue => {
                closePopover();
                const allowedSources = _.find(vm.documentTypes, {key: newValue}).allowedSources;
                vm.sourceTypes = _.filter(allSourceTypes, s => allowedSources.includes(s.id));
            });
            deregisteres.push(dereg);
        }

        function createStatus() {
            let isSavedVar = false;
            let isSavingVar = false;
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

        function prepareSave(newValue, oldValue) {
            const isNotChanged = (newValue === oldValue);
            const isNewAndEmpty = ((_.isNil(oldValue)) && newValue === "");
            const isStillEmpty = (_.isNil(oldValue) && _.isNil(newValue));

            if (isNotChanged || isNewAndEmpty || isStillEmpty)
                return;

            vm.status.setSaved(false);

            if (debounceTimeout !== null)
                $timeout.cancel(debounceTimeout);

            debounceTimeout = $timeout(saveDocument, debounceTime);
        }

        function saveDocument() {
            if (vm.document.id)
                return vm.document.save().then(() => {
                    vm.status.setSaved(true);
                    EventsService.publish(EventsService.DRAFT_UPDATED, vm.document);
                });
            else
                return documentService.createDraft(vm.document)
                    .then(draft => {
                        vm.document = draft;
                        vm.status.setSaved(true);
                        EventsService.publish(EventsService.DRAFT_UPDATED, vm.document);
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

        function undo() {
            ModalService.multipleChoiceConfirm(
                'Undo',
                'Do you want to undo the last changes?',
                ['Proceed'])
                .then(() => vm.document = _.cloneDeep(documentBackup))
                .catch(() => true);
        }

        function getSources(searchText) {
            const qs = {where: {title: {contains: searchText}, type: vm.document.sourceType}};
            return Restangular.all('sources').getList(qs);
        }

        function getItSources(searchText) {
            const sourcesData = {
                'institute': {
                    query: {where: {name: {contains: searchText}}},
                    model: 'institutes'
                },
                'conference': {
                    query: {where: {title: {contains: searchText}, type: vm.document.sourceType}},
                    model: 'sources'
                }
            };
            const sourceData = sourcesData[vm.document.sourceType];
            if (!sourceData)
                return [];
            return Restangular.all(sourceData.model).getList(sourceData.query);
        }


        function createSource() {
            vm.newSource.type = vm.document.sourceType;
            return Restangular.all('sources').post(vm.newSource)
                .then(source => {
                    vm.document.source = source;
                    vm.newSource = {};
                    closePopover();
                });
        }

        function openPopover($event) {
            $event.stopPropagation();
            vm.popoverIsOpen = true;
        }


        function closePopover() {
            vm.popoverIsOpen = false;
        }

        function openDocumentAffiliationsForm() {
            return saveDocument()
                .then(() => close())
                .then(() => documentService.openDocumentAffiliationForm(vm.document));
        }

        function checkSource($event) {
            if (!$event.target.value)
                vm.document.source = null;
        }


        function verify() {
            saveDocument()
                .then(() => close())
                .then(() => documentService.verifyDraft(vm.document));
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