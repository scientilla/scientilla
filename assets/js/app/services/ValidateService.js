(function () {
    "use strict";
    angular.module("services").factory("ValidateService", ValidateService);

    ValidateService.$inject = [];

    function ValidateService() {
        let service = {};

        function skipNullField(object, field, rule) {
            if (_.has(rule, 'allowNull')) {
                if (rule.allowNull && _.isNull(object[field])) {
                    return true;
                }
            }

            return false;
        }

        function addError(errors, field, error) {
            if (typeof errors[field] === 'undefined') {
                errors[field] = [];
            }
            errors[field].push(error);
        }

        function testRule(errors, object, field, rule) {

            if (
                (!_.has(rule, 'isDate') && object[field] && rule && rule.regex && !rule.regex.test(object[field])) ||
                (_.has(rule, 'isDate') && typeof object[field] === 'undefined')
            ) {
                addError(errors, field, {
                    rule: 'valid',
                    message: rule.message
                });
            }
        }

        function fieldIsRequired(requiredFields, field) {
            if (requiredFields.length > 0 && requiredFields.indexOf(field) > -1) {
                return true;
            }

            return false;
        }

        function checkFieldIsAvailable(errors, object, field, rule) {
            // Only check if the field is required when it doesn't have other errors
            if (typeof errors[field] === 'undefined') {
                if (
                    (_.has(rule, 'isDate') && object[field] === null) ||
                    (!_.has(rule, 'isDate') && (!object[field] || (_.isArray(object[field]) && _.isEmpty(object[field]))))
                ) {
                    addError(errors, field, {
                        rule: 'required',
                        message: 'This field is required.'
                    });
                }
            }
        }

        service.validate = function(object = {}, field = false, requiredFields = [], rules = []) {
            let errors = {};

            // Check if a specific field is been provided, otherwise validate all the fields.
            if (field) {
                const rule = rules[field];

                if (skipNullField(object, field, rule)) {
                    return;
                }

                testRule(errors, object, field, rule);

                if (fieldIsRequired(requiredFields, field)) {
                    checkFieldIsAvailable(errors, object, field);
                }

                return errors[field];
            } else {
                _.forEach(rules, function(rule, field) {
                    if (skipNullField(object, field, rule)) {
                        return;
                    }

                    testRule(errors, object, field, rule);
                });

                _.forEach(requiredFields, function(field) {
                    checkFieldIsAvailable(errors, object, field);
                });

                return errors;
            }
        };

        return service;
    }
})();