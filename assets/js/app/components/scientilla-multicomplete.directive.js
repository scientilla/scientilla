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
                title: "@"
            }
        };
    }

    function scientillaMulticompleteController($scope) {
        $scope.selectedItemChange = selectedItemChange;

        function selectedItemChange(item) {
            if (!item)
                return;
            $scope.items.push(item);
            $scope.searchText = "";
        }

    }

})();