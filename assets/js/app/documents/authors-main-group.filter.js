(function () {
    angular.module("documents")
        .filter('authorsMainGroup', authorsMainGroup);

    authorsMainGroup.$inject = [
        'config'
    ];

    function authorsMainGroup(config) {

        return function(authors, document) {

            return authors.split(/,\s?/).map(function (author, index) {
                let htmlAuthor = author;

                const authorship = _.find(document.authorships, a => a.position === index);

                if (authorship) {
                    const institutes = authorship.affiliations.map(a => a.id);
                    if (institutes.includes(config.mainInstitute.id))
                        htmlAuthor += '<a href="#/groups/' + config.mainInstitute.id + '"><sup class="superscript">' + config.mainInstitute.shortname + '</sup></a>';
                }
                return htmlAuthor;
            }).join(', ');
        };
    }

})();

