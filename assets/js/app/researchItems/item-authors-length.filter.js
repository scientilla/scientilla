(function () {
    angular.module("app")
        .filter('itemAuthorsLength', filter);

    filter.$inject = [];

    function filter() {

        return function (authorsStr, limit) {
            authorsStr = authorsStr || '';

            if (limit > 0)
                authorsStr = authorsStr.split(', ').slice(0, limit).join(', ');

            return authorsStr;
        };
    }

})();
