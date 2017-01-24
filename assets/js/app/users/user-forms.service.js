(function () {
    angular.module("users")
        .factory("UserForms", UserForms);

    UserForms.$inject = [
        'DocumentTypesService'
    ];

    function UserForms() {

        var service = {};

        service.getExternalNewFileds = function (selection) {
            const publicationTypes = [
                {
                    value: 'book-chapter',
                    label: 'Book chapter'
                },
                {
                    value: 'book-whole',
                    label: 'Book Whole'
                },
                {
                    value: 'full-paper-volume-at-refereed-conference',
                    label: 'Full Paper / Volume at Refereed Conference'
                },
                {
                    value: 'short-paper-abstract-at-refereed-conference',
                    label: 'Short Paper / Abstract at Refereed Conference'
                },
                {
                    value: 'masters-thesis',
                    label: 'Master\'s Thesis'
                },
                {
                    value: 'phd-thesis',
                    label: 'Ph.D. Thesis'
                },
                {
                    value: 'national-journal',
                    label: 'National Journal'
                },
                {
                    value: 'international-journal',
                    label: 'International Journal'
                },
                {
                    value: 'collection',
                    label: 'Collection'
                },
                {
                    value: 'report',
                    label: 'Report'
                },
                {
                    value: 'correction',
                    label: 'Correction'
                },
                {
                    value: 'editorial',
                    label: 'Editorial'
                },
                {
                    value: 'supp-information',
                    label: 'Supplementary Information'
                },
                {
                    value: 'talks',
                    label: 'Invited Talks'
                },
                //{value:'patent', label: 'Patent'},
            ];

            var opts = {
                'publications': {
                    publicationsField: {
                        inputType: 'select',
                        label: 'Search key',
                        matchColumn: 'field',
                        values: [
                            {value: 'username', label: 'E-Mail'},
                            {value: 'surname', label: 'Surname'}
                        ]
                    },
                    source_type: {
                        inputType: 'select',
                        label: 'Publications type',
                        matchColumn: 'type',
                        values: _.concat(
                            {value: 'all', label: 'All'},
                            publicationTypes
                        )
                    }
                },
                'scopus': {
                    scopusField: {
                        inputType: 'select',
                        label: 'Search key',
                        matchColumn: 'field',
                        values: [
                            {value: 'scopusId', label: 'Author id'},
                            {value: 'surname', label: 'Surname'}
                        ]
                    }
                },
                'orcid': {
                    orcidField: {
                        inputType: 'select',
                        label: 'Search key',
                        matchColumn: 'field',
                        values: [
                            {value: 'orcidId', label: 'ORCID id'}
                        ]
                    }
                }
            };


            var s = selection.toLowerCase();
            if (s in opts)
                return opts[s];

            return {};
        };

        return service;

    }

}());
