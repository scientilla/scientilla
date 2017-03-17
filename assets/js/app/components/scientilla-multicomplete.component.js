(function () {
    'use strict';

    angular.module('components')
        .component('scientillaMulticomplete', {
            templateUrl: 'partials/scientillaMulticomplete.html',
            controller: scientillaMulticompleteController,
            controllerAs: 'vm',
            bindings: {
                items: "=",
                query: "&",
                filter: "&",
                transform: "&",
                title: "@",
                suggestedItems: "=",
                addNotFound: "<?",
                itemContructor: "&?"
            }
        });


    scientillaMulticompleteController.$inject = [
        'Restangular'
    ];

    function scientillaMulticompleteController(Restangular) {
        var vm = this;
        vm.addItem = addItem;
        vm.search = search;
        vm.removeItem = removeItem;
        vm.onSelect = onSelect;

        function search(searchText) {
            var info = this.query()(searchText);
            var filter = this.filter();
            info.qs.limit = info.qs.limit || 10;
            return Restangular.all(info.model).getList(info.qs)
                .then(function (result) {
                    var displayItems = result;
                    var elementsToDiscard;
                    if (_.isFunction(filter))
                        elementsToDiscard = filter();
                    if (_.isArray(filter))
                        elementsToDiscard = filter;
                    if (_.isArray(elementsToDiscard))
                        displayItems = filterOutUsedElemsById(displayItems, elementsToDiscard);
                    if (!displayItems.length && vm.addNotFound)
                        displayItems.push(vm.itemContructor()(searchText));
                    return displayItems;
                });
        }

        function addItem(item) {
            if (!item)
                return;

            if (_.isArray(vm.suggestedItems))
                _.remove(vm.suggestedItems, item);
            var newItem;
            var transform = this.transform();
            if (_.isFunction(transform))
                newItem = transform(item);
            else
                newItem = item;
            vm.items.push(newItem);
            vm.searchText = "";
        }

        function filterOutUsedElemsById(toBeFiltered, filter) {
            var alreadyUsedIds = _.map(filter, 'id');
            var items = _.filter(toBeFiltered, function (i) {
                return !_.includes(alreadyUsedIds, i.id);
            });
            return items;
        }

        function removeItem(item) {
            _.remove(vm.items, item);
        }


        function onSelect($item, $model, $label, $event) {
            vm.addItem($item);
            vm.searchValue = '';
        }

    }

})();