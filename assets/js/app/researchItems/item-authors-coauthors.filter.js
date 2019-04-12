(function () {
    angular.module("app")
        .filter('itemAuthorsCoauthors', filter);

    filter.$inject = [];

    function filter() {

        return function (authorsStr, researchItem) {
            authorsStr = authorsStr || '';

            return authorsStr.split(/,\s?/).map((authorStr, index) => {
                let htmlAuthor = authorStr;

                const author = researchItem.authors.find(a => a.position === index);
                if (!author)
                    return htmlAuthor;

                if (author.first_coauthor || (author.position === 0 && researchItem.authors.find(a => a.first_coauthor)))
                    htmlAuthor = '<sup class="superscript scientilla-document-affiliations">+</sup>' + htmlAuthor;
                else if (author.last_coauthor || (author.position === (researchItem.authorsStr.split(',').length - 1) && researchItem.authors.find(a => a.last_coauthor)))
                    htmlAuthor = '<sup class="superscript scientilla-document-affiliations">#</sup>' + htmlAuthor;

                return htmlAuthor;

            }).join(', ');
        };
    }

})();
