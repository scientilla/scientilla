(function () {
    angular.module("documents")
        .filter('authorsVerified', authorsVerified);

    authorsVerified.$inject = [
    ];

    function authorsVerified() {

        return function(authors, document) {
            var verifiedAuthors = document.getAllCoauthors();

            return authors.split(/,\s?/).map(function (author, index) {
                let htmlAuthor = author;

                const authorship = _.find(document.authorships, a => a.position === index);

                if (authorship) {
                    var user = _.find(verifiedAuthors,u => u.id === authorship.researchEntity);
                    if (user)
                        htmlAuthor = '<a href="#/users/' + user.id + '">' + htmlAuthor + '</a>';
                }
                return htmlAuthor;

            }).join(', ');
        };
    }

})();
