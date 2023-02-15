(function () {
    "use strict";
    angular.module("services").factory("ModalService", ModalService);

    ModalService.$inject = ['$uibModal'];

    function ModalService($uibModal) {
        const service = {
            modals: []
        };

        const allowedClosingExceptions = [
            'backdrop click',
            'escape key press',
            'cancel'
        ];

        service.dismiss = function (reason) {
            const modal = getModalObject();
            if (modal)
                modal.dismiss(reason);
        };

        service.close = function (reason) {
            const modal = getModalObject();
            if (modal)
                modal.close(reason);
        };

        /* jshint ignore:start */
        service.checkAndClose = async function (isCloseable, reason) {
            if (!isCloseable()) {
                const buttonKey = await service.multipleChoiceConfirm(
                    'Unsaved data!',
                    '',
                    {'continue': 'Continue editing', 'discard': 'Discard changes'},
                    false
                );

                if (buttonKey === 'continue') return;
            }

            const modal = getModalObject();
            if (modal)
                modal.close(reason);

        };
        /* jshint ignore:end */

        service.openInstituteModal = function (institute) {
            const scopeVars = {
                institute: institute
            };

            return openModal(`<scientilla-admin-new-institute
                    institute="vm.institute"
                    close-fn="vm.onClose"
                    on-failure="vm.onFailure"
                    on-submit="vm.onSubmit"
                    check-and-close="vm.checkAndClose"
                ></scientilla-admin-new-institute>`,
                scopeVars,
                {
                    backdrop: 'static',
                    keyboard: false
                });
        };

        service.openSourceTypeModal = function (sourceType) {
            const scopeVars = {
                sourceType: sourceType
            };

            return openModal(`<scientilla-source-form\
                    source-type="vm.sourceType"
                    on-failure="vm.onFailure"
                    on-submit="vm.onSubmit"
                    close-fn="vm.onClose"
                    check-and-close="vm.checkAndClose"
                ></scientilla-source-form>`,
                scopeVars,
                {
                    backdrop: 'static',
                    keyboard: false
                });
        };

        service.openScientillaDocumentForm = function (document, researchEntity) {
            const scopeVars = {
                document: document,
                researchEntity: researchEntity,
            };

            return openModal(`<scientilla-document-form
                    document="vm.document"
                    research-entity="vm.researchEntity"
                    on-failure="vm.onFailure"
                    on-submit="vm.onSubmit"
                    close-fn="vm.onClose"
                    check-and-close="vm.checkAndClose"
                ></scientilla-document-form>`,
                scopeVars,
                {
                    size: 'lg',
                    backdrop: 'static',
                    keyboard: false
                });
        };

        service.openScientillaDocumentSearch = function () {
            return openComponentModal('scientilla-document-search', {size: 'lg'}, {});

        };

        service.openScientillaDocumentSearchView = function (document) {
            return openComponentModal('scientilla-document-search-view',
                {size: 'lg'},
                {data: {document: document}});
        };

        service.openScientillaDocumentDetails = function (document) {
            const scopeVars = {
                document: document
            };

            return openModal(`<div class="modal-header">
                                <h3>Document details</h3>
                                <button
                                    type="button"
                                    class="close"
                                    ng-click="vm.onClose()">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>

                            <div class="modal-body">
                                <scientilla-document-details
                                    document="vm.document"
                                    class="document-details"></scientilla-document-details>
                            </div>`,
                scopeVars,
                {size: 'lg'});
        };

        service.openProjectDetails = function (project) {
            const scopeVars = {
                project: project
            };

            return openModal(`<div class="modal-header">
                                <h3>Project details</h3>
                                <button
                                    type="button"
                                    class="close"
                                    ng-click="vm.onClose()">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>

                            <div class="modal-body">
                                <scientilla-project-details
                                    project="vm.project"
                                    class="project-details"></scientilla-project-details>
                            </div>`,
                scopeVars,
                {size: 'lg'});
        };

        service.openPatentDetails = function (patent) {
            const scopeVars = {
                patent: patent
            };

            return openModal(`<div class="modal-header">
                                <h3>Patent details</h3>
                                <button
                                    type="button"
                                    class="close"
                                    ng-click="vm.onClose()">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>

                            <div class="modal-body">
                                <scientilla-patent-details
                                    patent="vm.patent"
                                    class="patent-details"></scientilla-patent-details>
                            </div>`,
                scopeVars,
                {size: 'lg'});
        };

        service.openPatentFamilyDetails = function (patentFamily) {
            const scopeVars = {
                patentFamily: patentFamily
            };

            return openModal(`<div class="modal-header">
                                <h3>Patent family details</h3>
                                <button
                                    type="button"
                                    class="close"
                                    ng-click="vm.onClose()">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>

                            <div class="modal-body">
                                <scientilla-patent-family-details
                                    patent-family="vm.patentFamily"
                                    class="patent-family-details"></scientilla-patent-family-details>
                            </div>`,
                scopeVars,
                {size: 'lg'});
        };

        service.openAgreementForm = function (researchEntity, researchItem) {
            const scopeVars = {
                researchItem: researchItem,
                researchEntity: researchEntity,
            };

            return openModal(
                `<scientilla-agreement-form
                    agreement="vm.researchItem"
                    research-entity="vm.researchEntity"
                    on-failure="vm.onFailure"
                    on-submit="vm.onSubmit"
                    check-and-close="vm.checkAndClose"
                    close-fn="vm.onClose"
                ></scientilla-agreement-form>`,
                scopeVars,
                {
                    backdrop: 'static',
                    keyboard: false
                }
            );
        };

        service.openAgreementDetails = function (agreement) {
            const scopeVars = {
                agreement
            };

            return openModal(`<div class="modal-header">
                                <button
                                    type="button"
                                    class="close"
                                    ng-click="vm.onClose()">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>

                            <div class="modal-body">
                                <scientilla-agreement-details
                                    agreement="vm.agreement"
                                    class="agreement-details"></scientilla-agreement-details>
                            </div>`,
                scopeVars,
                {size: 'lg'});
        };

        service.openScientillaUserForm = function (user, settings = false) {

            const scopeVars = {
                user: user,
                settings: settings
            };

            return openModal(
                `<scientilla-user-form
                    original-user="vm.user"
                    settings="vm.settings"
                    on-failure="vm.onFailure"
                    on-submit="vm.onSubmit"
                    check-and-close="vm.checkAndClose"
                ></scientilla-user-form>`,
                scopeVars,
                {
                    backdrop: 'static',
                    keyboard: false
                });
        };

        service.openCollaboratorForm = function (group, collaborator = false) {

            const scopeVars = {
                group,
                collaborator
            };

            return openModal(
                `<collaborator-form
                    class="collaborator-modal"
                    group-id="vm.group.id"
                    collaborator="vm.collaborator"
                    check-and-close="vm.checkAndClose"
                ></collaborator-form>`,
                scopeVars,
                {
                    backdrop: 'static',
                    keyboard: false
                });
        };

        service.openProfileForm = function () {

            const scopeVars = {
                profile: {}
            };

            return openModal(
                `<profile-form
                    profile="vm.profile"
                    on-failure="vm.onFailure"
                    on-submit="vm.onSubmit"
                    check-and-close="vm.checkAndClose"></profile-form>`,
                scopeVars,
                {
                    size: 'md',
                    backdrop: 'static',
                    keyboard: false
                });
        };

        service.openGroupProfileForm = function () {

            const scopeVars = {};

            return openModal(
                `<group-profile-form
                    on-failure="vm.onFailure"
                    on-submit="vm.onSubmit"
                    check-and-close="vm.checkAndClose"></group-profile-form>`,
                scopeVars,
                {
                    size: 'md',
                    backdrop: 'static',
                    keyboard: false
                });
        };

        service.openDocumentComparisonForm = function (document, duplicates, category) {

            const scopeVars = {
                document: document,
                duplicates: duplicates,
                category: category
            };

            return openModal(`<scientilla-document-comparison-form\
                    document="vm.document"
                    duplicates="vm.duplicates"
                    category="vm.category"
                    on-failure="vm.onFailure"
                    on-submit="vm.onSubmit"
                    check-and-close="vm.checkAndClose"
                ></scientilla-document-comparison-form>`,
                scopeVars,
                {
                    size: 'lg',
                    backdrop: 'static',
                    keyboard: false
                });
        };


        service.openScientillaTagForm = function (document) {

            const scopeVars = {
                document: document
            };

            return openModal(`<scientilla-tag-form
                    document="vm.document"
                    on-submit="vm.onSubmit"
                    check-and-close="vm.checkAndClose"
                 ></scientilla-tag-form>`,
                scopeVars,
                {
                    backdrop: 'static',
                    keyboard: false
                });
        };


        service.openScientillaGroupForm = function (group) {

            const scopeVars = {
                group: group
            };

            return openModal(`<scientilla-group-form
                    group="vm.group"
                    on-failure="vm.onFailure"
                    on-submit="vm.onSubmit"
                    check-and-close="vm.checkAndClose"
                 ></scientilla-group-form>`,
                scopeVars,
                {
                    backdrop: 'static',
                    keyboard: false
                });
        };

        service.openScientillaAgreementAdminForm = function (group) {

            const scopeVars = {
                group: group
            };

            return openModal(`<scientilla-agreement-admin-form
                    group="vm.group"
                    on-failure="vm.onFailure"
                    on-submit="vm.onSubmit"
                    check-and-close="vm.checkAndClose"
                 ></scientilla-agreement-admin-form>`,
                scopeVars,
                {
                    backdrop: 'static',
                    keyboard: false
                });
        };

        service.openDocumentAffiliationForm = function (document) {
            const scopeVars = {
                document: document
            };

            return openModal(`<scientilla-document-affiliations-form
                    document="vm.document"
                    on-failure="vm.onFailure"
                    on-submit="vm.onSubmit"
                    check-and-close="vm.checkAndClose"
                ></scientilla-document-affiliations-form>`,
                scopeVars,
                {
                    backdrop: 'static',
                    keyboard: false
                });
        };

        service.openDocumentAuthorsForm = function (document) {
            const scopeVars = {
                document: document
            };

            return openModal(`<scientilla-document-authors-form
                    document="vm.document"
                    on-failure="vm.onFailure"
                    on-submit="vm.onSubmit"
                    check-and-close="vm.checkAndClose"
                ></scientilla-document-authors-form>`,
                scopeVars,
                {
                    backdrop: 'static',
                    keyboard: false
                });
        };

        service.openDocumentVerificationForm = function (document, verificationFn, document2) {
            const scopeVars = {
                document: document,
                document2: document2,
                verificationFn: verificationFn
            };

            return openModal(
                '<scientilla-document-verification-form\
                    document="vm.document"\
                    document2="vm.document2"\
                    verification-fn="vm.verificationFn"\
                    on-failure="vm.onFailure"\
                    on-submit="vm.onSubmit"\
                ></scientilla-document-verification-form>',
                scopeVars
            );
        };

        service.multipleChoiceConfirm = function (title, message, buttonLabels, cancelLabel = 'Cancel', closeable = false) {
            buttonLabels = buttonLabels || {};

            const scope = {
                title: title,
                message: message,
                buttonLabels: buttonLabels,
                closeable: closeable
            };

            let args = {};

            if (!closeable) {
                args.backdrop = 'static';
                args.keyboard = false;
            }

            let buttons = Object.keys(buttonLabels).map(
                key => '<li><scientilla-button click="vm.onSubmit(\'' + key + '\')">' + buttonLabels[key] + '</scientilla-button></li>'
            ).join('');

            if (cancelLabel !== false) {
                buttons += '<li><scientilla-button click="vm.onSubmit(\'cancel\')" type="cancel">' + cancelLabel + '</scientilla-button></li>';
            }

            const template = `<div class="modal-header">
                                <h3 class="confirm-title" ng-if="vm.title">{{vm.title}}</h3>
                                <button
                                    type="button"
                                    class="close"
                                    ng-if="vm.closeable"
                                    ng-click="vm.onSubmit('cancel')">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>

                            <div class="modal-body">
                                <div class="confirm-message" ng-if="vm.message">{{vm.message}}</div>
                                <ul class="modal-buttons">
                                ${buttons}
                                </ul>
                            </div>`;

            return openModal(template, scope, args);
        };

        service.openWizard = function (steps, config = {}) {
            let args = {};
            let options = {};

            if (config.size) {
                args.size = config.size;
            }

            options.data = {steps: steps};

            if (!config.isClosable) {
                args = Object.assign({}, args, {
                    backdrop: 'static',
                    keyboard: false
                });
                options.data.isClosable = false;
            } else {
                options.data.isClosable = true;
            }

            return openComponentModal('wizard-container', args, options);
        };

        service.confirm = function (title, message) {
            return service.multipleChoiceConfirm(title, message, {ok:'Ok'});
        };

        service.alert = function (title, message) {
            return service.multipleChoiceConfirm(title, message, [], 'Close');
        };

        service.openGenerateAgreementGroup = function (agreement) {

            const scopeVars = {
                agreement
            };

            return openModal(`<scientilla-generate-agreement-group-form\
                    agreement="vm.agreement"
                    on-failure="vm.onFailure"
                    on-submit="vm.onSubmit"
                    check-and-close="vm.checkAndClose"
                ></scientilla-generate-agreement-group-form>`,
                scopeVars,
                {
                    size: 'md',
                    backdrop: 'static',
                    keyboard: false
                });
        };

        service.openAdminPhdThesisForm = (type = false, action = false, institute = false, course = false, cycle = false) => {

            const scopeVars = {
                type,
                action,
                institute,
                course,
                cycle
            };

            return openModal(`<scientilla-admin-phd-thesis-form
                    type="vm.type"
                    action="vm.action"
                    institute="vm.institute"
                    course="vm.course"
                    cycle="vm.cycle"
                    on-failure="vm.onFailure"
                    on-submit="vm.onSubmit"
                    check-and-close="vm.checkAndClose"
                ></scientilla-admin-phd-thesis-form>`,
                scopeVars,
                {
                    size: 'sm',
                    backdrop: 'static',
                    keyboard: false
                });
        };

        service.openScientillaResearchItemForm = function (researchEntity, researchItem, category) {
            const scopeVars = {
                researchItem: researchItem,
                researchEntity: researchEntity,
            };

            return openModal(
                `<scientilla-${category}-form
                    class="${category}-form"
                    ${category}="vm.researchItem"
                    research-entity="vm.researchEntity"
                    on-failure="vm.onFailure"
                    on-submit="vm.onSubmit"
                    check-and-close="vm.checkAndClose"
                    close-fn="vm.onClose"
                ></scientilla-${category}-form>`,
                scopeVars,
                {
                    size: 'lg',
                    backdrop: 'static',
                    keyboard: false
                }
            );
        };

        service.openScientillaResearchItemAffiliationForm = function (researchEntity, researchItem) {
            const scopeVars = {
                researchItem: researchItem,
            };

            return openModal(
                `<scientilla-research-item-affiliations-form
                    research-item="vm.researchItem"
                    check-and-close="vm.checkAndClose"
                    on-submit="vm.onSubmit"
                ></scientilla-research-item-affiliations-form>`,
                scopeVars,
                {
                    backdrop: 'static',
                    keyboard: false
                }
            );
        };

        service.openScientillaResearchItemVerificationForm = function (researchItem, verificationFn, category) {
            const scopeVars = {
                researchItem: researchItem,
                verificationFn: verificationFn
            };

            return openModal(
                `<scientilla-${category}-verification-form\
                    research-item="vm.researchItem"\
                    verification-fn="vm.verificationFn"\
                    on-failure="vm.onFailure"\
                    on-submit="vm.onSubmit" \
                    close-fn="vm.onClose"\
                ></scientilla-${category}-verification-form>`,
                scopeVars
            );

        };

        service.openScientillaResearchItemDetails = function (researchItem, category) {
            const scopeVars = {researchItem};
            let title = category;

            switch (category) {
                case 'training-module':
                    title = 'training module';
                    break;
                default:
                    break;
            }

            return openModal(`<div class="modal-header">
                                <h3 class="capitalize-first-letter">${title} details</h3>
                                <button
                                    type="button"
                                    class="close"
                                    ng-click="vm.onClose()">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>

                            <div class="modal-body">
                                <scientilla-${category}-details
                                    research-item="vm.researchItem"
                                    class="${category}-details"></scientilla-${category}-details>
                            </div>`, scopeVars, {size: 'lg'});
        };

        return service;

        // private

        /* jshint ignore:start */
        async function openComponentModal(component, args, options = {}) {
            const callbacks = getDefaultCallbacks();

            const resolve = {
                data: options.data,
                callbacks
            };

            try {
                const modal = $uibModal.open(
                    _.defaults({
                        animation: true,
                        component: component,
                        resolve: resolve
                    }, args)
                );

                addModalObject(modal);
                return await modal.result;
            } catch (e) {
                if (!allowedClosingExceptions.includes(e))
                    throw e;
            }

        }

        async function openModal(template, scope, args) {
            const callbacks = getDefaultCallbacks();

            _.defaults(scope, callbacks);

            const controller = function () {
                _.assign(this, scope);
            };

            try {
                const modal = $uibModal.open(
                    _.defaults({
                        animation: true,
                        template: template,
                        controller: controller,
                        controllerAs: 'vm',
                    }, args)
                );

                addModalObject(modal);
                return await modal.result;
            } catch (e) {
                if (allowedClosingExceptions.includes(e))
                    return 'cancel';

                throw e;
            }
        }

        /* jshint ignore:end */

        function getDefaultCallbacks() {
            return {
                onFailure: _.noop,
                onSubmit: service.close,
                onClose: service.close,
                checkAndClose: service.checkAndClose
            };
        }

        function addModalObject(modal) {
            service.modals.push(modal);
        }

        function getModalObject() {
            return service.modals.pop();
        }
    }

}());
