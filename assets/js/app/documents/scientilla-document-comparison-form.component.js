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
                document: "<",
                duplicates: "<",
                category: "<",
                onFailure: "&",
                onSubmit: "&"
            }
        });


    DocumentComparisonController.$inject = [
        'context',
        'documentTypes',
        'documentSourceTypes',
        'Notification',
        '$timeout',
        '$window',
        'documentActions',
        'documentCategories'
    ];

    function DocumentComparisonController(context, documentTypes, documentSourceTypes, Notification, $timeout, $window, documentActions, documentCategories) {
        const vm = this;
        vm.keepDocument = keepDocument;
        vm.useDuplicate = useDuplicate;
        vm.deleteDraft = deleteDraft;
        vm.discardSuggestedDocument = discardSuggestedDocument;
        vm.unverifyVerfiedDocument = unverifyVerfiedDocument;
        vm.markAllAsNotDuplicate = markAllAsNotDuplicate;

        vm.getVerifiedNamesHTML = getVerifiedNamesHTML;
        vm.cancel = cancel;
        vm.getVerifiedCount = getVerifiedCount;
        vm.compare = compare;
        vm.getSourceType = getSourceType;
        vm.getType = getType;
        vm.differentFields = [];
        vm.selectedDuplicate = {};
        vm.mouseover = mouseover;
        vm.documentCategories = documentCategories;

        vm.scopusIdDeletedMessage = '- <b class="text-danger">This ID is not available in Scopus - IT IS STRONGLY ADVISED TO CHOOSE A VERSION WITH A WORKING SCOPUS ID NOT TO MISS NEW CITATIONS!</b>';

        vm.subResearchEntity = context.getSubResearchEntity();
        vm.$onInit = function () {
            for (const [index, duplicate] of vm.duplicates.entries()) {
                vm.duplicates[index] = duplicate;
            }

            if (vm.duplicates.length > 2) {
                var warning =  'Please notify that there are ' + vm.duplicates.length;
                warning += ' duplicates.';

                Notification.warning(warning);
            }

            if (vm.duplicates.length > 0) {
                compare(vm.duplicates[0]);

                vm.duplicates.forEach(d => {
                    d.isReplaceable = isReplaceable(d);
                });
            }
        };

        vm.collapsed = true;
        vm.isReplaceable = false;
        vm.firstDuplicateIsSelected = false;

        function keepDocument() {
            executeOnSubmit({option: documentActions.COMPARE.KEEP_DOCUMENT});
        }

        function useDuplicate(duplicate = false) {
            if (!duplicate) {
                duplicate = vm.selectedDuplicate;
            }

            executeOnSubmit({option: documentActions.COMPARE.USE_DUPLICATE, duplicate: duplicate});
        }

        function deleteDraft() {
            executeOnSubmit({option: documentActions.COMPARE.DELETE_DRAFT});
        }

        function discardSuggestedDocument() {
            executeOnSubmit({option: documentActions.COMPARE.DISCARD_SUGGESTED_DOCUMENT});
        }

        function unverifyVerfiedDocument() {
            executeOnSubmit({option: documentActions.COMPARE.UNVERIFY_VERIFIED_DOCUMENT});
        }

        function markAllAsNotDuplicate() {
            executeOnSubmit({option: documentActions.COMPARE.MARK_ALL_AS_NOT_DUPLICATE});
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
                .concat(document.authors.map(a => '- ' + a.getDisplayName()));
        }

        function compare(duplicate) {
            function isEqualArrayBy(documentInstitutes, duplicateInstitutes) {
                return _.isEmpty(_.differenceBy(documentInstitutes, duplicateInstitutes, 'id')) &&
                    _.isEmpty(_.differenceBy(duplicateInstitutes, documentInstitutes, 'id'));
            }

            vm.selectedDuplicate = duplicate;

            const comparisonFields = vm.document.fields;
            const differentFields = comparisonFields.filter(field => {
                if (vm.document[field] || duplicate[field]) {
                    if (_.isObject(vm.document[field]) && _.isObject(duplicate[field])) {
                        if (vm.document[field].id !== duplicate[field].id) {
                            return true;
                        }
                    }

                    if (!_.isObject(vm.document[field]) && !_.isObject(duplicate[field])) {
                        if (vm.document[field] !== duplicate[field]) {
                            return true;
                        }
                    }
                }

                return false;
            });
            const documentInstitutes = _.sortBy(vm.document.institutes, 'id');
            const duplicateInstitutes = _.sortBy(duplicate.institutes, 'id');

            if (!isEqualArrayBy(documentInstitutes, duplicateInstitutes, 'id')) {
                differentFields.push('institutes');
            }

            vm.differentFields = differentFields;
        }

        function getSourceType(document) {
            return _.get(documentSourceTypes.find(dt => dt.id === document.sourceType), 'label');
        }

        function getType(document) {
            return _.get(documentTypes.find(dt => dt.key === document.type), 'label');
        }

        function isReplaceable(duplicate) {
            let replaceable = true;

            const duplicateIDsOfDocument = vm.document.duplicates.filter(d => d.kind === 'v')
                .map(d => d.duplicate === vm.document.id ? d.document : d.duplicate);

            const duplicateIDsOfDuplicate = duplicate.duplicates.filter(d => d.kind === 'v')
                .map(d => d.duplicate === duplicate.id ? d.document : d.duplicate)
                .filter(d => d !== vm.document.id);

            duplicateIDsOfDocument.forEach(id => {
                if (duplicateIDsOfDuplicate.includes(id)) {
                    replaceable = false;
                }
            });

            return replaceable;
        }

        vm.positionTop = 0;
        let tmpDuplicate = false;

        function mouseover(duplicate, event) {
            if ($window.innerWidth > 767) {
                $timeout(function () {
                    if (duplicate !== tmpDuplicate) {
                        tmpDuplicate = duplicate;

                        vm.isReplaceable = isReplaceable(duplicate);
                        vm.firstDuplicateIsSelected = true;
                        vm.positionTop = event.currentTarget.offsetTop;

                        compare(duplicate);
                    }
                }, 50);
            } else {
                vm.positionTop = 0;
            }
        }
    }
})
();
