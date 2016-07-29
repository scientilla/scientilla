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
                        on-submit="vm.onSubmit" >\
                    </scientilla-document-form>',
                    scopeVars
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
                        on-submit="vm.onSubmit" >\
                    </scientilla-user-form>',
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
                        on-submit="vm.onSubmit" >\
                    </scientilla-group-form>',
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
                            scope.buttonLabels.map(function(b, i) { return '<button ng-click="vm.ok('+i+')" class="btn btn-primary">'+b+'</button>';}).join('') + 
                            '<button ng-click="vm.cancel()" class="btn btn-warning">Cancel</button>\
                        <div>',
                        scope);

                service.modal.result.catch(function () {
                    reject();
                });
            });

            return ret;
        };


        service.confirm = function (title, message) {

            var ret = new Promise(function (resolve, reject) {

                var scope = {
                    title: title,
                    message: message,
                    ok: function () {
                        this.onSubmit();
                        resolve();
                    },
                    cancel: function () {
                        this.onClose();
                        reject();
                    }
                };

                service.modal = openModal('\
                        <div>\
                            <h3 ng-if="vm.title">{{vm.title}}</h3>\
                            <div ng-if="vm.message">{{vm.message}}</div>\
                        </div>\
                        <hr>\
                        <button ng-click="vm.ok()" class="btn btn-primary">Ok</button>\
                        <button ng-click="vm.cancel()" class="btn btn-warning">Cancel</button>',
                        scope);

                service.modal.result.catch(function () {
                    reject();
                });
            });

            return ret;

        };

        return service;

        // private
        function openModal(template, scope) {
            var callbacks = getDefaultCallbacks();

            _.defaults(scope, callbacks);

            var controller = function () {
                _.assign(this, scope);
            };

            return $uibModal.open({
                animation: true,
                template: template,
                controller: controller,
                controllerAs: 'vm'
            });
        }

        function getDefaultCallbacks() {
            var callbacks = {
                onFailure: function(){},
                onSubmit: service.close
            };

            return callbacks;
        }
    }

}());
