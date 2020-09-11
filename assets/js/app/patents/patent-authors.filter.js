(function () {
    angular.module("patents")
        .filter('patentAuthors', filter);

    filter.$inject = [];

    function filter() {

        return function (authorsStr, patent) {
            authorsStr = authorsStr || '';

            return authorsStr.split(/,\s?/).map(function (author, index) {
                return author;

            }).join(', ');
        };
    }

})();
