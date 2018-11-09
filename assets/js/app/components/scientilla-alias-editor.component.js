(function () {
    'use strict';

    angular.module('components')
        .component('scientillaAliasEditor', {
            templateUrl: 'partials/scientilla-alias-editor.html',
            controller: scientillaAliasEditor,
            controllerAs: 'vm',
            bindings: {
                aliases: '='
            }
        });

    scientillaAliasEditor.$inject = [
        'documentFieldsRules',
        '$scope'
    ];

    function scientillaAliasEditor(documentFieldsRules, $scope) {
        const vm = this;
        vm.addAlias = addAlias;
        vm.removeAlias = removeAlias;
        vm.newAliasIsCorrect = true;
        vm.newAliasIsDuplicate = false;
        vm.originalAliases = angular.copy(vm.aliases);

        vm.$onInit = function () {
            vm.newAlias = '';
            if (!_.isArray(vm.aliases))
                vm.aliases = [];

            $scope.$watch('vm.newAlias', function(newValue, oldValue) {
                vm.newAliasIsCorrect = true;
                vm.newAliasIsDuplicate = false;
            });
        };

        vm.$onDestroy = function () {
        };

        function addAlias() {
            const newAlias = capitalizeAll(vm.newAlias, [' ', '-', '.']);

            if (typeof(vm.aliases) !== 'undefined') {
                if (vm.aliases.filter(a => a.str === newAlias).length >= 1) {
                    vm.newAliasIsDuplicate = true;
                } else {
                    vm.newAliasIsDuplicate = false;
                }
            } else {
                vm.aliases = [];
            }

            if (newAlias.match(documentFieldsRules.authorsStr.regex) && !vm.newAliasIsDuplicate) {
                vm.aliases.push({str: newAlias});
                vm.newAlias = '';
                vm.newAliasIsCorrect = true;
                vm.newAliasIsDuplicate = false;
            } else {
                vm.newAliasIsCorrect = false;
            }
        }

        function removeAlias(alias) {
            vm.aliases = vm.aliases.filter(a => a.str !== alias.str);
        }

        function capitalize(str) {
            return str.charAt(0).toLocaleUpperCase() + str.slice(1);
        }

        function capitalizeAll(str, wordSeparators) {
            let retStr = str.toLocaleLowerCase();
            for (const c of wordSeparators)
                retStr = retStr.split(c).map(capitalize).join(c);
            return retStr;
        }
    }

})();