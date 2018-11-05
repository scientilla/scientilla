(function () {
    'use strict';

    angular.module('documents')
        .component('scientillaDocumentDetails', {
            templateUrl: 'partials/scientilla-document-details.html',
            controller: scientillaDocumentsDetails,
            controllerAs: 'vm',
            bindings: {
                document: "<"
            }
        });

    scientillaDocumentsDetails.$inject = [
        'documentTypes',
        'documentSourceTypes'
    ];

    function scientillaDocumentsDetails(documentTypes, documentSourceTypes) {
        const vm = this;

        vm.collapsed = true;

        vm.$onInit = function () {
            vm.type = _.get(documentTypes.find(dt => dt.key === vm.document.type), 'label');
            vm.sourceType = _.get(documentSourceTypes.find(dt => dt.id === vm.document.sourceType), 'label');

            vm.bibliographicInformations = [];

            if (vm.document.volume)
                vm.bibliographicInformations.push('vol. ' + vm.document.volume);

            if (vm.document.issue)
                vm.bibliographicInformations.push('issue ' + vm.document.issue);

            if (vm.document.articleNumber)
                vm.bibliographicInformations.push('ar. n. ' + vm.document.articleNumber);

            if (vm.document.pages)
                vm.bibliographicInformations.push('pp. ' + vm.document.pages);
        };
    }

})();