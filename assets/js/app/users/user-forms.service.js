(function () {
    angular.module("users")
        .factory("UserForms", UserForms);

    UserForms.$inject = [
        'publicationTypes'
    ];

    function UserForms(publicationTypes) {

        var service = {};

        service.getExternalNewFileds = function (selection) {

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
