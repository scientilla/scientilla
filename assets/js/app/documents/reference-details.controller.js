(function () {
    angular
            .module('references')
            .controller('ReferenceDetailsController', ReferenceDetailsController);

    ReferenceDetailsController.$inject = [
        'reference'
    ];

    function ReferenceDetailsController(reference) {
        var vm = this;        
        vm.reference = reference;

        activate();

        function activate() {
        }
    }
})();
