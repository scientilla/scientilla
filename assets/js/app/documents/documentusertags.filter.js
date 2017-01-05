(function () {
    angular.module('documents')
        .filter('documentusertags', linkableAuthors);

    linkableAuthors.$inject = [
        'context'
    ];

    function linkableAuthors(context) {

        function getDocumentUserTags(document) {
            var researchEntity = context.getResearchEntity();
            var tags = document.getUsersTagByUser(researchEntity);

            return tags.map(function (tag) {
                return "<span class='label label-primary'>"+tag.value+"</span>";
            }).join(' ');
        }

        return getDocumentUserTags;
    }

})();