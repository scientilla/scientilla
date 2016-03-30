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
        vm.getDocuments = getDocuments;
        vm.createNewUrl = vm.researchEntity.getNewReferenceUrl();

        vm.totalItems = 0;

        vm.onFilter = onFilter;


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

        vm.lastQuery = {};

        activate();

        function activate() {
            $rootScope.$on('draft.verified', onVerify);
        }

        function getDocuments(query) {

            vm.lastQuery = query;

            return researchEntityService.getDocuments(vm.researchEntity, query);
        }

        function deleteDocument(reference) {
            vm.researchEntity.one('references', reference.id).remove()
                    .then(function () {
                        getDocuments(vm.lastQuery);
                    });
        }

        function verifyDocument(reference) {
            return vm.researchEntity.one('references', reference.id).customPUT({}, 'verified').then(function (r) {
                reference.draft = false;
                reference.status = Scientilla.reference.VERIFIED;
            });
        }

        function onFilter(documents) {
            Scientilla.toDocumentsCollection(documents);
            vm.documents = documents;
        }
        
        //private
        function onVerify(){
            getDocuments(vm.lastQuery);
        }
    }

})();