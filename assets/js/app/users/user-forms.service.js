(function () {
    angular.module("users")
        .factory("UserForms", UserForms);

    UserForms.$inject = [];

    function UserForms() {

        const service = {};

        service.getExternalNewFileds = function (selection) {
            const opts = {

                'publications': {
                    publicationsField: {
                        inputType: 'select',
                        label: 'Search key',
                        matchColumn: 'field',
                        values: [
                            {value: 'username', label: 'E-Mail'}
                        ],
                        defaultValue: 'username'
                    }
                },
                'scopus': {
                    scopusField: {
                        inputType: 'select',
                        label: 'Search key',
                        matchColumn: 'field',
                        values: [
                            {value: 'scopusId', label: 'Author id'}
                        ],
                        defaultValue: 'scopusId'
                    }
                }
            };

            const s = selection.toLowerCase();
            if (s in opts)
                return opts[s];

            return {};
        };

        return service;

    }

})();
