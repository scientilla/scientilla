(function () {
    angular.module("references")
            .filter('linkableauthors', linkableAuthors);
    
    linkableAuthors.$inject = ['AuthService'];

    function linkableAuthors(AuthService) {

        function getLinkableAuthors(reference) {
            if (!reference.authors) return "";

            var authors = reference.getAuthors();
            var possibleMatches = reference.getAllCoauthors(); 
            var linkedAuthorsStr = reference.authors;
            authors.forEach(function (author) {
                var ucAuthor = author.toUpperCase();
                var matchingUser = _.find(possibleMatches, function (c) {
                    var aliases = c.getUcAliases();
                    return _.contains(aliases, ucAuthor);
                    
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