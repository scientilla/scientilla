(function () {
    'use strict';

    angular.module('references')
            .directive('scientillaDocumentsList', scientillaDocumentsList);

    function scientillaDocumentsList() {
        return {
            restrict: 'E',
            templateUrl: 'partials/scientillaDocumentsList.html',
            controller: scientillaDocumentsListController,
            controllerAs: 'vm',
            scope: {},
            bindToController: {
                researchEntity: "="
            }
        };
    }

    scientillaDocumentsListController.$inject = [
        '$rootScope',
        'researchEntityService'
    ];

    function scientillaDocumentsListController($rootScope, researchEntityService) {
        var vm = this;
        vm.documents = [];

        vm.deleteDocument = deleteDocument;
        vm.verifyDocument = verifyDocument;
        vm.createNewUrl = vm.researchEntity.getNewReferenceUrl();


        vm.onSearch = onSearch;


        vm.years = [];

        //TODO find better solution
        for (var i = new Date().getFullYear(); i >= 2005; i--)
            vm.years.push({value: i + '', label: i + ''});

        vm.searchForm = {
            title: {
                inputType: 'text',
                label: 'Title',
                matchColumn: 'title',
                matchRule: 'contains'
            },
            author: {
                inputType: 'text',
                label: 'Author',
                matchColumn: 'authors',
                matchRule: 'contains'
            },
            maxYear: {
                inputType: 'select',
                label: 'Year from',
                values: vm.years,
                allowBlank: true,
                preventDefaultOption: true,
                matchColumn: 'year',
                matchRule: '<='
            },
            minYear: {
                inputType: 'select',
                label: 'Year to',
                values: vm.years,
                allowBlank: true,
                preventDefaultOption: true,
                matchColumn: 'year',
                matchRule: '>='
            }
        };

        activate();

        function activate() {
            getDocuments();
            $rootScope.$on('draft.verified', getDocuments);
        }

        function getDocuments(params) {

            researchEntityService
                    .getDocuments(
                            vm.researchEntity,
                            params)
                    .then(function (documents) {
                        Scientilla.toDocumentsCollection(documents);
                        vm.documents = documents;
                    });
        }

        function deleteDocument(reference) {
            vm.researchEntity.one('references', reference.id).remove()
                    .then(function () {
                        getDocuments();
                    });
        }

        function verifyDocument(reference) {
            return vm.researchEntity.one('references', reference.id).customPUT({}, 'verified').then(function (r) {
                reference.draft = false;
                reference.status = Scientilla.reference.VERIFIED;
            });
        }

        function onSearch(where) {

            getDocuments({
                where: where
            });
        }
    }

})();