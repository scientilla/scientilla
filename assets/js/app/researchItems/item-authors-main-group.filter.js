(function () {
    angular.module("app").filter('itemAuthorsMainGroup', filter);

    filter.$inject = [
        'config'
    ];

    function filter(config) {

        return function (authorsStr, researchItem) {
            authorsStr = authorsStr || '';

            return authorsStr.split(/,\s?/).map(function (authorStr, index) {
                let htmlAuthor = authorStr;

                const author = researchItem.authors.find(a => a.position === index);

                if (author) {
                    if (researchItem.affiliations.find(af => af.author === author.id && af.institute === config.mainInstitute.id))
                        htmlAuthor += '<a href="#/groups/' + config.mainInstitute.id + '"><sup class="superscript">' + config.mainInstitute.shortname + '</sup></a>';
                }
                return htmlAuthor;
            }).join(', ');
        };
    }

})();

