(function () {
    angular.module("groups")
        .factory("GroupForms", GroupForms);

    GroupForms.$inject = [
        'publicationTypes'
    ];

    function GroupForms(publicationTypes) {

        var service = {};

        service.getExternalNewFileds = function (selection) {
            var opts = {
                'publications': {
                    publicationsField: {
                        inputType: 'select',
                        label: 'Search key',
                        matchColumn: 'field',
                        values: [
                            {value: 'name', label: 'Acronym'}
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
                            {value: 'scopusId', label: 'Scopus id'}
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
