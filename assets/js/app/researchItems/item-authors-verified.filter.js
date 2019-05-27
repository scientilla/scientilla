(function () {
    angular.module("app")
        .filter('itemAuthorsVerified', filter);

    filter.$inject = [];

    function filter() {

        return function (authorsStr, researchItem) {
            authorsStr = authorsStr || '';
            const verifiedAuthors = researchItem.verified;

            return authorsStr.split(/,\s?/).map((authorStr, index) => {
                const author = researchItem.authors.find(a => a.position === index);
                if (!author) return authorStr;

                const verified = verifiedAuthors.find(v => v.id === author.verify);
                if (!verified) return authorStr;

                const user = researchItem.verifiedUsers.find(vu => vu.researchEntity === verified.researchEntity);
                if (!user)
                    return authorStr;

                return '<a href="#/users/' + verified.researchEntity + '">' + authorStr + '</a>';


            }).join(', ');
        };
    }

})();
