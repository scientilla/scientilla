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
        '$mdDialog'
    ];

    function scientillaDrafsListController($mdDialog) {
        var vm = this;

        vm.deleteDocument = deleteDocument;
        vm.verifyDocument = verifyDocument;
        vm.createNewUrl = vm.researchEntity.getNewReferenceUrl();
        vm.editUrl = vm.researchEntity.getProfileUrl();
        vm.openEditPopup = openEditPopup;

        activate();

        function activate() {
            getDrafts();
        }

        function getDrafts() {
            vm.researchEntity.getList('drafts')
                    .then(function (drafts) {
                        Scientilla.toDocumentsCollection(drafts);
                        vm.drafts = drafts;
                    });
        }

        function deleteDocument(draft) {
            vm.researchEntity.one('drafts', draft.id).remove()
                    .then(function () {
                        _.remove(vm.drafts, draft);
                    });
        }

        function verifyDocument(reference) {
            return vm.researchEntity.one('drafts', reference.id).customPUT({}, 'verified')
                    .then(function (r) {
                        getDrafts();
                    });
        }

        function openEditPopup($event, document) {
            $mdDialog.show({
                controller: "ReferenceFormController",
                templateUrl: "partials/reference-form.html",
                controllerAs: "vm",
                parent: angular.element(document.body),
                targetEvent: $event,
                locals: {
                    document: document.clone()
                },
                fullscreen: true,
                clickOutsideToClose: true
            }).then(function () {
                getDrafts();
            });
        }
    }

})();