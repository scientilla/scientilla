(function () {
    angular
            .module('references')
            .controller('ReferenceFormController', ReferenceFormController);

    ReferenceFormController.$inject = [
        'document',
        'ContextService',
        '$uibModalInstance'
    ];

    function ReferenceFormController(document, ContextService, $uibModalInstance) {
        var vm = this;
        vm.document = document;
        vm.researchEntity = ContextService.getResearchEntity();
        vm.closeDialog = function() {$uibModalInstance.dismiss('cancel');};
    }
})();