(function () {

    angular.module("documents").factory("DocumentTypesService", DocumentTypesService);

    DocumentTypesService.$inject = [
        'documentSourceTypes',
        'documentTypes'
    ];

    function DocumentTypesService(documentSourceTypes, documentTypes) {

        const service = {
            getDocumentsFields: getDocumentsFields,
            getDocumentTypes: getDocumentTypes,
            getDocumentTypeLabel: getDocumentTypeLabel,
            getSourceTypes: getSourceTypes
        };

        return service;

        function getSourceTypes() {
            return documentSourceTypes;
        }

        function getDocumentsFields(source) {
            let fields;
            if (source === 'journal')
                fields = {
                    title: {
                        inputType: 'text'
                    },
                    authorsStr: {
                        inputType: 'text',
                        label: "Authors",
                    },
                    year: {
                        inputType: 'text'
                    },
                    journal: {
                        inputType: 'text'
                    },
                    volume: {
                        inputType: 'text'
                    },
                    issue: {
                        inputType: 'text'
                    },
                    pages: {
                        inputType: 'text'
                    },
                    articleNumber: {
                        label: "Article number",
                        inputType: 'text'
                    },
                    doi: {
                        label: "DOI",
                        inputType: 'text'
                    },
                    abstract: {
                        inputType: 'text',
                        multiline: true
                    },
                    scopusId: {
                        label: "Scopus ID",
                        inputType: 'text'
                    },
                    wosId: {
                        label: "WOS ID",
                        inputType: 'text'
                    }
                };
            if (source === 'book')
                fields = {
                    title: {
                        inputType: 'text'
                    },
                    bookTitle: {
                        label: 'Book title',
                        inputType: 'text'
                    },
                    authorsStr: {
                        inputType: 'text',
                        label: "Authors",
                    },
                    year: {
                        inputType: 'text'
                    },
                    pages: {
                        inputType: 'text'
                    },
                    editor: {
                        inputType: 'text'
                    },
                    publisher: {
                        inputType: 'text'
                    },
                    doi: {
                        label: "DOI",
                        inputType: 'text'
                    },
                    abstract: {
                        inputType: 'text',
                        multiline: true
                    },
                    scopusId: {
                        label: "Scopus ID",
                        inputType: 'text'
                    },
                    wosId: {
                        label: "WOS ID",
                        inputType: 'text'
                    }
                };
            if (source === 'conference')
                fields = {
                    title: {
                        inputType: 'text'
                    },
                    authorsStr: {
                        inputType: 'text',
                        label: "Authors",
                    },
                    year: {
                        inputType: 'text'
                    },
                    conferenceName: {
                        label: 'Conference name',
                        inputType: 'text'
                    },
                    conferenceLocation: {
                        label: 'Conference location',
                        inputType: 'text'
                    },
                    acronym: {
                        inputType: 'text'
                    },
                    volume: {
                        inputType: 'text'
                    },
                    issue: {
                        inputType: 'text'
                    },
                    pages: {
                        inputType: 'text'
                    },
                    articleNumber: {
                        label: "Article number",
                        inputType: 'text'
                    },
                    doi: {
                        label: "DOI",
                        inputType: 'text'
                    },
                    abstract: {
                        inputType: 'text',
                        multiline: true
                    },
                    scopusId: {
                        label: "Scopus ID",
                        inputType: 'text'
                    },
                    wosId: {
                        label: "WOS ID",
                        inputType: 'text'
                    }
                };
            if (!source) {
                fields = {
                    title: {
                        inputType: 'text'
                    },
                    authorsStr: {
                        inputType: 'text',
                        label: "Authors",
                    },
                    year: {
                        inputType: 'text'
                    },
                    scopusId: {
                        label: "Scopus ID",
                        inputType: 'text'
                    },
                    wosId: {
                        label: "WOS ID",
                        inputType: 'text'
                    }
                };
            }
            return fields;
        }

        function getDocumentTypes() {
            return documentTypes;
        }

        function getDocumentTypeLabel(documentTypeKey) {
            const documentTypes = getDocumentTypes();
            return _.find(documentTypes, {key: documentTypeKey}).label;
        }
    }
})();