(function () {
    'use strict';

    angular.module('documents')
        .component('scientillaTagForm', {
            templateUrl: 'partials/scientillaTagForm.html',
            controller: scientillaTagForm,
            controllerAs: 'vm',
            bindings: {
                document: "<",
                onSubmit: "&",
                closeFn: "&"
            }
        });

    scientillaTagForm.$inject = [
        'Restangular',
        'Prototyper',
        'EventsService',
        'context'
    ];

    function scientillaTagForm(Restangular, Prototyper, EventsService, context) {
        var vm = this;

        var researchEntity = context.getResearchEntity();

        vm.getTagsQuery = getTagsQuery;
        vm.tagLabelContructor = tagLabelContructor;
        vm.save = save;
        vm.close = close;

        vm.$onInit = function () {
            vm.tags = vm.document.getUsersTagByUser(researchEntity) || [];
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
            var tags = vm.tags.map(t => t.value);

            Restangular.one('users', researchEntity.id)
                .one('documents', vm.document.id)
                .post('tags', {tags: tags})
                .then(function(){
                    EventsService.publish(EventsService.DOCUMENT_USER_TAGS_UPDATED, vm.document);
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