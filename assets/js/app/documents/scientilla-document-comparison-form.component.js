/* global Scientilla */

(function () {
    "use strict";

    angular
        .module('users')
        .component('scientillaDocumentComparisonForm', {
            templateUrl: 'partials/scientilla-document-comparison-form.html',
            controller: DocumentComparisonController,
            controllerAs: 'vm',
            bindings: {
                document1: "<",
                document2: "<",
                onFailure: "&",
                onSubmit: "&"
            }
        });


    DocumentComparisonController.$inject = [
        'AuthService',
        'researchEntityService',
        'context',
        'documentTypes',
        'documentSourceTypes'
    ];

    function DocumentComparisonController(AuthService, researchEntityService, context, documentTypes, documentSourceTypes) {
        var vm = this;
        vm.keepDocument1 = keepDocument1;
        vm.keepDocument2 = keepDocument2;
        vm.documentsNotDuplicate = documentsNotDuplicate;
        vm.cancel = cancel;

        var user = AuthService.user;

        const DocumentService = context.getDocumentService();
        const researchEntity = context.getResearchEntity();
        vm.$onInit = function () {vm.differentFields = getDifferentFields();
        };

        function getDifferentFields() {
            vm.type1 = _.get(documentTypes.find(dt => dt.key === vm.document1.type), 'label');
            vm.sourceType1 = _.get(documentSourceTypes.find(dt => dt.id === vm.document1.sourceType), 'label');

            vm.type2 = _.get(documentTypes.find(dt => dt.key === vm.document2.type), 'label');
            vm.sourceType2 = _.get(documentSourceTypes.find(dt => dt.id === vm.document2.sourceType), 'label');

            return vm.document1.fields.filter(f =>
                (vm.document1[f] || vm.document2[f]) &&
                (
                    (_.isObject(vm.document1[f]) && _.isObject(vm.document2[f]) && vm.document1[f].id !== vm.document2[f].id) ||
                    (!_.isObject(vm.document1[f]) && !_.isObject(vm.document2[f]) && vm.document1[f] !== vm.document2[f])
                )
            );
        }

        function keepDocument1() {
            executeOnSubmit(1);
        }

        function keepDocument2() {
            executeOnSubmit(2);
        }

        function documentsNotDuplicate() {
            executeOnSubmit(3);
        }

        function cancel() {
            executeOnSubmit(0);
        }

        function executeOnSubmit(i) {
            if (_.isFunction(vm.onSubmit()))
                vm.onSubmit()(i);
        }

        function executeOnFailure() {
            if (_.isFunction(vm.onFailure()))
                vm.onFailure()();
        }

    }
})
();
