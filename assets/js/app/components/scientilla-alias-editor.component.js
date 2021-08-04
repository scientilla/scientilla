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
        vm.toggleMainAlias = toggleMainAlias;

        vm.$onInit = function () {
            vm.newAlias = '';
            if (!_.isArray(vm.aliases))
                vm.aliases = [];

            vm.aliases = _.orderBy(vm.aliases, ['main'], ['desc']);

            $scope.$watch('vm.newAlias', function(newValue, oldValue) {
                vm.newAliasIsCorrect = true;
                vm.newAliasIsDuplicate = false;
            });
        };

        vm.$onDestroy = function () {
        };

        function addAlias($event = false) {
            let newAlias = '';

            if (vm.newAlias.length > 0) {
                newAlias = capitalizeAll(vm.newAlias, [' ', '-', '.']);

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

            if ($event) {
                $event.preventDefault();
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

        function toggleMainAlias(alias, $event = false) {
            vm.aliases.forEach(a => a.main = false);
            const mainAlias = vm.aliases.find(a => a.str === alias.str);
            mainAlias.main = true;

            if ($event) {
                $event.preventDefault();
            }
        }
    }

})();