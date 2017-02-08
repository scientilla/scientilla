(function () {
    angular.module("services")
        .factory("ResearchEntityFormsFactory", ResearchEntityFormsFactory);

    ResearchEntityFormsFactory.$inject = [
        'UserForms',
        'GroupForms'
    ];

    function ResearchEntityFormsFactory(UserForms, GroupForms) {

        return function (vm) {

            var service = {};
            var connectors = vm.researchEntity.getExternalConnectors();

            service.setExternalForm = function () {
                vm.searchForm = {
                    connector: getConnectorField()
                };
            };

            return service;

            function getConnectorField() {
                var values = _.concat(
                    {value: '?', label: 'Select'},
                    connectors.map(function (c) {
                        return {value: c.name, label: c.name};
                    }));

                return {
                    inputType: 'select',
                    label: 'Connector',
                    labelClass: 'form-inline',
                    values: values,
                    matchColumn: 'connector',
                    onChange: onConnectorChange
                };
            }

            function onConnectorChange(newValue, oldValue) {
                var isNotChanged = (newValue === oldValue);
                var isNewAndEmpty = ((_.isNil(oldValue)) && newValue === "?");
                var isStillEmpty = (_.isNil(oldValue) && _.isNil(newValue));

                if (isNotChanged || isNewAndEmpty || isStillEmpty)
                    return;

                var newFields = getNewFileds(newValue);

                vm.searchForm = _.defaults({
                        connector: getConnectorField()
                    },
                    newFields
                );
            }

            function getNewFileds(selection) {

                if (vm.researchEntity.getType() === 'user')
                    return UserForms.getExternalNewFileds(selection);
                else
                    return GroupForms.getExternalNewFileds(selection);

            }

        };
    }

}());
