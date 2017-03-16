(function () {
    angular.module("documents")
        .filter('authorsAffiliations', authorsAffiliations);

    authorsAffiliations.$inject = [
    ];

    function authorsAffiliations() {

        return function(authors, document) {
            var verifiedAuthors = document.getAllCoauthors();

            return authors.split(/,\s?/).map(function (author, index) {
                let htmlAuthor = author;

                const authorship = _.find(document.authorships, a => a.position === index);

                if (authorship) {
                    htmlAuthor += '<sup class="superscript scientilla-document-affiliations">' +
                        authorship.affiliations.map(a => document.getInstituteIdentifier(document.institutes.findIndex(i => i.id === a.id))).join(',') +
                        '</sup>';
                }
                return htmlAuthor;

            }).join(', ');
        };
    }

})();