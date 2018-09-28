(function () {
    angular.module("documents")
        .filter('authorsOralPresentations', filter);

    filter.$inject = [];

    function filter() {

        return function (authorsStr, document) {
            authorsStr = authorsStr || '';

            return authorsStr.split(/,\s?/).map(function (author, index) {
                let htmlAuthor = author;

                const authorship = _.find(document.authorships, a => a.position === index);
                if(!authorship)
                    return htmlAuthor;

                if (authorship.oral_presentation)
                    htmlAuthor = '<i class="fas fa-microphone fa-left"></i>' + htmlAuthor;

                return htmlAuthor;

            }).join(', ');
        };
    }

})();
