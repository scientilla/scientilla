/* global angular */
(function () {
    "use strict";

    angular
        .module('app')
        .component('scientillaAccomplishmentForm', {
            templateUrl: 'partials/scientilla-accomplishment-form.html',
            controller: scientillaAccomplishmentFormController,
            controllerAs: 'vm',
            bindings: {
                accomplishment: "<",
                closeFn: "&"
            }
        });

    scientillaAccomplishmentFormController.$inject = [
        'AccomplishmentService',
        'EventsService',
        'accomplishmentFieldsRules',
        'accomplishmentEventTypes',
        '$scope',
        '$timeout',
        'ResearchItemTypesService',
        'context',
        'Restangular',
        'ModalService'
    ];

    function scientillaAccomplishmentFormController(AccomplishmentService,
                                                    EventsService,
                                                    accomplishmentFieldsRules,
                                                    accomplishmentEventTypes,
                                                    $scope,
                                                    $timeout,
                                                    ResearchItemTypesService,
                                                    context,
                                                    Restangular,
                                                    ModalService) {
        const vm = this;

        vm.saveStatus = saveStatus();
        vm.verifyStatus = verifyStatus();

        vm.cancel = cancel;
        vm.verify = verify;
        vm.save = save;
        vm.getSources = getSources;
        vm.openSourceFormModal = openSourceFormModal;
        vm.fieldsRules = accomplishmentFieldsRules;
        vm.eventTypes = vm.accomplishment.eventType ?
            accomplishmentEventTypes :
            [{key: null, label: 'Select'}].concat(accomplishmentEventTypes);

        let debounceTimeout = null;

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

        /* jshint ignore:start */
        vm.$onInit = async function () {
            vm.researchEntity = await context.getResearchEntity();
            vm.types = await ResearchItemTypesService.getTypes('accomplishment');

            $scope.$watch('form.$pristine', formUntouched => vm.unsavedData = !formUntouched);
            $scope.$on('modal.closing', (event, reason) => cancel(event));

            if (vm.accomplishment.id) {
                vm.errorText = '';
                vm.errors = AccomplishmentService.validate(vm.accomplishment);

                if (!_.isEmpty(vm.errors)) {
                    vm.errorText = 'Please fix the warnings before verifying!';
                }
            }

        };


        function resetErrors() {
            vm.errors = {};
            vm.errorText = '';
        }

        function checkValidation(field = false) {
            vm.errors[field] = AccomplishmentService.validate(vm.accomplishment, field);

            if (!vm.errors[field])
                delete vm.errors[field];

            vm.errorText = !_.isEmpty(vm.errors) ? 'Please fix the warnings before verifying!' : '';
        }

        /* jshint ignore:end */
        function fieldValueHasChanged(field = false) {
            $timeout.cancel(timeout);

            timeout = $timeout(() => checkValidation(field), delay);
        }

        function saveStatus() {
            return {
                setState: function (state) {
                    this.state = state;

                    vm.mode = 'draft';

                    switch (state) {
                        case 'ready to save':
                            this.message = 'Save draft';
                            break;
                        case 'saving':
                            this.message = 'Saving draft';
                            break;
                        case 'saved':
                            this.message = 'Draft is saved!';
                            $scope.form.$setPristine();
                            break;
                        case 'failed':
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

                    switch (state) {
                        case 'ready to verify':
                            this.message = 'Save & verify';
                            break;
                        case 'verifying':
                            this.message = 'Verifying draft';
                            break;
                        case 'verified':
                            this.message = 'Draft is Verified!';
                            $scope.form.$setPristine();
                            break;
                        case 'failed':
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
            return processSave(true);
        }

        /* jshint ignore:start */
        async function processSave(updateState = false) {
            if (updateState)
                vm.saveStatus.setState('saving');

            vm.errorText = '';
            vm.errors = AccomplishmentService.validate(vm.accomplishment);

            if (!_.isEmpty(vm.errors))
                vm.errorText = 'The draft has been saved but please fix the warnings before verifying!';

            const filteredAccomplishment = AccomplishmentService.filterFields(vm.accomplishment);

            if (filteredAccomplishment.id)
                await AccomplishmentService.update(vm.researchEntity, filteredAccomplishment);
            else {
                const draft = await AccomplishmentService.create(vm.researchEntity, filteredAccomplishment);
                vm.accomplishment.id = draft.researchItem.id;
            }

            if (updateState) {
                vm.saveStatus.setState('saved');
                $timeout(() => vm.saveStatus.setState('ready to save'), 1000);
            }

            vm.unsavedData = false;
        }

        function cancel(event = false) {
            if (vm.unsavedData) {
                if (event) {
                    event.preventDefault();
                }

                // Show the unsaved data modal
                ModalService
                    .multipleChoiceConfirm('Unsaved data',
                        `You have unsaved changes. Do you want to close the form?`,
                        ['Yes', 'No'],
                        false)
                    .then(function (buttonIndex) {
                        switch (buttonIndex) {
                            case 0:
                                vm.unsavedData = false;
                                close();
                                break;
                            case 1:
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

                if (!event) {
                    close();
                }
            }
        }

        function getSources(searchText) {
            const qs = {where: {title: {contains: searchText}}};
            return Restangular.all('sources').getList(qs);
        }

        async function openSourceFormModal($event) {

            // Stop event from bubbling up to parents
            $event.stopPropagation();

            // Subscribe to custom event SOURCE_CREATED, execute following function when event is fired
            EventsService.subscribe(vm, EventsService.SOURCE_CREATED, function (event, source) {
                vm.accomplishment.medium = source;
                vm.getSources(source.title);
                vm.unsavedData = true;

                vm.errors = AccomplishmentService.validate(vm.accomplishment);
                return checkValidation();
            });

            // Open source type modal
            ModalService.openSourceTypeModal();
        }

        async function verify() {
            vm.errorText = '';
            vm.errors = {};
            vm.verifyStatus.setState('verifying');

            $timeout(async function () {
                vm.errors = await AccomplishmentService.validate(vm.accomplishment);

                if (Object.keys(vm.errors).length === 0) {
                    // Is valid
                    await processSave();
                    vm.verifyStatus.setState('verified');
                    await close();
                    AccomplishmentService.verify(vm.researchEntity, vm.accomplishment);
                } else {
                    // Is not valid
                    vm.verifyStatus.setState('failed');
                    vm.errorText = 'The draft has been saved but not been verified! Please correct the errors on this form!';

                    await processSave(false);

                    $timeout(function () {
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

        /* jshint ignore:end */
    }
})();