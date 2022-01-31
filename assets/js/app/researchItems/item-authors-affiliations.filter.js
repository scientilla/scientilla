(function () {
    angular.module("app")
        .filter('itemAuthorsAffiliations', filter);

    filter.$inject = ['ResearchItemService'];

    function filter(ResearchItemService) {

        return function (authorsStr, researchItem) {
            authorsStr = authorsStr || '';

            return authorsStr.split(/,\s?/).map(function (authorStr, index) {
                let htmlAuthor = authorStr;

                if (!_.has(researchItem, 'authors')) {
                    return htmlAuthor;
                }

                const author = researchItem.authors.find(a => a.position === index);

                if (author) {
                    const affiliations = researchItem.affiliations.filter(af => af.author === author.id);
                    htmlAuthor += '<sup class="document-affiliations">' +
                        affiliations.map(
                            af => ResearchItemService.getInstituteIdentifier(
                                researchItem.institutes.findIndex(i => i.id === af.institute)
                            )
                        ).join(',') +
                        '</sup>';
                }
                return htmlAuthor;

            }).join(', ');
        };
    }

})();
