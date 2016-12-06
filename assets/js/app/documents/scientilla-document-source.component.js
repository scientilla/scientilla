(function () {
    'use strict';

    angular.module('documents')
        .component('scientillaDocumentSource', {
            templateUrl: 'partials/scientillaDocumentSource.html',
            controller: scientillaDocumentSource,
            controllerAs: 'vm',
            bindings: {
                document: "<"
            }
        });

    scientillaDocumentSource.$inject = [];

    function scientillaDocumentSource() {
        var vm = this;


        var iconClasses = {
            'journal': 'fa fa-lg fa-fw fa-file-text-o',
            'conference': 'fa fa-lg fa-fw fa-comment-o',
            'book': 'fa fa-lg fa-fw fa-book',
            'bookseries': 'fa fa-lg fa-fw fa-book',
            'report': 'fa fa-lg fa-fw fa-address-card-o',
        };

        vm.$onInit = function () {

            if (vm.document.source)
                vm.iconClass = iconClasses[vm.document.source.type];

        };
    }

})();