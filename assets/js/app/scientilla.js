var Scientilla = Scientilla || {};

Scientilla.user = {
   getAliases: function() {
        var firstLetter = function (string) {
            if (!string) return "";
            return string.charAt(0).toUpperCase();
        };
        var capitalize = function (string) {
            if (!string) return "";
            return _.capitalize(string.toLowerCase());
//                return str.replace(/\w\S*/g, function (txt) {
//                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
//                });
        };
        var aliases = [];
        if (_.isEmpty(this.name) || _.isEmpty(this.surname))
            return aliases;
        var first_name = capitalize(this.name);
        var last_name = capitalize(this.surname);
        var initial_first_name = firstLetter(first_name);
        aliases.push(first_name + " " + last_name);
        aliases.push(last_name + " " + first_name);
        aliases.push(last_name + " " + initial_first_name + ".");
        aliases.push(initial_first_name + ". " + last_name + "");
        aliases = _.uniq(aliases);
        return aliases;
    },

    getUcAliases: function() {
        var aliases = this.getAliases();
        var ucAliases = _.map(aliases, function(a) { return a.toUpperCase();});
        return ucAliases;
    }
};

//sTodo: evaluating wheter to reformat in a constructor style
Scientilla.reference = {
    create: function(referenceData, owner) {
        var fields = [
            'authors',
            'title',
            'status'
        ];
        var reference = _.pick(referenceData, fields);
        reference.owner = owner;
        _.extend(reference, Scientilla.reference);
        return reference;
    },
    getAuthors: function () {
            if (!this.authors) return [];

            return this.authors.replace(/\s+et all\s*$/i, '').split(',').map(_.trim);
        },
        getUcAuthors: function() {
            var authors = this.getAuthors();
            var ucAuthors = _.map(authors, function(a) { return a.toUpperCase();});
            return ucAuthors;
        },
        hasRealOwner: function() {
            return _.isObject(this.owner);
        }
};
