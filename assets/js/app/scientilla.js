var Scientilla = Scientilla || {};

Scientilla.user = {
    USER: 'user',
    ADMINISTRATOR: 'administrator',
    getAliases: function () {
        var firstLetter = function (string) {
            if (!string)
                return "";
            return string.charAt(0).toUpperCase();
        };
        var capitalize = function (string) {
            if (!string)
                return "";
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
    getUcAliases: function () {
        var aliases = this.getAliases();
        var ucAliases = _.map(aliases, function (a) {
            return a.toUpperCase();
        });
        return ucAliases;
    },
    getDisplayName: function () {
        var name = this.name ? this.name : "";
        var surname = this.surname ? this.surname : "";
        var fullName = _.trim(name + " " + surname);
        return fullName;
    },
    getType: function() {
        return 'user';
    },
    getCollaborationGroups: function() {
        return _.map(this.collaborations, 'group');
    },
    isAdmin: function() {
        return this.role === this.ADMINISTRATOR;
    },
    admins: function(group) {
        var administeredGroupsId = _.map(this.admininstratedGroups, 'id');
        return _.includes(administeredGroupsId, group.id);
    },
    //sTODO: move to a service
    getReferenceBrowsingUrl: function(){
        return '/users/' + this.id + '/references'; 
    },
    getProfileUrl: function(){
        return '/users/' + this.id + '/edit'; 
    },
    getNewReferenceUrl: function(){
        return "/users/" + this.id + "/references/new"; 
    },
    getExternalConnectors: function() {
        var connectors = [];
        var publicationsConnector = {name: 'Publications', enabled: true};
        connectors.push(publicationsConnector);
        return connectors;
    }
};

//sTodo: evaluating wheter to reformat in a constructor style
Scientilla.reference = {
    UNKNOWN_REFERENCE:0,
    USER_REFERENCE: 1,
    GROUP_REFERENCE: 2,
    DRAFT: 'draft',
    VERIFIED: 'verified',
    PUBLIC: 'public',
    create: function (referenceData, creator) {
        var fields = [
            'authors',
            'title',
            'status'
        ];
        var reference = _.pick(referenceData, fields);
        if (creator.getType() === 'user')
            reference.draftCreator = creator.id;
        else
            reference.draftGroupCreator = creator.id;
        reference.draft = true;
        _.extend(reference, Scientilla.reference);
        return reference;
    },
    getAllCoauthors: function() {
        return _.union(this.privateCoauthors, this.publicCoauthors);
    },
    getType: function () {
        if (!!this.owner)
            return this.USER_REFERENCE;
        else if (!!this.groupOwner)
            return this.GROUP_REFERENCE;
        else
            return this.UNKNOWN_REFERENCE;
    },
    getAuthors: function () {
        if (!this.authors)
            return [];

        return this.authors.replace(/\s+et all\s*$/i, '').split(',').map(_.trim);
    },
    getUcAuthors: function () {
        var authors = this.getAuthors();
        var ucAuthors = _.map(authors, function (a) {
            return a.toUpperCase();
        });
        return ucAuthors;
    },
    getDisplayName: function () {
        return this.getDisplayName();
    },
    getNewGroupReference: function (groupId) {
        return {
            title: "",
            authors: "",
            draftGroupCreator: groupId,
            draft: true
        };
    },
    getNewDraftReference: function (userId) {
        return {
            title: "",
            authors: "",
            draftCreator: userId,
            draft: true
        };
    },
    getDraftCreator: function () {
        if (this.draftCreator)
            return this.draftCreator;
        return this.draftGroupCreator;
    }
};

Scientilla.membership = {
    getDisplayName: function () {
        //sTODO: to be removed when deep populate is implemented
        if (_.isFunction(this.user.getDisplayName))
            return this.user.getDisplayName();
        else
            return '';
    }
};

Scientilla.collaboration = {
    getDisplayName: function () {
        //sTODO: to be removed when deep populate is implemented
        if (_.isFunction(this.group.getDisplayName))
            return this.group.getDisplayName();
        else
            return '';
    }
};

Scientilla.group = {
    getDisplayName: function() {
        return this.name;
    },
    getType: function() {
        return 'group';
    },
    //sTODO: move to a service
    getReferenceBrowsingUrl: function(){
        return '/groups/' + this.id + '/references'; 
    },
    getProfileUrl: function(){
        return '/groups/' + this.id + '/edit'; 
    },
    getNewReferenceUrl: function(){
        return "/groups/" + this.id + "/references/new"; 
    },
    getExternalConnectors: function() {
        var connectors = [];
        var publicationsConnector = {name: 'Publications', enabled: !!this.publicationsAcronym};
        connectors.push(publicationsConnector);
        return connectors;
    }
};