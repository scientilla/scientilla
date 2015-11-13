(function () {
    'use strict';

    angular.module('components')
            .directive('scientillaMulticomplete', scientillaMulticomplete);

    function scientillaMulticomplete() {
        return {
            restrict: 'E',
            templateUrl: 'partials/scientillaMulticomplete.html',
            controller: scientillaMulticompleteController,
            scope: {
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
        $scope.addItem = addItem;
        $scope.search = search;
        $scope.removeItem = removeItem;

        function search(searchText) {
            var info = $scope.query()(searchText);
            var filter = $scope.filter();
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
            
            //sTODO: when adding item, remove it from suggested if present
            var newItem;
            var transform = $scope.transform();
            if (_.isFunction(transform))
                newItem = transform(item);
            else
                newItem = item;
            $scope.items.push(newItem);
            $scope.searchText = "";
        }

        function filterOutUsedElemsById(toBeFiltered, filter) {
            var alreadyUsedIds = _.map(filter, 'id');
            var items = _.filter(toBeFiltered, function (i) {
                return !_.includes(alreadyUsedIds, i.id);
            });
            return items;
        }
        
        function removeItem(item) {
            _.remove($scope.items, item);
        }

    }

})();