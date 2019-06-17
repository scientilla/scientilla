(function () {
    angular.module('documents')
        .filter('documentusertags', documentusertags);

    documentusertags.$inject = [
        'context'
    ];

    function documentusertags(context) {

        return function(document) {
            const subResearchEntity = context.getSubResearchEntity();
            const tags = subResearchEntity.getTagsByDocument(document);

            return tags.map(function (tag) {
                return "<span class='label label-scientilla-grey'>"+tag.value+"</span>";
            }).join(' ');
        };

    }

})();