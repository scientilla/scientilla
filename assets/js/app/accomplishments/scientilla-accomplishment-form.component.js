(function () {
    "use strict";

    angular
        .module('accomplishments')
        .component('scientillaAccomplishmentForm', {
            templateUrl: 'partials/scientilla-accomplishment-form.html',
            controller: scientillaAccomplishmentFormController,
            controllerAs: 'vm',
            bindings: {
                accomplishment: "<",
                researchEntity: "<",
                closeFn: "&"
            }
        });

    scientillaAccomplishmentFormController.$inject = [
        '$rootScope',
        'EventsService',
        'accomplishmentFieldsRules',
        '$scope',
        '$timeout',
        'AccomplishmentTypesService',
        'context',
        'Restangular',
        'ModalService'
    ];

    function scientillaAccomplishmentFormController(
        $rootScope,
        EventsService,
        accomplishmentFieldsRules,
        $scope,
        $timeout,
        AccomplishmentTypesService,
        context,
        Restangular,
        ModalService
    ) {
        const vm = this;

        const defaultSourceTypes = AccomplishmentTypesService.getSourceTypes();
        const defaultTypes = AccomplishmentTypesService.getTypes();

        vm.saveStatus = saveStatus();
        vm.verifyStatus = verifyStatus();

        vm.cancel = cancel;
        vm.verify = verify;
        vm.save = save;
        vm.types = defaultTypes;
        vm.getSources = getSources;
        vm.checkSource = checkSource;
        vm.openSourceTypeModal = openSourceTypeModal;
        vm.fieldsRules = accomplishmentFieldsRules;
        vm.sourceLabel = _.get(_.find(defaultSourceTypes, {id: vm.accomplishment.sourceType}), 'label');

        let debounceTimeout = null;
        const debounceTime = 2000;
        const accomplishmentService = context.getAccomplishmentService();

        vm.newSource = {};

        vm.errors = {};
        vm.errorText = '';
        vm.unsavedData = false;
        vm.mode = 'draft';
        vm.resetErrors = resetErrors;
        vm.checkValidation = checkValidation;
        vm.fieldValueHasChanged = fieldValueHasChanged;

        vm.getInstitutesQuery = getInstitutesQuery;
        vm.getInstitutesFilter = getInstitutesFilter;

        let timeout;

        const delay = 500;

        vm.$onInit = function () {

            watchSourceType();

            watchType();

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

            if (vm.accomplishment.id) {
                vm.errorText = '';
                vm.errors = vm.accomplishment.validate();

                if (Object.keys(vm.errors).length > 0) {
                    vm.errorText = 'The draft has been saved but please fix the warnings before verifying!';
                }
            }

            if (!vm.accomplishment.affiliations) {
                vm.accomplishment.affiliations = [];
            }
        };

        function getInstitutesQuery(searchText) {
            const qs = {where: {name: {contains: searchText}, parentId: null}};
            const model = 'institutes';
            return {model: model, qs: qs};
        }

        function getInstitutesFilter() {
            return vm.accomplishment.affiliations;
        }

        function resetErrors() {
            vm.errors = {};
            vm.errorText = '';
        }

        function checkValidation(field = false) {
            if (field) {
                vm.errors[field] = vm.accomplishment.validate(field);

                if (typeof vm.errors[field] === 'undefined') {
                    delete vm.errors[field];
                }
            } else {
                vm.errors = vm.accomplishment.validate();
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

        function watchSourceType() {
            // Watch if the source type changes
            $scope.$watch('vm.accomplishment.sourceType', (newValue, oldValue) => {
                // Exit when the new and old value are equal
                if (newValue === oldValue) {
                    return;
                }

                // Exit when the new value is empty
                if (!newValue) {
                    vm.sourceLabel = '';
                    return;
                }

                // Find the label of the selected source type
                vm.sourceLabel = _.find(defaultSourceTypes, {id: newValue}).label;

                // Reset the accomplishment source of the type of the source is not equal to the sourceType
                if (vm.accomplishment.source && vm.accomplishment.source.type !== vm.accomplishment.sourceType) {
                    vm.accomplishment.source = null;
                }
            });
        }

        function watchType() {
            // Watch if the accomplishment type changes
            $scope.$watch('vm.accomplishment.type', type => {

                // Copy the default source types or use an empty object
                if (type === 'editor') {
                    vm.sourceTypes = defaultSourceTypes;
                } else {
                    vm.sourceTypes = {};
                }
            });
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
            processSave(true);
        }

        function processSave(updateState = false) {
            if (updateState) {
                vm.saveStatus.setState('saving');
            }

            vm.errorText = '';
            vm.errors = vm.accomplishment.validate();

            if (Object.keys(vm.errors).length > 0) {
                vm.errorText = 'The draft has been saved but please fix the warnings before verifying!';
            }

            if (vm.accomplishment.id) {
                return vm.accomplishment.save().then(() => {
                    if (updateState) {
                        vm.saveStatus.setState('saved');
                    }

                    EventsService.publish(EventsService.ACCOMPLISHMENT_DRAFT_UPDATED, vm.accomplishment);

                    vm.unsavedData = false;

                    if (updateState) {
                        $timeout(function() {
                            vm.saveStatus.setState('ready to save');
                        }, 1000);
                    }

                    return vm.accomplishment;
                });
            } else {
                return accomplishmentService.createDraft(vm.accomplishment)
                    .then(draft => {
                        vm.accomplishment = draft;
                        if (updateState) {
                            vm.saveStatus.setState('saved');
                        }

                        EventsService.publish(EventsService.ACCOMPLISHMENT_DRAFT_UPDATED, vm.accomplishment);

                        vm.unsavedData = false;

                        if (updateState) {
                            $timeout(function() {
                                vm.saveStatus.setState('ready to save');
                            }, 1000);
                        }

                        return vm.accomplishment;
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
                    processSave();
                }

                if (!event){
                    close();
                }
            }
        }

        function getSources(searchText) {
            const qs = {where: {title: {contains: searchText}, type: vm.accomplishment.type}};
            return Restangular.all('sources').getList(qs);
        }

        function checkSource($event) {
            if (!$event.target.value) {
                vm.accomplishment.source = null;
            }

            checkValidation('source');
        }

        function openSourceTypeModal($event) {

            // Stop event from bubbling up to parents
            $event.stopPropagation();

            // Subscribe to custom event SOURCE_CREATED, execute following function when event is fired
            EventsService.subscribe(vm, EventsService.SOURCE_CREATED, function(event, source) {
                vm.accomplishment.source = source;
                vm.getSources(source.title);

                vm.errors = vm.accomplishment.validate();

                checkValidation();
            });

            // Open source type modal
            ModalService.openSourceTypeModal(vm.accomplishment);
        }

        function verify() {
            vm.errorText = '';
            vm.errors = {};
            vm.verifyStatus.setState('verifying');

            $timeout(function() {
                vm.errors = vm.accomplishment.validate();
                if (Object.keys(vm.errors).length === 0) {
                    // Is valid
                    processSave()
                        .then(() => {
                            vm.verifyStatus.setState('verified');
                            close();
                        })
                        .then(() => {
                            accomplishmentService.verifyDraft(vm.accomplishment);
                        });
                } else {
                    // Is not valid
                    vm.verifyStatus.setState('failed');
                    vm.errorText = 'The draft has been saved but not been verified! Please correct the errors on this form!';

                    processSave(false);

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