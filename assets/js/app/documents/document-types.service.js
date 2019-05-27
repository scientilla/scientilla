(function () {

    angular.module("documents").factory("DocumentTypesService", DocumentTypesService);

    DocumentTypesService.$inject = [
        'documentSourceTypes',
        'documentTypes'
    ];

    function DocumentTypesService(documentSourceTypes, documentTypes) {

        const service = {
            getDocumentTypes: getDocumentTypes,
            getDocumentTypeLabel: getDocumentTypeLabel,
            getSourceTypes: getSourceTypes,
            getSourceTypeLabel: getSourceTypeLabel
        };

        return service;

        function getSourceTypes() {
            return documentSourceTypes;
        }

        function getDocumentTypes() {
            return documentTypes;
        }

        function getDocumentTypeLabel(documentTypeKey) {
            const documentTypes = getDocumentTypes();
            return _.find(documentTypes, {key: documentTypeKey}).label;
        }

        function getSourceTypeLabel(sourceTypeKey) {
            const sourceTypes = getSourceTypes();
            return _.find(sourceTypes, {id: sourceTypeKey}).label;
        }
    }
})();