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
                const buttonIndex = await service.multipleChoiceConfirm('Unsaved data',
                    `You have unsaved changes. Do you want to close the form?`,
                    ['Yes', 'No'],
                    false);

                if (buttonIndex === 1) return;
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

            return openModal(
                '<scientilla-admin-new-institute\
                    institute="vm.institute"\
                    on-failure="vm.onFailure"\
                    on-submit="vm.onSubmit" \
                    close-fn="vm.onClose" \
                ></scientilla-admin-new-institute>',
                scopeVars
            );
        };

        service.openSourceTypeModal = function (sourceType) {
            const scopeVars = {
                sourceType: sourceType
            };

            return openModal(
                '<scientilla-source-form\
                    source-type="vm.sourceType"\
                    on-failure="vm.onFailure"\
                    on-submit="vm.onSubmit" \
                    close-fn="vm.onClose" \
                ></scientilla-source-form>',
                scopeVars
            );
        };

        service.openScientillaDocumentForm = function (document, researchEntity) {
            const scopeVars = {
                document: document,
                researchEntity: researchEntity,
            };

            let modal = openModal(
                '<scientilla-document-form\
                    document="vm.document"\
                    research-entity="vm.researchEntity"\
                    on-failure="vm.onFailure"\
                    on-submit="vm.onSubmit" \
                    close-fn="vm.onClose"\
                ></scientilla-document-form>',
                scopeVars,
                {
                    size: 'lg'
                }
            );
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

            var template = `<div class="modal-header">
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
                            </div>`;

            return openModal(template, scopeVars, {size: 'lg'});
        };

        service.openScientillaUserForm = function (user) {

            const scopeVars = {
                user: user
            };

            return openModal(
                '<scientilla-user-form\
                    user="vm.user"\
                    on-failure="vm.onFailure"\
                    on-submit="vm.onSubmit"\
                ></scientilla-user-form>',
                scopeVars
            );
        };

        service.openDocumentComparisonForm = function (document1, document2) {

            const scopeVars = {
                document1: document1,
                document2: document2
            };

            return openModal(
                '<scientilla-document-comparison-form\
                    document1="vm.document1"\
                    document2="vm.document2"\
                    on-failure="vm.onFailure"\
                    on-submit="vm.onSubmit"\
                ></scientilla-document-comparison-form>',
                scopeVars,
                {
                    size: 'lg'
                }
            );
        };


        service.openScientillaTagForm = function (document) {

            const scopeVars = {
                document: document
            };

            return openModal(
                '<scientilla-tag-form\
                    document="vm.document"\
                    on-submit="vm.onSubmit" \
                    close-fn="vm.onClose" \
                 ></scientilla-tag-form>',
                scopeVars
            );
        };


        service.openScientillaGroupForm = function (group) {

            const scopeVars = {
                group: group
            };

            return openModal(
                '<scientilla-group-form\
                    group="vm.group"\
                    on-failure="vm.onFailure"\
                    on-submit="vm.onSubmit"\
                 ></scientilla-group-form>',
                scopeVars
            );
        };

        service.openDocumentAffiliationForm = function (document) {
            const scopeVars = {
                document: document
            };

            return openModal(
                '<scientilla-document-affiliations-form\
                    document="vm.document"\
                    on-failure="vm.onFailure"\
                    on-submit="vm.onSubmit"\
                ></scientilla-document-affiliations-form>',
                scopeVars
            );
        };

        service.openDocumentAuthorsForm = function (document) {
            const scopeVars = {
                document: document
            };

            return openModal(
                '<scientilla-document-authors-form\
                    document="vm.document"\
                    on-failure="vm.onFailure"\
                    on-submit="vm.onSubmit"\
                ></scientilla-document-authors-form>',
                scopeVars
            );
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
            buttonLabels = buttonLabels || [];

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

            let buttons = scope.buttonLabels.map(
                (b, i) => '<li><scientilla-button click="vm.onSubmit(' + i + ')">' + b + '</scientilla-button></li>'
            ).join('');

            if (cancelLabel !== false) {
                buttons += '<li><scientilla-button click="vm.onSubmit(-1)" type="cancel">' + cancelLabel + '</scientilla-button></li>';
            }

            const template = `<div class="modal-header">
                                <h3 class="confirm-title" ng-if="vm.title">{{vm.title}}</h3>
                                <button
                                    type="button"
                                    class="close"
                                    ng-if="vm.closeable"
                                    ng-click="vm.cancel()">
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
            return service.multipleChoiceConfirm(title, message, ['Ok']);
        };

        service.alert = function (title, message) {
            return service.multipleChoiceConfirm(title, message, [], 'Close');
        };

        service.openScientillaResearchItemForm = function (researchEntity, researchItem, category) {
            const scopeVars = {
                researchItem: researchItem,
                researchEntity: researchEntity,
            };

            return openModal(
                `<scientilla-${category}-form\
                    ${category}="vm.researchItem"\
                    research-entity="vm.researchEntity"\
                    on-failure="vm.onFailure"\
                    on-submit="vm.onSubmit" \
                    close-fn="vm.onClose"\
                ></scientilla-${category}-form>`,
                scopeVars,
                {
                    size: 'lg'
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
                    close-fn="vm.onClose"
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

            return openModal(`<div class="modal-header">
                                <h3 class="text-capitalize">${category} details</h3>
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
                                    class="document-details"></scientilla-${category}-details>
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
                    return -1;

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
