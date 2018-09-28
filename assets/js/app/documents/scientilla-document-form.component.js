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
        '$rootScope',
        'EventsService',
        'documentFieldsRules',
        '$scope',
        '$timeout',
        'DocumentTypesService',
        'context',
        'Restangular',
        'ModalService'
    ];

    function scientillaDocumentFormController($rootScope,
                                              EventsService,
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
        vm.verify = verify;
        vm.documentTypes = DocumentTypesService.getDocumentTypes();
        vm.getSources = getSources;
        vm.getItSources = getItSources;
        vm.openSourceTypeModal = openSourceTypeModal;
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
        vm.newSource = {};

        vm.$onInit = function () {
            if (_.isFunction(vm.document.clone))
                documentBackup = vm.document.clone();
            else
                documentBackup = _.cloneDeep(vm.document);

            watchDocumentSourceType();
            watchDocumentType();
        };

        vm.$onDestroy = function () {
            for (const deregisterer of deregisteres)
                deregisterer();
        };

        function watchDocumentSourceType() {
            const dereg = $scope.$watch('vm.document.sourceType', (newValue, oldValue) => {
                if (newValue === oldValue)
                    return;

                if (!newValue) {
                    vm.sourceLabel = '';
                    return;
                }

                vm.sourceLabel = _.find(allSourceTypes, {id: newValue}).label;
                if (vm.document.source && vm.document.source.type !== vm.document.sourceType)
                    vm.document.source = null;
            });

            deregisteres.push(dereg);
        }

        function watchDocumentType() {
            const dereg = $scope.$watch('vm.document.type', newValue => {
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

        function saveDocument() {
            console.log(vm.document.id);
            if (vm.document.id)
                return vm.document.save().then(() => {
                    vm.status.setSaved(true);
                    EventsService.publish(EventsService.DRAFT_UPDATED, vm.document);
                }).catch((response) => {
                    //console.log(response);
                });
            else
                return documentService.createDraft(vm.document)
                    .then(draft => {
                        vm.document = draft;
                        vm.status.setSaved(true);
                        EventsService.publish(EventsService.DRAFT_UPDATED, vm.document);

                        return vm.document;
                    }, (res) => {
                        if (res.data && res.data.invalidAttributes) {
                            vm.document.invalidAttributes = res.data.invalidAttributes;
                        }
                        //console.log(vm.document);
                        return vm.document;
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

        function openSourceTypeModal($event) {
            $event.stopPropagation();

            $rootScope.$on('newSource', function(event, source) {
                vm.document.source = source;
                vm.getSources(source.title);
            });

            ModalService
                .openSourceTypeModal(vm.document);
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
                .then(() => {
                    if (vm.document.invalidAttributes || !vm.document.isValid) {
                        if (!vm.document.invalidAttributes) {
                            vm.document.invalidAttributes = {};
                        }
                        if (!vm.document.hasValidAuthorsStr) {
                            if(!vm.document.invalidAttributes.authors) {
                                vm.document.invalidAttributes.authors = [];
                            }
                            vm.document.invalidAttributes.authors.push({
                                rule: 'valid',
                                message: 'Author string is not valid. It should be in the form \'E. Molinari, F. Bozzini, F. Semprini\'.'
                            });
                        }

                        if (!vm.document.hasValidYear) {
                            if(!vm.document.invalidAttributes.year) {
                                vm.document.invalidAttributes.year = [];
                            }
                            vm.document.invalidAttributes.year.push({
                                rule: 'valid',
                                message: 'Not a valid year.'
                            });
                        }

                        return Promise.reject();
                    } else {
                        close();
                    }
                })
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