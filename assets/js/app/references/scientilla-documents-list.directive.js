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
        'researchEntityService',
        'yearsInterval'
    ];

    function scientillaDocumentsListController($rootScope, researchEntityService, yearsInterval) {
        var vm = this;
        vm.documents = [];

        vm.deleteDocument = deleteDocument;
        vm.createNewUrl = vm.researchEntity.getNewReferenceUrl();
        
        vm.getData = getDocuments;
        vm.onFilter = refreshList;

        var years_value = _.map(yearsInterval, function (y) {
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
            $rootScope.$on('draft.verified', updateList);
        }

        function getDocuments(q) {

            query = q;

            return researchEntityService.getDocuments(vm.researchEntity, query);
        }

        function deleteDocument(reference) {
            vm.researchEntity
                    .one('references', reference.id)
                    .remove()
                    .then(updateList);
        }

        function refreshList(documents) {
            Scientilla.toDocumentsCollection(documents);
            vm.documents = documents;
        }

        //private
        function updateList() {
            getDocuments(query).then(refreshList);
        }
    }

})();