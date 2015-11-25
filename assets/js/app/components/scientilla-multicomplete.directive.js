(function () {
    'use strict';

    angular.module('components')
            .directive('scientillaMulticomplete', scientillaMulticomplete);

    function scientillaMulticomplete() {
        return {
            restrict: 'E',
            templateUrl: 'partials/scientillaMulticomplete.html',
            controller: scientillaMulticompleteController,
            controllerAs: 'vm',
            scope: {},
            bindToController: {
                items: "=",
                query: "&",
                filter: "&",
                transform: "&",
                title: "@",
                suggestedItems: "="
            }
        };
    }

    function scientillaMulticompleteController($scope, Restangular) {
        var vm = this;
        vm.items = this.items;
        vm.suggestedItems = this.suggestedItems;
        vm.addItem = addItem;
        vm.search = search;
        vm.removeItem = removeItem;

        function search(searchText) {
            var info = this.query()(searchText);
            var filter = this.filter();
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

    }

})();