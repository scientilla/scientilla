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
                'scopus': {
                    scopusField: {
                        inputType: 'select',
                        label: 'Search key',
                        matchColumn: 'field',
                        values: [
                            {value: 'scopusId', label: 'Author id'}
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
