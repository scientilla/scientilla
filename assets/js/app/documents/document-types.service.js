"use strict";
(function () {

    angular.module("documents").factory("DocumentTypesService", DocumentTypesService);

    function DocumentTypesService() {

        var service = {
            getDocumentsFields: getDocumentsFields,
            getDocumentTypes: getDocumentTypes,
            getSourceTypes: getSourceTypes
        };

        return service;

        function getSourceTypes() {
            var sources = [
                {id: 'book', label: 'Book'},
                {id: 'journal', label: 'Journal'},
                {id: 'conference', label: 'Conference'},
                {id: 'institute', label: 'Institute'},
                {id: 'bookseries', label: 'Book Series'},
                {id: 'workshop', label: 'Workshop'},
                {id: 'school', label: 'School'}
            ];
          return sources;
        }

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
            var defaultSources = ['journal', 'conference', 'book', 'bookseries'];
            var invitedTalkSources = ['institute', 'conference', 'workshop', 'school'];
            return [
                {
                    key: 'article',
                    label: 'Article',
                    defaultSource: 'journal',
                    allowedSources: defaultSources
                },
                {
                    key: 'article_in_press',
                    label: 'Article in Press',
                    defaultSource: 'journal',
                    allowedSources: defaultSources
                },
                {
                    key: 'abstract_report',
                    label: 'Abstract Report',
                    defaultSource: null,
                    allowedSources: defaultSources
                },
                {
                    key: 'book',
                    label: 'Book',
                    defaultSource: 'book',
                    allowedSources: defaultSources
                },
                {
                    key: 'book_chapter',
                    label: 'Book Chapter',
                    defaultSource: 'book',
                    allowedSources: defaultSources
                },
                {
                    key: 'conference_paper',
                    label: 'Conference Paper',
                    defaultSource: 'conference',
                    allowedSources: defaultSources
                },
                {
                    key: 'conference_review',
                    label: 'Conference Review',
                    defaultSource: 'conference',
                    allowedSources: defaultSources
                },
                {
                    key: 'editorial',
                    label: 'Editorial',
                    defaultSource: null,
                    allowedSources: defaultSources
                },
                {
                    key: 'erratum',
                    label: 'Erratum',
                    defaultSource: null,
                    allowedSources: defaultSources
                },
                {
                    key: 'letter',
                    label: 'Letter',
                    defaultSource: null,
                    allowedSources: defaultSources
                },
                {
                    key: 'note',
                    label: 'Note',
                    defaultSource: null,
                    allowedSources: defaultSources
                },
                {
                    key: 'report',
                    label: 'Report',
                    defaultSource: null,
                    allowedSources: defaultSources
                },
                {
                    key: 'review',
                    label: 'Review',
                    defaultSource: 'journal',
                    allowedSources: defaultSources
                },
                {
                    key: 'short_survey',
                    label: 'Short Survey',
                    defaultSource: null,
                    allowedSources: defaultSources
                },
                {
                    key: 'invited_talk',
                    label: 'Invited Talk',
                    defaultSource: null,
                    allowedSources: invitedTalkSources
                }
            ];
        }
    }
})();