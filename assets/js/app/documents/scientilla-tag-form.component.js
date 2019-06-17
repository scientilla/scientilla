/* global angular */

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
                checkAndClose: "&"
            }
        });

    scientillaTagForm.$inject = [
        'Prototyper',
        'EventsService',
        'context',
        'researchEntityService',
        '$scope',
        'ModalService'
    ];

    function scientillaTagForm(Prototyper, EventsService, context, researchEntityService, $scope, ModalService) {
        const vm = this;

        const subResearchEntity = context.getSubResearchEntity();
        let originalTags = '';

        vm.getTagsQuery = getTagsQuery;
        vm.tagLabelContructor = tagLabelContructor;
        vm.save = save;
        vm.close = close;

        vm.$onInit = function () {
            vm.tags = subResearchEntity.getTagsByDocument(vm.document) || [];
            originalTags = angular.toJson(vm.tags);
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
            originalTags = angular.copy(vm.tags);
            researchEntityService.setPrivateTags(subResearchEntity, vm.document, vm.tags.map(t => t.value))
                .then(function () {
                    EventsService.publish(EventsService.DOCUMENT_PRIVATE_TAGS_UPDATED, vm.document);
                });

            if (_.isFunction(vm.onSubmit()))
                vm.onSubmit()(0);
        }

        function close() {
            vm.checkAndClose()(() => originalTags === angular.toJson(vm.tags));
        }
    }

})();