(function () {
    'use strict';

    angular.module('documents')
        .component('scientillaDocumentSource', {
            templateUrl: 'partials/scientilla-document-source.html',
            controller: scientillaDocumentSource,
            controllerAs: 'vm',
            bindings: {
                document: "<"
            }
        });

    scientillaDocumentSource.$inject = [
        'DocumentTypesService'
    ];

    function scientillaDocumentSource(DocumentTypesService) {
        var vm = this;

        var iconClasses = {
            'journal': 'far fa-file-alt',
            'conference': 'far fa-comment',
            'book': 'fas fa-book',
            'bookseries': 'fas fa-book',
            'eprint_archive': 'fas fa-archive',
            'report': 'far fa-address-card',
            'invited_talk': 'fas fa-microphone',
        };

        vm.$onInit = function () {
            var key = vm.document.type === 'invited_talk' ? vm.document.type : vm.document.sourceType;
            vm.iconClass = iconClasses[key];
            if (key)
                vm.iconTitle = key === 'invited_talk' ?
                    _.find(DocumentTypesService.getDocumentTypes(), {key: key}).label :
                    _.find(DocumentTypesService.getSourceTypes(), {id: key}).label;
        };
    }

})();