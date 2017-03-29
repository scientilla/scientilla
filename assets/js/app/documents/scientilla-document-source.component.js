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

    scientillaDocumentSource.$inject = [
        'DocumentTypesService'
    ];

    function scientillaDocumentSource(DocumentTypesService) {
        var vm = this;


        var iconClasses = {
            'journal': 'fa fa-lg fa-fw fa-file-text-o',
            'conference': 'fa fa-lg fa-fw fa-comment-o',
            'book': 'fa fa-lg fa-fw fa-book',
            'bookseries': 'fa fa-lg fa-fw fa-book',
            'report': 'fa fa-lg fa-fw fa-address-card-o',
            'invited_talk': 'fa fa-lg fa-fw fa-microphone',
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