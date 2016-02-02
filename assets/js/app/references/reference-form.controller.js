(function () {
    angular
            .module('references')
            .controller('ReferenceFormController', ReferenceFormController);

    ReferenceFormController.$inject = [
        'document',
        'ContextService',
        '$mdDialog'
    ];

    function ReferenceFormController(document, ContextService, $mdDialog) {
        var vm = this;
        vm.document = document;
        vm.researchEntity = ContextService.getResearchEntity();
        vm.closeDialog = function() {$mdDialog.hide();};
    }
})();