(function () {
    angular.module("app").filter('itemAuthorsMainGroup', filter);

    filter.$inject = [
        'CustomizeService'
    ];

    function filter(CustomizeService) {

        const customizations = CustomizeService.getCustomizationsSync();
        return function (authorsStr, researchItem) {
            authorsStr = authorsStr || '';

            return authorsStr.split(/,\s?/).map(function (authorStr, index) {
                let htmlAuthor = authorStr;

                const author = researchItem.authors.find(a => a.position === index);

                if (author) {
                    if (researchItem.affiliations.find(af => af.author === author.id && af.institute === customizations.institute.id))
                        htmlAuthor += '<a href="#/groups/' + customizations.institute.id + '"><sup class="superscript">' + customizations.institute.shortname + '</sup></a>';
                }
                return htmlAuthor;
            }).join(', ');
        };
    }

})();

