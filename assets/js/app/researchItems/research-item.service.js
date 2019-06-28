/* global angular */
(function () {
    angular.module("app").factory("ResearchItemService", controller);

    controller.$inject = [];

    function controller() {

        return {
            addLabel,
            removeLabel,
            hasLabel,
            getUserIndex,
            isUnverifying,
            getInstituteIdentifier,
            getCompleteAuthors
        };

        function addLabel(researchItem, label) {
            if (!researchItem.labels) researchItem.labels = [];
            if (!hasLabel(researchItem, label))
                researchItem.labels.push(label);
        }

        function removeLabel(researchItem, label) {
            if (!researchItem.labels) return;
            _.remove(researchItem.labels, l => l === label);
        }

        function hasLabel(researchItem, label) {
            return Array.isArray(researchItem.labels) ? researchItem.labels.includes(label) : false;
        }

        function getUserIndex(researchItem, user) {
            const authors = getAuthorsStrings(researchItem);
            const aliases = user.getAliases().map(a => a.toLocaleLowerCase());
            return _.findIndex(authors, a => aliases.includes(a));
        }

        function isUnverifying(researchItem) {
            return hasLabel(researchItem, researchItemLabels.UVERIFYING);
        }

        function getAuthorsStrings(researchItem) {
            if (!researchItem.authors) return [];
            return researchItem.authors.map(a => a.authorStr.toLocaleLowerCase());
        }

        function getInstituteIdentifier(instituteIndex) {
            const base26Chars = '0123456789abcdefghijklmnopqrstuvwxyz'.split("");
            const alphabetMapper = {
                '0': 'a', '1': 'b', '2': 'c', '3': 'd', '4': 'e', '5': 'f', '6': 'g', '7': 'h', '8': 'i', '9': 'j',
                'a': 'k', 'b': 'l', 'c': 'm', 'd': 'n', 'e': 'o', 'f': 'p', 'g': 'q', 'h': 'r', 'i': 's', 'j': 't',
                'k': 'u', 'l': 'v', 'm': 'w', 'n': 'x', 'o': 'y', 'p': 'z'
            };
            const base26Value = instituteIndex.toString(Object.keys(alphabetMapper).length).split('');
            if (base26Value.length > 1)
                base26Value[0] = base26Chars[base26Chars.indexOf(base26Value[0]) - 1];

            return base26Value.map(c => alphabetMapper[c]).join('');
        }

        function getCompleteAuthors(researchItem) {
            const authors = _.cloneDeep(researchItem.authors);
            authors.forEach(a => {
                const instituteIds = researchItem.affiliations.filter(af => af.author === a.id).map(af => af.institute);
                a.affiliations = _.cloneDeep(researchItem.institutes.filter(i => instituteIds.includes(i.id)));
                a.affiliations.forEach(af => af.getDisplayName = () => af.name);
            });

            return authors;
        }
    }
})();