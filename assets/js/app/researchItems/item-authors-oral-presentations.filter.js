(function () {
    angular.module("app")
        .filter('itemAuthorsOralPresentations', filter);

    filter.$inject = [];

    function filter() {

        return function (authorsStr, researchItem) {
            authorsStr = authorsStr || '';

            return authorsStr.split(/,\s?/).map((authorStr, index) => {
                let htmlAuthor = authorStr;

                const author = researchItem.authors.find(a => a.position === index);
                if (!author)
                    return htmlAuthor;

                if (author.oral_presentation)
                    htmlAuthor = '<i class="fas fa-microphone fa-left"></i>' + htmlAuthor;

                return htmlAuthor;

            }).join(', ');
        };
    }

})();
