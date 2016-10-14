(function () {
    angular.module("references")
            .filter('linkableauthors', linkableAuthors);

    function linkableAuthors() {

        function getLinkableAuthors(reference) {
            if (!reference.authorsStr) return "";
            if (!_.isFunction(reference.getAuthors))
                return reference.authorsStr;

            var authors = reference.getAuthors();
            var possibleMatches = reference.getAllCoauthors();
            var linkedAuthorsStr = reference.authorsStr;
            authors.forEach(function (author) {
                var ucAuthor = author.toUpperCase();
                var matchingUser = _.find(possibleMatches, function (c) {
                    var aliases = c.getUcAliases();
                    return _.includes(aliases, ucAuthor);
                    
                });
                if (matchingUser) {
                    //TODO: add offset to avoid substituting already substituted users
                    linkedAuthorsStr = linkedAuthorsStr.replace(author, '<a href="#/users/'+ matchingUser.id+'">' + author + '</a>');
                }
            });
            return linkedAuthorsStr;
        }

        return getLinkableAuthors;
    }

})();