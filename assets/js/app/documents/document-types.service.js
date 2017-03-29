(function () {

    angular.module("documents").factory("DocumentTypesService", DocumentTypesService);

    function DocumentTypesService() {

        var service = {
            getDocumentsFields: getDocumentsFields,
            getDocumentTypes: getDocumentTypes,
            getDocumentTypeLabel: getDocumentTypeLabel,
            getSourceTypes: getSourceTypes
        };

        return service;

        function getSourceTypes() {
            var sources = [
                {id: 'book', label: 'Book'},
                {id: 'journal', label: 'Journal'},
                {id: 'conference', label: 'Conference'},
                {id: 'scientific_conference', label: 'Scientific Conference'},
                {id: 'institute', label: 'Institute'},
                {id: 'bookseries', label: 'Book Series'},
                {id: 'workshop', label: 'Workshop'},
                {id: 'school', label: 'School'},
                {id: 'media', label: 'Media'},
                {id: 'public_event', label: 'Public Event'},
                {id: 'outreach', label: 'Outreach'}
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
            var invitedTalkSources = [
                'institute',
                'scientific_conference',
                'workshop',
                'school',
                'media',
                'public_event',
                'outreach'
            ];
            return [
                {
                    key: 'article',
                    shortLabel: 'AR',
                    label: 'Article',
                    defaultSource: 'journal',
                    allowedSources: defaultSources
                },
                {
                    key: 'article_in_press',
                    shortLabel: 'AP',
                    label: 'Article in Press',
                    defaultSource: 'journal',
                    allowedSources: defaultSources
                },
                {
                    key: 'abstract_report',
                    shortLabel: 'AB',
                    label: 'Abstract Report',
                    defaultSource: null,
                    allowedSources: defaultSources
                },
                {
                    key: 'book',
                    shortLabel: 'BO',
                    label: 'Book',
                    defaultSource: 'book',
                    allowedSources: defaultSources
                },
                {
                    key: 'book_chapter',
                    shortLabel: 'BC',
                    label: 'Book Chapter',
                    defaultSource: 'book',
                    allowedSources: defaultSources
                },
                {
                    key: 'conference_paper',
                    shortLabel: 'CP',
                    label: 'Conference Paper',
                    defaultSource: 'conference',
                    allowedSources: defaultSources
                },
                {
                    key: 'conference_review',
                    shortLabel: 'CR',
                    label: 'Conference Review',
                    defaultSource: 'conference',
                    allowedSources: defaultSources
                },
                {
                    key: 'editorial',
                    shortLabel: 'ED',
                    label: 'Editorial',
                    defaultSource: null,
                    allowedSources: defaultSources
                },
                {
                    key: 'erratum',
                    shortLabel: 'ER',
                    label: 'Erratum',
                    defaultSource: null,
                    allowedSources: defaultSources
                },
                {
                    key: 'letter',
                    shortLabel: 'LE',
                    label: 'Letter',
                    defaultSource: null,
                    allowedSources: defaultSources
                },
                {
                    key: 'note',
                    shortLabel: 'NO',
                    label: 'Note',
                    defaultSource: null,
                    allowedSources: defaultSources
                },
                {
                    key: 'report',
                    shortLabel: 'RP',
                    label: 'Report',
                    defaultSource: null,
                    allowedSources: defaultSources
                },
                {
                    key: 'review',
                    shortLabel: 'RV',
                    label: 'Review',
                    defaultSource: 'journal',
                    allowedSources: defaultSources
                },
                {
                    key: 'short_survey',
                    shortLabel: 'SS',
                    label: 'Short Survey',
                    defaultSource: null,
                    allowedSources: defaultSources
                },
                {
                    key: 'invited_talk',
                    shortLabel: 'IT',
                    label: 'Invited Talk',
                    defaultSource: null,
                    allowedSources: invitedTalkSources
                }
            ];
        }

        function getDocumentTypeLabel(documentTypeKey) {
            const documentTypes = getDocumentTypes();
            return _.find(documentTypes, {key: documentTypeKey}).label;
        }
    }
})();