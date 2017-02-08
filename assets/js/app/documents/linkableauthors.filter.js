(function () {
    angular.module("documents")
        .filter('linkableauthors', linkableAuthors);

    linkableAuthors.$inject = [
        'config'
    ];

    function linkableAuthors(config) {

        function getLinkableAuthors(document) {
            if (!document.authorsStr) return "";
            if (!_.isFunction(document.getAuthors))
                return document.authorsStr;

            var authors = document.getAuthors();
            var verifiedAuthors = document.getAllCoauthors();

            return authors.map(function (author, index) {
                var htmlAuthor = author;

                var authorship = _.find(document.authorships, function (a) {
                    return a.position === index;
                });

                if (authorship) {
                    if (authorship.researchEntity) {
                        var user = _.find(verifiedAuthors, function (va) {
                            return va.id === authorship.researchEntity;
                        });
                        htmlAuthor = '<a href="#/users/' + user.id + '">' + author + '</a>';
                    }

                    if (authorship.corresponding)
                        htmlAuthor = '*' + htmlAuthor;

                    if (authorship.affiliations.includes(config.mainInstitute.id))
                        htmlAuthor = htmlAuthor + '<a href="#/groups/' + config.mainInstitute.id + '"><sup class="superscript">' + config.mainInstitute.shortname + '</sup></a>';
                }

                return htmlAuthor;

            }).join(', ');
        }

        return getLinkableAuthors;
    }

})();