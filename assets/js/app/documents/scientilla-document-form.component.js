/* global angular */

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
                checkAndClose: "&"
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
        'ModalService',
        'documentCategories',
        'languages',
        'PhdThesisService'
    ];

    function scientillaDocumentFormController(
        EventsService,
        documentFieldsRules,
        $scope,
        $timeout,
        DocumentTypesService,
        context,
        Restangular,
        ModalService,
        documentCategories,
        languages,
        PhdThesisService
    ) {
        const vm = this;

        vm.saveStatus = saveStatus();
        vm.verifyStatus = verifyStatus();

        vm.cancel = close;
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

         /* jshint ignore:start */
        vm.$onInit = async function () {
            if (_.isFunction(vm.document.clone))
                documentBackup = vm.document.clone();
            else
                documentBackup = _.cloneDeep(vm.document);

            if (vm.document.type === 'phd_thesis') {
                vm.institutes = await PhdThesisService.getInstitutes();

                if (vm.document.phdInstitute) {
                    vm.phdInstituteId = vm.document.phdInstitute.id;
                    await getCoursesOfInstitute();
                }

                if (vm.document.phdCourse) {
                    vm.phdCourseId = vm.document.phdCourse.id;
                    await getCyclesOfCourse();
                }

                if (vm.document.phdCycle) {
                    vm.phdCycleId = vm.document.phdCycle.id;
                }
            }

            watchDocumentSourceType();
            watchDocumentType();
            watchRealizedAtIIT();
            watchPhdInstitutionId();
            watchPhdCourseId();
            watchPhdCycleId();

            $scope.$watch('form.$pristine', formUntouched => vm.unsavedData = !formUntouched);

            if (vm.document.id) {
                vm.errorText = '';
                vm.errors = vm.document.validateDocument();

                if (Object.keys(vm.errors).length > 0) {
                    vm.errorText = 'The draft has been saved but please fix the warnings before verifying!';
                }
            }

            vm.languageOptions = [];
            Object.keys(languages).map(language => {
                vm.languageOptions.push({
                    label: languages[language].name,
                    value: language
                });
            });
            vm.languageOptions = _.orderBy(vm.languageOptions, 'label');
        };
         /* jshint ignore:end */

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

                if (newValue === 'phd_thesis') {
                    if (!_.has(vm.document, 'isPhdThesisInstitutional')) {
                        vm.document.isPhdThesisInstitutional = false;
                    }

                    if (!_.has(vm.document, 'sourceType') || vm.document.sourceType !== 'book') {
                        vm.document.sourceType = 'book';
                    }

                    if (!_.has(vm.document, 'language') || !vm.document.language) {
                        vm.document.language = 'en';
                    }
                }
            });
            deregisteres.push(dereg);
        }

        /* jshint ignore:start */
        async function getCoursesOfInstitute() {
            vm.courses = await PhdThesisService.getCourses(vm.document.phdInstitute);
        }

        async function getCyclesOfCourse() {
            vm.cycles = await PhdThesisService.getCycles(vm.document.phdCourse);
        }

        function watchRealizedAtIIT() {
            const dereg = $scope.$watch('vm.document.isPhdThesisInstitutional', async (newValue, oldValue) => {
                if (newValue === oldValue) {
                    return;
                }

                if (newValue) {
                    if (!vm.institutes) {
                        vm.institutes = await PhdThesisService.getInstitutes();
                    }
                } else {
                    vm.document.phdInstitute = null;
                    vm.document.phdCourse = null;
                    vm.document.phdCycle = null;
                }
            });
            deregisteres.push(dereg);
        }

        function watchPhdInstitutionId() {
            const dereg = $scope.$watch('vm.phdInstituteId', async (newValue, oldValue) => {
                if (newValue === oldValue) {
                    return;
                }

                if (newValue && vm.institutes) {
                    const institute = vm.institutes.find(i => i.id === newValue);
                    if (!institute) {
                        return;
                    }
                    vm.phdCourseId = null;
                    vm.phdCycleId = null;
                    vm.document.phdInstitute = institute;
                    vm.document.phdCourse = null;
                    vm.document.phdCycle = null;
                    await getCoursesOfInstitute();
                }
            });
            deregisteres.push(dereg);
        }

        function watchPhdCourseId() {
            const dereg = $scope.$watch('vm.phdCourseId', async (newValue, oldValue) => {
                if (newValue === oldValue) {
                    return;
                }

                if (newValue) {
                    const course = vm.courses.find(c => c.id === newValue);
                    if (!course) {
                        return;
                    }
                    vm.phdCycleId = null;
                    vm.document.phdCourse = course;
                    vm.document.phdCycle = null;
                    await getCyclesOfCourse()
                }
            });
            deregisteres.push(dereg);
        }
        /* jshint ignore:end */

        function watchPhdCycleId() {
            const dereg = $scope.$watch('vm.phdCycleId', (newValue, oldValue) => {
                if (newValue === oldValue) {
                    return;
                }

                if (newValue) {
                    const cycle = vm.cycles.find(c => c.id === newValue);
                    if (!cycle) {
                        return;
                    }
                    vm.document.phdCycle = cycle;
                }
            });
            deregisteres.push(dereg);
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

        /* jshint ignore:start */

        async function save() {
            vm.errors = {};
            vm.errorText = '';
            await saveDocument(true);
        }

        async function saveDocument(updateState = false) {
            if (updateState)
                vm.saveStatus.setState('saving');

            vm.errorText = '';
            vm.errors = vm.document.validateDocument();

            if (updateState && Object.keys(vm.errors).length > 0)
                vm.errorText = 'The draft has been saved but please fix the warnings before verifying!';

            if (vm.document.id) await vm.document.save();
            else vm.document = await documentService.createDraft(vm.document);

            if (updateState)
                vm.saveStatus.setState('saved');

            EventsService.publish(EventsService.DRAFT_UPDATED, vm.document);

            vm.unsavedData = false;

            if (updateState)
                $timeout(function () {
                    vm.saveStatus.setState('ready to save');
                }, 1000);

            return vm.document;
        }

        async function verify() {
            vm.errorText = '';
            vm.errors = {};
            vm.verifyStatus.setState('verifying');

            await saveDocument();

            vm.errors = vm.document.validateDocument();
            if (Object.keys(vm.errors).length === 0) {
                // Is valid
                if (vm.document.getComparisonDuplicates().length > 0)
                    documentService.compareDocuments(vm.document, vm.document.getComparisonDuplicates(), documentCategories.DRAFT);
                else
                    documentService.verifyDraft(vm.document);

                vm.verifyStatus.setState('verified');
                close();
            } else {
                // Is not valid
                vm.verifyStatus.setState('failed');
                vm.errorText = 'The draft has been saved but not been verified! Please correct the errors on this form!';

                $timeout(function () {
                    vm.verifyStatus.setState('ready to verify');
                }, 1000);
            }
        }

        /* jshint ignore:end */

        function close() {
            if (_.isFunction(vm.checkAndClose()))
                vm.checkAndClose()(() => !vm.unsavedData);
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
                'scientific_conference': {
                    query: {where: {title: {contains: searchText}, type: 'conference'}},
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

            EventsService.subscribe(vm, EventsService.SOURCE_CREATED, function (event, source) {
                vm.document.source = source;
                vm.getSources(source.title);

                vm.errors = vm.document.validateDocument();

                checkValidation();
            });

            ModalService.openSourceTypeModal(vm.document.sourceType);
        }

        function checkSource($event) {
            if (!$event.target.value) {
                vm.document.source = null;
            }

            checkValidation('source');
        }
    }
})();
