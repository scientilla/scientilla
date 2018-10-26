(function () {
    "use strict";
    angular.module("services").factory("ModalService", ModalService);

    ModalService.$inject = ['$uibModal'];

    function ModalService($uibModal) {
        const service = {
            modals: []
        };

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

        service.openInstituteModal = function (institute) {
            const scopeVars = {
                institute: institute
            };

            const modal = openModal(
                '<scientilla-admin-new-institute\
                    institute="vm.institute"\
                    on-failure="vm.onFailure"\
                    on-submit="vm.onSubmit" \
                    close-fn="vm.onClose" \
                ></scientilla-admin-new-institute>',
                scopeVars
            );

            addModalObject(modal);
            return modal.result;
        };

        service.openSourceTypeModal = function (document) {
            const scopeVars = {
                document: document
            };

            const modal = openModal(
                '<scientilla-source-form\
                    document="vm.document"\
                    on-failure="vm.onFailure"\
                    on-submit="vm.onSubmit" \
                    close-fn="vm.onClose" \
                ></scientilla-source-form>',
                scopeVars
            );

            addModalObject(modal);
            return modal.result;
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
                scopeVars
            );

            addModalObject(modal);
            return modal.result;
        };

        service.openScientillaDocumentSearch = function () {
            const modal = openComponentModal('scientilla-document-search', {}, {size: 'lg'});
            addModalObject(modal);
            return modal.result;
        };

        service.openScientillaDocumentSearchView = function (document) {
            const modal = openComponentModal('scientilla-document-search-view',
                {document: document},
                {size: 'lg'});
            addModalObject(modal);
            return modal.result;
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

            const modal = openModal(template, scopeVars, {size: 'lg'});

            addModalObject(modal);
            return modal.result;
        };

        service.openScientillaUserForm = function (user) {

            const scopeVars = {
                user: user
            };

            const modal = openModal(
                '<scientilla-user-form\
                    user="vm.user"\
                    on-failure="vm.onFailure"\
                    on-submit="vm.onSubmit"\
                ></scientilla-user-form>',
                scopeVars
            );

            addModalObject(modal);
            return modal.result;
        };

        service.openDocumentComparisonForm = function (document1, document2) {

            var scopeVars = {
                document1: document1,
                document2: document2
            };

            const modal = openModal(
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
            addModalObject(modal);
            return modal.result;
        };


        service.openScientillaTagForm = function (document) {

            const scopeVars = {
                document: document
            };

            const modal = openModal(
                '<scientilla-tag-form\
                    document="vm.document"\
                    on-submit="vm.onSubmit" \
                    close-fn="vm.onClose" \
                 ></scientilla-tag-form>',
                scopeVars
            );

            addModalObject(modal);
            return modal.result;
        };


        service.openScientillaGroupForm = function (group) {

            const scopeVars = {
                group: group
            };

            const modal = openModal(
                '<scientilla-group-form\
                    group="vm.group"\
                    on-failure="vm.onFailure"\
                    on-submit="vm.onSubmit"\
                 ></scientilla-group-form>',
                scopeVars
            );

            addModalObject(modal);
            return modal.result;
        };

        service.openDocumentAffiliationForm = function (document) {
            const scopeVars = {
                document: document
            };

            const modal = openModal(
                '<scientilla-document-affiliations-form\
                    document="vm.document"\
                    on-failure="vm.onFailure"\
                    on-submit="vm.onSubmit"\
                ></scientilla-document-affiliations-form>',
                scopeVars
            );

            addModalObject(modal);
            return modal.result;
        };

        service.openDocumentAuthorsForm = function (document) {
            const scopeVars = {
                document: document
            };

            const modal = openModal(
                '<scientilla-document-authors-form\
                    document="vm.document"\
                    on-failure="vm.onFailure"\
                    on-submit="vm.onSubmit"\
                ></scientilla-document-authors-form>',
                scopeVars
            );

            addModalObject(modal);
            return modal.result;
        };

        service.openDocumentVerificationForm = function (document, verificationFn, document2) {
            const scopeVars = {
                document: document,
                document2: document2,
                verificationFn: verificationFn
            };

            const modal = openModal(
                '<scientilla-document-verification-form\
                    document="vm.document"\
                    document2="vm.document2"\
                    verification-fn="vm.verificationFn"\
                    on-failure="vm.onFailure"\
                    on-submit="vm.onSubmit"\
                ></scientilla-document-verification-form>',
                scopeVars
            );

            addModalObject(modal);
            return modal.result;
        };

        service.multipleChoiceConfirm = function (title, message, buttonLabels, cancelLabel = 'Cancel', closeable = false) {
            buttonLabels = buttonLabels || [];
            return new Promise(function (resolve, reject) {
                const scope = {
                    title: title,
                    message: message,
                    cancel: function () {
                        this.onClose();
                        resolve(-1);
                    },
                    ok: function (i) {
                        this.onSubmit();
                        resolve(i);
                    },
                    buttonLabels: buttonLabels,
                    closeable: closeable
                };

                let args = {};

                if (!closeable) {
                    args.backdrop = 'static';
                    args.keyboard = false;
                }

                var buttons = scope.buttonLabels.map(function (b, i) {
                        return '<li><scientilla-button click="vm.ok(' + i + ')">' + b + '</scientilla-button></li>';
                    }).join('');

                if (cancelLabel !== false) {
                    buttons += '<li><scientilla-button click="vm.cancel()" type="cancel">' + cancelLabel + '</scientilla-button></li>';
                }

                var template = `<div class="modal-header">
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
                                    <ul class="modal-buttons">` +
                                        buttons + 
                                    `</ul>
                                </div>`;

                const modal = openModal(template, scope, args);

                modal.result.catch(function (err) {
                    reject(err);
                });
                addModalObject(modal);
            });
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

            const modal = openComponentModal('wizard-container', args, options);
            addModalObject(modal);
            return modal.result;
        };

        service.confirm = function (title, message) {
            return service.multipleChoiceConfirm(title, message, ['Ok']);
        };

        service.alert = function (title, message) {
            return service.multipleChoiceConfirm(title, message, [], 'Close');
        };

        return service;

        // private
        function openComponentModal(component, args, options = {}) {
            const callbacks = getDefaultCallbacks();

            const resolve = {
                data: options.data,
                callbacks
            };

            var modal = $uibModal.open(
                _.defaults({
                    animation: true,
                    component: component,
                    resolve: resolve
                }, args)
            );

            return modal;
        }

        function openModal(template, scope, args) {
            const callbacks = getDefaultCallbacks();

            _.defaults(scope, callbacks);

            const controller = function () {
                _.assign(this, scope);
            };

            var modal = $uibModal.open(
                _.defaults({
                    animation: true,
                    template: template,
                    controller: controller,
                    controllerAs: 'vm',
                }, args)
            );

            return modal;
        }

        function getDefaultCallbacks() {
            return {
                onFailure: _.noop,
                onSubmit: service.close,
                onClose: service.close
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
