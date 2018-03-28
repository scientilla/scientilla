(function () {
    angular.module("documents")
        .filter('authorsCoauthors', filter);

    filter.$inject = [];

    function filter() {

        return function (authorsStr, document) {
            authorsStr = authorsStr || '';

            return authorsStr.split(/,\s?/).map(function (author, index) {
                let htmlAuthor = author;

                const authorship = _.find(document.authorships, a => a.position === index);
                if(!authorship)
                    return htmlAuthor;

                if (authorship.first_coauthor || (authorship.position === 0 && document.authorships.find(a => a.first_coauthor)))
                    htmlAuthor = '<sup class="superscript scientilla-document-affiliations">+</sup>' + htmlAuthor;
                else if (authorship.last_coauthor || (authorship.position === (document.authorsStr.split(',').length - 1) && document.authorships.find(a => a.last_coauthor)))
                    htmlAuthor = '<sup class="superscript scientilla-document-affiliations">#</sup>' + htmlAuthor;

                return htmlAuthor;

            }).join(', ');
        };
    }

})();
