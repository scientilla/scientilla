(function () {
    angular.module("documents")
        .filter('authorsAffiliations', authorsAffiliations);

    authorsAffiliations.$inject = [
    ];

    function authorsAffiliations() {

        return function(authorsStr, document) {
            authorsStr = authorsStr || '';
            var verifiedAuthors = document.getAllCoauthors();

            return authorsStr.split(/,\s?/).map(function (author, index) {
                let htmlAuthor = author;

                const authorship = _.find(document.authorships, a => a.position === index);

                if (authorship) {
                    htmlAuthor += '<sup class="document-affiliations">' +
                        authorship.affiliations.map(a => document.getInstituteIdentifier(document.institutes.findIndex(i => i.id === a.id))).join(',') +
                        '</sup>';
                }
                return htmlAuthor;

            }).join(', ');
        };
    }

})();