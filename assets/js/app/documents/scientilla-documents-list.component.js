/* global Scientilla */

(function () {
    'use strict';


    angular.module('documents')
        .component('scientillaDocumentsList', {
            templateUrl: 'partials/scientilla-documents-list.html',
            controller: scientillaDocumentsList,
            controllerAs: 'vm',
            bindings: {
                category: '<',
                researchEntity: '<',
                section: '<',
                active: '<?'
            }
        });


    scientillaDocumentsList.$inject = [
        'context',
        'researchEntityService',
        'EventsService',
        'documentListSections',
        'AuthService',
        '$element',
        '$scope'
    ];

    function scientillaDocumentsList(
        context,
        researchEntityService,
        EventsService,
        documentListSections,
        AuthService,
        $element,
        $scope
    ) {
        const vm = this;

        const DocumentsService = context.getDocumentService();

        vm.name = 'documents-list';
        vm.shouldBeReloaded = true;

        vm.documents = [];

        vm.unverifyDocument = DocumentsService.unverifyDocument;
        vm.compareDocuments = DocumentsService.compareDocuments;
        vm.exportCsvDocuments = documents => DocumentsService.exportDocuments(documents, 'csv');
        vm.exportExcelDocuments = documents => DocumentsService.exportDocuments(documents, 'excel');
        vm.exportBibtexDocuments = documents => DocumentsService.exportDocuments(documents, 'bibtex');

        vm.onFilter = onFilter;

        let query = {};
        let activeWatcher;

        vm.loadDocuments = true;

        vm.$onInit = () => {
            const registerTab = requireParentMethod($element, 'registerTab');
            registerTab(vm);

            if (_.has(vm, 'active')) {
                vm.loadDocuments = angular.copy(vm.active);

                activeWatcher = $scope.$watch('vm.active', () => {
                    vm.loadDocuments = angular.copy(vm.active);

                    if (vm.loadDocuments) {
                        $scope.$broadcast('filter');
                    } else {
                        vm.documents = [];
                    }
                });
            }
        };

        vm.$onDestroy = () => {
            const unregisterTab = requireParentMethod($element, 'unregisterTab');
            unregisterTab(vm);

            EventsService.unsubscribeAll(vm);

            if (_.isFunction(activeWatcher)) {
                activeWatcher();
            }
        };

        vm.reload = function () {
            EventsService.unsubscribeAll(vm);

            vm.editable = vm.section === documentListSections.VERIFIED && !AuthService.user.isViewOnly();

            EventsService.subscribeAll(vm, [
                EventsService.DRAFT_VERIFIED,
                EventsService.DOCUMENT_VERIFIED,
                EventsService.DOCUMENT_UNVERIFIED,
                EventsService.DOCUMENT_PRIVATE_TAGS_UPDATED,
                EventsService.DOCUMENT_AUTORSHIP_PRIVACY_UPDATED,
                EventsService.DOCUMENT_AUTORSHIP_FAVORITE_UPDATED,
                EventsService.DOCUMENT_COMPARE
            ], updateList);
        };

        function updateList() {
            onFilter(query);
        }

        function onFilter(q) {
            const favorites = q.where.favorites;
            delete q.where.favorites;
            query = q;

            return researchEntityService.getDocuments(vm.researchEntity, query, favorites)
                .then(function (documents) {
                    vm.documents = documents;
                });
        }
    }

})();
