(function () {
    'use strict';

    angular.module('documents')
        .component('scientillaTagForm', {
            templateUrl: 'partials/scientilla-tag-form.html',
            controller: scientillaTagForm,
            controllerAs: 'vm',
            bindings: {
                document: "<",
                onSubmit: "&",
                closeFn: "&"
            }
        });

    scientillaTagForm.$inject = [
        'Prototyper',
        'EventsService',
        'context',
        'researchEntityService'
    ];

    function scientillaTagForm(Prototyper, EventsService, context, researchEntityService) {
        var vm = this;

        var researchEntity = context.getResearchEntity();

        vm.getTagsQuery = getTagsQuery;
        vm.tagLabelContructor = tagLabelContructor;
        vm.save = save;
        vm.close = close;

        vm.$onInit = function () {
            vm.tags = researchEntity.getTagsByDocument(vm.document) || [];
        };

        vm.$onDestroy = function () {
        };

        function getTagsQuery(searchText) {
            var qs = {where: {value: {contains: searchText}}};
            var model = 'taglabels';
            return {model: model, qs: qs};
        }

        function tagLabelContructor(value) {
            return Prototyper.toTagLabelModel({value: value});
        }

        function save() {
            researchEntityService.setPrivateTags(researchEntity, vm.document, vm.tags.map(t => t.value))
                .then(function () {
                    EventsService.publish(EventsService.DOCUMENT_PRIVATE_TAGS_UPDATED, vm.document);
                });

            if (_.isFunction(vm.onSubmit()))
                vm.onSubmit()(0);
        }

        function close() {
            if (_.isFunction(vm.closeFn()))
                return vm.closeFn()();
            return Promise.reject('no close function');
        }
    }

})();