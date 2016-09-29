(function () {
    angular.module("users")
        .factory("UserForms", UserForms);

    UserForms.$inject = [];

    function UserForms() {

        var service = {};

        service.getExternalNewFileds = function(selection) {
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
