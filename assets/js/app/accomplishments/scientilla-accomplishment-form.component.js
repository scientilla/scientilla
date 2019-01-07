/* global Scientilla */

(function () {
    "use strict";

    angular
        .module('documents')
        .component('scientillaAccomplishmentForm', {
            templateUrl: 'partials/scientilla-accomplishment-form.html',
            controller: scientillaAccomplishmentFormController,
            controllerAs: 'vm',
            bindings: {
                document: "<",
                researchEntity: "<",
                closeFn: "&"
            }
        });

    scientillaAccomplishmentFormController.$inject = [
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

    function scientillaAccomplishmentFormController(
        $rootScope,
        EventsService,
        documentFieldsRules,
        $scope,
        $timeout,
        DocumentTypesService,
        context,
        Restangular,
        ModalService
    ) {
        const vm = this;

        vm.saveStatus = saveStatus();
        vm.verifyStatus = verifyStatus();

        vm.cancel = cancel;
        vm.verify = verify;
        vm.save = save;
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

        vm.newSource = {};

        vm.errors = {};
        vm.errorText = '';
        vm.unsavedData = false;
        vm.mode = 'draft';
        vm.resetErrors = resetErrors;
        vm.checkValidation = checkValidation;
        vm.fieldValueHasChanged = fieldValueHasChanged;

        let timeout;

        const delay = 500;

        vm.$onInit = function () {
            if (_.isFunction(vm.document.clone))
                documentBackup = vm.document.clone();
            else
                documentBackup = _.cloneDeep(vm.document);

            watchDocumentSourceType();
            watchDocumentType();

            $scope.$watch('form.$pristine', function (formUntouched) {
                if (!formUntouched) {
                    vm.unsavedData = true;
                } else {
                    vm.unsavedData = false;
                }
            });

            $scope.$on('modal.closing', function(event, reason) {
                cancel(event);
            });

            if (vm.document.id) {
                vm.errorText = '';
                vm.errors = vm.document.validateDocument();

                if (Object.keys(vm.errors).length > 0) {
                    vm.errorText = 'The draft has been saved but please fix the warnings before verifying!';
                }
            }
        };

        vm.$onDestroy = function () {
            for (const deregisterer of deregisteres)
                deregisterer();
        };

        function resetErrors() {
            vm.errors = {};
            vm.errorText = '';
        }

        function checkValidation(field = false) {
            if (field) {
                vm.errors[field] = vm.document.validateDocument(field);

                if (typeof vm.errors[field] === 'undefined') {
                    delete vm.errors[field];
                }
            } else {
                vm.errors = vm.document.validateDocument();
            }

            if (Object.keys(vm.errors).length > 0) {
                vm.errorText = 'The draft has been saved but please fix the warnings before verifying!';
            } else {
                vm.errorText = '';
            }
        }

        function fieldValueHasChanged(field = false) {
            $timeout.cancel(timeout);

            timeout = $timeout(function () {
                checkValidation(field);
            }, delay);
        }

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

        function saveStatus() {
            return {
                setState: function (state) {
                    this.state = state;

                    vm.mode = 'draft';

                    switch(true) {
                        case state === 'ready to save':
                            this.message = 'Save draft';
                            break;
                        case state === 'saving':
                            this.message = 'Saving draft';
                            break;
                        case state === 'saved':
                            this.message = 'Draft is saved!';
                            $scope.form.$setPristine();
                            break;
                        case state === 'failed':
                            this.message = 'Failed to save draft!';
                            $scope.form.$setPristine();
                            break;
                    }
                },
                state: 'ready to save',
                message: 'Save draft'
            };
        }

        function verifyStatus() {
            return {
                setState: function (state) {
                    this.state = state;

                    vm.mode = 'verify';

                    switch(true) {
                        case state === 'ready to verify':
                            this.message = 'Save & verify';
                            break;
                        case state === 'verifying':
                            this.message = 'Verifying draft';
                            break;
                        case state === 'verified':
                            this.message = 'Draft is Verified!';
                            $scope.form.$setPristine();
                            break;
                        case state === 'failed':
                            this.message = 'Failed to verify!';
                            $scope.form.$setPristine();
                            break;
                    }
                },
                state: 'ready to verify',
                message: 'Save & verify'
            };
        }

        function save() {
            vm.errors = {};
            vm.errorText = '';
            saveDocument(true);
        }

        function saveDocument(updateState = false) {
            if (updateState) {
                vm.saveStatus.setState('saving');
            }

            vm.errorText = '';
            vm.errors = vm.document.validateDocument();

            if (Object.keys(vm.errors).length > 0) {
                vm.errorText = 'The draft has been saved but please fix the warnings before verifying!';
            }

            if (vm.document.id) {
                return vm.document.save().then(() => {
                    if (updateState) {
                        vm.saveStatus.setState('saved');
                    }

                    EventsService.publish(EventsService.DRAFT_UPDATED, vm.document);

                    vm.unsavedData = false;

                    if (updateState) {
                        $timeout(function() {
                            vm.saveStatus.setState('ready to save');
                        }, 1000);
                    }

                    return vm.document;
                });
            } else {
                return documentService.createDraft(vm.document)
                    .then(draft => {
                        vm.document = draft;
                        if (updateState) {
                            vm.saveStatus.setState('saved');
                        }

                        EventsService.publish(EventsService.DRAFT_UPDATED, vm.document);

                        vm.unsavedData = false;

                        if (updateState) {
                            $timeout(function() {
                                vm.saveStatus.setState('ready to save');
                            }, 1000);
                        }

                        return vm.document;
                    });
            }
        }

        function cancel(event = false) {
            if (vm.unsavedData) {
                if (event) {
                    event.preventDefault();
                }

                // Show the unsaved data modal
                ModalService
                    .multipleChoiceConfirm('Unsaved data',
                        `There is unsaved data in the form. Do you want to go back and save this data?`,
                        ['Yes', 'No'],
                        false)
                    .then(function (buttonIndex) {
                        switch (buttonIndex) {
                            case 0:
                                break;
                            case 1:
                                vm.unsavedData = false;
                                close();
                                break;
                            default:
                                break;
                        }
                    });
            } else {
                if (debounceTimeout !== null) {
                    $timeout.cancel(debounceTimeout);
                }

                if (vm.saveStatus.state === 'saving') {
                    saveDocument();
                }

                if (!event){
                    close();
                }
            }
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

            EventsService.subscribe(vm, EventsService.SOURCE_CREATED, function(event, source) {
                vm.document.source = source;
                vm.getSources(source.title);

                vm.errors = vm.document.validateDocument();

                checkValidation();
            });

            ModalService
                .openSourceTypeModal(vm.document);
        }

        function checkSource($event) {
            if (!$event.target.value) {
                vm.document.source = null;
            }

            checkValidation('source');
        }

        function verify() {
            vm.errorText = '';
            vm.errors = {};
            vm.verifyStatus.setState('verifying');

            $timeout(function() {
                vm.errors = vm.document.validateDocument();
                if (Object.keys(vm.errors).length === 0) {
                    // Is valid
                    saveDocument()
                        .then(() => {
                            vm.verifyStatus.setState('verified');
                            close();
                        })
                        .then(() => {
                            documentService.verifyDraft(vm.document);
                        });
                } else {
                    // Is not valid
                    vm.verifyStatus.setState('failed');
                    vm.errorText = 'The draft has been saved but not been verified! Please correct the errors on this form!';

                    saveDocument(false);

                    $timeout(function() {
                        vm.verifyStatus.setState('ready to verify');
                    }, 1000);
                }
            }, 200);
        }

        function close() {
            if (_.isFunction(vm.closeFn())) {
                return vm.closeFn()();
            }

            return Promise.reject('no close function');
        }
    }
})();