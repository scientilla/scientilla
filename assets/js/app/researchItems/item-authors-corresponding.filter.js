(function () {
    angular.module("app")
        .filter('itemAuthorsCorresponding', filter);

    filter.$inject = [];

    function filter() {

        return function (authorsStr, researchItem) {
            authorsStr = authorsStr || '';

            return authorsStr.split(/,\s?/).map((authorStr, index) => {
                let htmlAuthor = authorStr;

                if (!_.has(researchItem, 'authors')) {
                    return htmlAuthor;
                }

                const author = researchItem.authors.find(a => a.position === index);

                if (author && author.corresponding) {
                    htmlAuthor = '*' + htmlAuthor;
                }
                return htmlAuthor;

            }).join(', ');
        };
    }

})();
