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
        'researchEntityService',
        '$scope',
        'ModalService'
    ];

    function scientillaTagForm(Prototyper, EventsService, context, researchEntityService, $scope, ModalService) {
        var vm = this;

        var researchEntity = context.getResearchEntity();
        let originalTags = {};
        let closed = false;

        vm.getTagsQuery = getTagsQuery;
        vm.tagLabelContructor = tagLabelContructor;
        vm.save = save;
        vm.close = close;

        vm.$onInit = function () {
            vm.tags = researchEntity.getTagsByDocument(vm.document) || [];
            originalTags = angular.copy(vm.tags);

            $scope.$on('modal.closing', function (event, reason) {
                if (!closed) {
                    close(event);
                }
            });
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
            researchEntityService.setPrivateTags(researchEntity, vm.document, vm.tags.map(t => t.value))
                .then(function () {
                    EventsService.publish(EventsService.DOCUMENT_PRIVATE_TAGS_UPDATED, vm.document);
                });

            if (_.isFunction(vm.onSubmit()))
                vm.onSubmit()(0);
        }

        function close(event = false) {
            if (!_.isFunction(vm.closeFn())) {
                return Promise.reject('no close function');
            }

            if (!closed) {
                // Check if the tags are the same as the original ones
                if (angular.toJson(originalTags) === angular.toJson(vm.tags)) {
                    closed = true;
                    if (!event) {
                        return vm.closeFn()();
                    }
                } else {
                    if (event) {
                        // Prevent modal from closing
                        event.preventDefault();
                    }

                    // Show the unsaved data modal
                    ModalService
                        .multipleChoiceConfirm('Unsaved data',
                            `There is unsaved data in the form. Do you want to go back and save this data?`,
                            ['Yes', 'No'],
                            false)
                        .then(function (buttonIndex) {
                            switch (buttonIndex) {
                                case 0:
                                    break;
                                case 1:
                                    vm.tags = angular.copy(originalTags);
                                    closed = true;
                                    return vm.closeFn()();
                                default:
                                    break;
                            }
                        });
                }
            }
        }
    }

})();