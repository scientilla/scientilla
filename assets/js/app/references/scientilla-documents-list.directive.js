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
        vm.getDocuments = getDocuments;
        vm.createNewUrl = vm.researchEntity.getNewReferenceUrl();

        vm.totalItems = 0;

        vm.onFilter = refreshList;


        var years = _.range(new Date().getFullYear(), 2005, -1);
        var years_value = _.map(years, function(y){
            return {value: y + '', label: y + ''};
        });

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
                values: years_value,
                allowBlank: true,
                preventDefaultOption: true,
                matchColumn: 'year',
                matchRule: '<='
            },
            minYear: {
                inputType: 'select',
                label: 'Year to',
                values: years_value,
                allowBlank: true,
                preventDefaultOption: true,
                matchColumn: 'year',
                matchRule: '>='
            }
        };

        var query = {};

        activate();

        function activate() {
            $rootScope.$on('draft.verified', onVerify);
        }

        function getDocuments(q) {

            query = q;

            return researchEntityService.getDocuments(vm.researchEntity, query);
        }

        function deleteDocument(reference) {
            vm.researchEntity.one('references', reference.id).remove()
                    .then(function () {
                        getDocuments(query).then(refreshList);
                    });
        }

        function refreshList(documents) {
            Scientilla.toDocumentsCollection(documents);
            vm.documents = documents;
        }
        
        //private
        function onVerify(){
            getDocuments(query).then(getDocuments);
        }
    }

})();