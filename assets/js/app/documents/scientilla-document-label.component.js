(function () {
    'use strict';

    angular.module('documents')
            .component('scientillaDocumentLabel', {
                templateUrl: 'partials/scientilla-document-label.html',
                controller: scientillaDocumentLabel,
                controllerAs: 'vm',
                bindings: {
                    label: "<"
                }
            });

    function scientillaDocumentLabel() {
        var vm = this;

        vm.badges = [];
        vm.badges.external = 'success';
        vm.badges.new = 'success';
        vm.badges.discarded = 'error';
        vm.badges.duplicate = 'warning';
        vm.badges['already verified'] = 'warning';
        vm.badges['already in drafts'] = 'warning';
        vm.badges.unverifying = 'secondary';

        activate();

        function activate() {

        }
    }

})();