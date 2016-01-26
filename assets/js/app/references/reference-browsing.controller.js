(function () {
    angular
            .module('references')
            .controller('ReferenceBrowsingController', ReferenceBrowsingController);

    ReferenceBrowsingController.$inject = [
        'researchEntity'
    ];

    function ReferenceBrowsingController(researchEntity) {
        var vm = this;
        
        vm.researchEntity = researchEntity;
        vm.editUrl = vm.researchEntity.getProfileUrl();
    }
})();
