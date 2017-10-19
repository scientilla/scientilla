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
        'documentFieldsRules'
    ];

    function scientillaAliasEditor(documentFieldsRules) {
        const vm = this;
        vm.addAlias = addAlias;
        vm.removeAlias = removeAlias;
        vm.newAliasIsCorrect = newAliasIsCorrect;


        vm.$onInit = function () {
            vm.newAlias = '';
            if (!_.isArray(vm.aliases))
                vm.aliases = [];
        };

        vm.$onDestroy = function () {
        };

        function addAlias(event) {
            if (event.key === 'Enter') {
                event.preventDefault();

                const newAlias = capitalizeAll(vm.newAlias, [' ', '-', '.']);
                if (newAlias.match(documentFieldsRules.authorsStr.regex)) {
                    vm.aliases.push({str: newAlias});
                    vm.newAlias = '';
                }
            }
        }

        function newAliasIsCorrect() {
            return !vm.newAlias || vm.newAlias.match(documentFieldsRules.authorsStr.regex);
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