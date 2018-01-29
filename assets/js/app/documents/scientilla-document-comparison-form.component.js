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
        vm.getVerifiedNamesHTML = getVerifiedNamesHTML;
        vm.cancel = cancel;

        var user = AuthService.user;

        const DocumentService = context.getDocumentService();
        vm.researchEntity = context.getResearchEntity();
        vm.$onInit = function () {
            vm.differentFields = getDifferentFields();
            vm.verifiedCount1 = getVerifiedCount(vm.document1);
            vm.verifiedCount2 = getVerifiedCount(vm.document2);
        };

        function getDifferentFields() {
            function isEqualArrayBy(a1, a2, index) {
                return _.isEmpty(_.differenceBy(doc1Institutes, doc2Institutes, 'id')) &&
                    _.isEmpty(_.differenceBy(doc2Institutes, doc1Institutes, 'id'));
            }

            vm.type1 = _.get(documentTypes.find(dt => dt.key === vm.document1.type), 'label');
            vm.sourceType1 = _.get(documentSourceTypes.find(dt => dt.id === vm.document1.sourceType), 'label');

            vm.type2 = _.get(documentTypes.find(dt => dt.key === vm.document2.type), 'label');
            vm.sourceType2 = _.get(documentSourceTypes.find(dt => dt.id === vm.document2.sourceType), 'label');

            const comparisonFields = vm.document1.fields;
            const differentFields = comparisonFields.filter(f =>
                (vm.document1[f] || vm.document2[f]) &&
                (
                    (_.isObject(vm.document1[f]) && _.isObject(vm.document2[f]) && vm.document1[f].id !== vm.document2[f].id) ||
                    (!_.isObject(vm.document1[f]) && !_.isObject(vm.document2[f]) && vm.document1[f] !== vm.document2[f])
                )
            );
            const doc1Institutes = _.sortBy(vm.document1.institutes, 'id');
            const doc2Institutes = _.sortBy(vm.document2.institutes, 'id');
            if (!isEqualArrayBy(doc1Institutes, doc2Institutes, 'id')) {
                differentFields.push('institutes');
            }
            return differentFields;
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


        function getVerifiedCount(document) {
            return document.authorships.filter(a => a.researchEntity)
                .concat(document.groupAuthorships).length;
        }

        function getVerifiedNamesHTML(document) {
            const verifiedNames = getVerifiedNames(document);
            if (!verifiedNames.length)
                return 'Nobody has verified this document yet';

            return '<p>This document is verified by:</p><p>' + verifiedNames.join('<br>') + '</p>';
        }

        function getVerifiedNames(document) {
            return document.groups.map(g => '- <b>' + g.name + '</b>')
                .concat(document.authors.map(a => '- ' + a.name + ' ' + a.surname));
        }

    }
})
();
