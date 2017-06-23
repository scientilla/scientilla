(function () {
    angular.module("groups")
        .factory("GroupForms", GroupForms);

    GroupForms.$inject = [
        'publicationTypes'
    ];

    function GroupForms() {

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
                        ],
                        defaultValue: 'name'
                    }
                },
                'scopus': {
                    scopusField: {
                        inputType: 'select',
                        label: 'Search key',
                        matchColumn: 'field',
                        values: [
                            {value: 'scopusId', label: 'Scopus id'}
                        ],
                        defaultValue: 'scopusId'
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
