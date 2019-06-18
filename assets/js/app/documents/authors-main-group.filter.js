(function () {
    angular.module("documents")
        .filter('authorsMainGroup', authorsMainGroup);

    authorsMainGroup.$inject = [
        'CustomizeService'
    ];

    function authorsMainGroup(CustomizeService) {

        const customizations = CustomizeService.getCustomizationsSync();
        return function (authorsStr, document) {
            authorsStr = authorsStr || '';

            return authorsStr.split(/,\s?/).map(function (author, index) {
                let htmlAuthor = author;

                const authorship = _.find(document.authorships, a => a.position === index);

                if (authorship) {
                    const institutes = authorship.affiliations.map(a => a.id);
                    if (institutes.includes(customizations.institute.id))
                        htmlAuthor += '<a href="#/groups/' + customizations.institute.id + '"><sup class="superscript">' + customizations.institute.shortname + '</sup></a>';
                }
                return htmlAuthor;
            }).join(', ');
        };
    }

})();

