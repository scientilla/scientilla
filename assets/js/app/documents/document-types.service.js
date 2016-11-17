"use strict";
(function () {

    angular.module("documents").factory("DocumentTypesService", DocumentTypesService);

    function DocumentTypesService() {

        var service = {
            getDocumentsFields: getDocumentsFields,
            getDocumentTypes: getDocumentTypes
        };

        return service;

        function getDocumentsFields(source) {
            var fields;
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
            return [
                {
                    key: 'article',
                    label: 'Article',
                    defaultSource: 'journal'
                },
                {
                    key: 'article_in_press',
                    label: 'Article in Press',
                    defaultSource: 'journal'
                },
                {
                    key: 'abstract_report',
                    label: 'Abstract Report',
                    defaultSource: null
                },
                {
                    key: 'book',
                    label: 'Book',
                    defaultSource: 'book'
                },
                {
                    key: 'book_chapter',
                    label: 'Book Chapter',
                    defaultSource: 'book'
                },
                {
                    key: 'conference_paper',
                    label: 'Conference Paper',
                    defaultSource: 'conference'
                },
                {
                    key: 'conference_review',
                    label: 'Conference Review',
                    defaultSource: 'conference'
                },
                {
                    key: 'editorial',
                    label: 'Editorial',
                    defaultSource: null
                },
                {
                    key: 'erratum',
                    label: 'Erratum',
                    defaultSource: null
                },
                {
                    key: 'letter',
                    label: 'Letter',
                    defaultSource: null
                },
                {
                    key: 'note',
                    label: 'Note',
                    defaultSource: null
                },
                {
                    key: 'report',
                    label: 'Report',
                    defaultSource: null
                },
                {
                    key: 'review',
                    label: 'Review',
                    defaultSource: 'journal'
                },
                {
                    key: 'short_survey',
                    label: 'Short Survey',
                    defaultSource: null
                }
            ];
        }
    }
})();