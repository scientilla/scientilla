(function () {
    angular
            .module('references')
            .controller('ReferenceBrowsingController', ReferenceBrowsingController);

    ReferenceBrowsingController.$inject = [
        'researchEntity',
        'ContextService',
        '$mdDialog'
    ];

    function ReferenceBrowsingController(researchEntity, ContextService, $mdDialog) {
        var vm = this;

        vm.researchEntity = researchEntity;
        ContextService.setResearchEntity(researchEntity);
        vm.editUrl = vm.researchEntity.getProfileUrl();
        vm.createNewDocument = createNewDocument;

        function createNewDocument($event) {
            var draft = researchEntity.getNewDocument();
            researchEntity.all('drafts').post(draft).then(function (draft) {
                $mdDialog.show({
                    controller: "ReferenceFormController",
                    templateUrl: "partials/reference-form.html",
                    controllerAs: "vm",
                    parent: angular.element(document.body),
                    targetEvent: $event,
                    locals: {
                        document: draft.clone()
                    },
                    fullscreen: true,
                    clickOutsideToClose: true
                });
            });
        }
    }
})();
