(function () {
    'use strict';

    angular.module('references')
            .directive('scientillaDraftsList', scientillaDraftsList);

    function scientillaDraftsList() {
        return {
            restrict: 'E',
            templateUrl: 'partials/scientillaDraftsList.html',
            controller: scientillaDrafsListController,
            controllerAs: 'vm',
            scope: {},
            bindToController: {
                researchEntity: "="
            }
        };
    }

    scientillaDrafsListController.$inject = [
        'ModalService',
        '$rootScope',
        'researchEntityService',
        'yearsInterval'
    ];

    function scientillaDrafsListController(ModalService, $rootScope, researchEntityService, yearsInterval) {
        var vm = this;

        vm.getData = getDrafts;
        vm.onFilter = refreshList;

        vm.deleteDocument = deleteDocument;
        vm.verifyDocument = verifyDocument;
        vm.createNewUrl = vm.researchEntity.getNewReferenceUrl();
        vm.editUrl = vm.researchEntity.getProfileUrl();
        vm.openEditPopup = openEditPopup;

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
            $rootScope.$on("draft.created", updateList);
        }



        function getDrafts(q) {

            query = q;

            return researchEntityService.getDrafts(vm.researchEntity, q);
        }

        function deleteDocument(draft) {
            vm.researchEntity.one('drafts', draft.id).remove()
                    .then(function () {
                        updateList();
                    });
        }

        function verifyDocument(reference) {
            return vm.researchEntity.one('drafts', reference.id).customPUT({}, 'verified')
                    .then(function (draft) {
                        $rootScope.$broadcast("draft.verified", draft);
                        updateList();
                    });
        }

        function openEditPopup(document) {

            ModalService
                    .openScientillaDocumentForm(document.clone(), vm.researchEntity)
                    .finally(function () {
                        updateList();
                    });
        }

        function refreshList(drafts) {
            Scientilla.toDocumentsCollection(drafts);
            vm.drafts = drafts;
        }
        
        // private
        function updateList(){
            getDrafts(query).then(refreshList);
        }
    }

})();