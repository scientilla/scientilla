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
