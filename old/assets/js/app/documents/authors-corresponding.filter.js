(function () {
    angular.module("documents")
        .filter('authorsCorresponding', authorsCorresponding);

    authorsCorresponding.$inject = [
    ];

    function authorsCorresponding() {

        return function(authorsStr, document) {
            authorsStr = authorsStr || '';

            return authorsStr.split(/,\s?/).map(function (author, index) {
                let htmlAuthor = author;

                const authorship = _.find(document.authorships, a => a.position === index);

                if (authorship && authorship.corresponding) {
                    htmlAuthor = '*' + htmlAuthor;
                }
                return htmlAuthor;

            }).join(', ');
        };
    }

})();
