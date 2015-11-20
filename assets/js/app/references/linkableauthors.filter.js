(function () {
    angular.module("references")
            .filter('linkableauthors', linkableAuthors);
    
    linkableAuthors.$inject = ['AuthService'];

    function linkableAuthors(AuthService) {

        function getLinkableAuthors(reference) {
            if (!reference.authors) return "";
            if (_.isUndefined(reference.collaborators)) return reference.authors;

            var authors = reference.getAuthors();
            var possibleMatches = reference.getRealAuthors(); 
            var linkedAuthorsStr = reference.authors;
            authors.forEach(function (author) {
                var ucAuthor = author.toUpperCase();
                var matchingUser = _.find(possibleMatches, function (c) {
                    var aliases = c.getUcAliases();
                    return _.contains(aliases, ucAuthor);
                    
                });
                if (matchingUser) {
                    //TODO: add offset to avoid substituting already substituted users
                    linkedAuthorsStr = linkedAuthorsStr.replace(author, '<a href="#/users/'+ matchingUser.id+'/references">' + author + '</a>');
                }
            });
            return linkedAuthorsStr;
        }

        return getLinkableAuthors;
    }

})();