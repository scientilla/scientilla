(function () {
    angular.module("components").factory("ModalService", ModalService);

    ModalService.$inject = ['$uibModal'];


    function ModalService($uibModal) {
        var service = {
            modal: null
        };


        service.dismiss = function (reason) {
            service.modal.dismiss(reason);
            service.modal = null;
        };

        service.close = function (reason) {
            service.modal.close(reason);
            service.modal = null;
        };


        service.openScientillaDocumentForm = function (document, researchEntity) {
            var scopeVars = {
                document: document,
                researchEntity: researchEntity
            };

            service.modal = openModal(
                    '<scientilla-document-form\
                        document="vm.document"\
                        research-entity="vm.researchEntity"\
                        on-failure="vm.onFailure"\
                        on-submit="vm.onSubmit" \
                    ></scientilla-document-form>',
                    scopeVars
                    );

            return service.modal.result;
        };

        service.openScientillaDocumentDetails = function (document){
            var scopeVars = {
                document: document
            };

            service.modal = openModal(
                '<scientilla-document-details\
                    document="vm.document"\
                ></scientilla-document-details>',
                scopeVars,
                {size: 'lg'}
            );

            return service.modal.result;
        };


        service.openScientillaUserForm = function (user) {

            var scopeVars = {
                user: user
            };

            service.modal = openModal(
                    '<scientilla-user-form\
                        user="vm.user"\
                        on-failure="vm.onFailure"\
                        on-submit="vm.onSubmit"\
                    ></scientilla-user-form>',
                    scopeVars
                    );

            return service.modal.result;
        };


        service.openScientillaGroupForm = function (group) {

            var scopeVars = {
                group: group
            };

            service.modal = openModal(
                    '<scientilla-group-form\
                        group="vm.group"\
                        on-failure="vm.onFailure"\
                        on-submit="vm.onSubmit"\
                     ></scientilla-group-form>',
                    scopeVars
                    );

            return service.modal.result;
        };

        service.multipleChoiceConfirm = function(title, message, buttonLabels) {
            buttonLabels = buttonLabels || [];
            var ret = new Promise(function (resolve, reject) {
                var scope = {
                    title: title,
                    message: message,
                    cancel: function () {
                        this.onClose();
                        reject();
                    },
                    ok: function (i) {
                        this.onSubmit();
                        resolve(i);
                    },
                    buttonLabels: buttonLabels
                };
                service.modal = openModal('\
                        <div class="scientilla-modal">\
                            <div>\
                                <h3 ng-if="vm.title">{{vm.title}}</h3>\
                                <div ng-if="vm.message">{{vm.message}}</div>\
                            </div>\
                            <hr>' +
                            scope.buttonLabels.map(function(b, i) { return '<scientilla-button ng-click="vm.ok('+i+')">'+b+'</scientilla-button>';}).join('') +
                            '<scientilla-button ng-click="vm.cancel()" type="cancel">Cancel</scientilla-button>\
                        <div>',
                        scope);

                service.modal.result.catch(function () {
                    reject();
                });
            });

            return ret;
        };


        service.confirm = function (title, message) {
            return service.multipleChoiceConfirm(title, message, ['Ok']);
        };

        return service;

        // private
        function openModal(template, scope, args) {
            var callbacks = getDefaultCallbacks();

            _.defaults(scope, callbacks);

            var controller = function () {
                _.assign(this, scope);
            };

            return $uibModal.open(
                _.defaults({
                    animation: true,
                    template: template,
                    controller: controller,
                    controllerAs: 'vm'
                }, args)
            );
        }

        function getDefaultCallbacks() {
            var callbacks = {
                onFailure: function(){},
                onSubmit: service.close,
                onClose: service.close
            };

            return callbacks;
        }
    }

}());
