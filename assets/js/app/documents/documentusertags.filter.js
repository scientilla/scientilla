(function () {
    angular.module('documents')
        .filter('documentusertags', documentusertags);

    documentusertags.$inject = [
        'context'
    ];

    function documentusertags(context) {

        return function(document) {
            var researchEntity = context.getResearchEntity();
            var tags = researchEntity.getTagsByDocument(document);

            return tags.map(function (tag) {
                return "<span class='label label-primary'>"+tag.value+"</span>";
            }).join(' ');
        };

    }

})();