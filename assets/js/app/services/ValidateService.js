(function () {
    "use strict";
    angular.module("services").factory("ValidateService", ValidateService);

    ValidateService.$inject = [];

    function ValidateService() {
        let service = {};

        service.validate = function(object = {}, field = false, requiredFields = [], rules = []) {
            let errors = {};

            // Check if a specific field is been provided, otherwise validate all the fields.
            if (field) {
                if (object[field] && typeof rules[field] !== 'undefined') {
                    if (!rules[field].regex.test(object[field])) {
                        if (typeof errors[field] === 'undefined') {
                            errors[field] = [];
                        }
                        errors[field].push({
                            rule: 'valid',
                            message: rules[field].message
                        });
                    }
                }

                if (!object[field] && requiredFields.indexOf(field) > -1) {
                    if (typeof errors[field] === 'undefined') {
                        errors[field] = [];
                    }
                    errors[field].push({
                        rule: 'required',
                        message: 'This field is required.'
                    });
                }

                return errors[field];
            } else {
                _.forEach(rules, function(rule, ruleField) {
                    if (object[ruleField]) {
                        if (!rule.regex.test(object[ruleField])) {
                            if (typeof errors[ruleField] === 'undefined') {
                                errors[ruleField] = [];
                            }
                            errors[ruleField].push({
                                rule: 'valid',
                                message: rule.message
                            });
                        }
                    }
                });

                _.forEach(requiredFields, function(requiredField) {
                    if (!object[requiredField]) {
                        if (typeof errors[requiredField] === 'undefined') {
                            errors[requiredField] = [];
                        }
                        errors[requiredField].push({
                            rule: 'required',
                            message: 'This field is required.'
                        });
                    }
                });

                return errors;
            }
        };

        return service;
    }
})();