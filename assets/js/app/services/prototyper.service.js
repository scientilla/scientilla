"use strict";
(function () {

    angular.module("components").factory("Prototyper", Prototyper);

    Prototyper.$inject = [
        'userConstants'
    ];

    function Prototyper(userConstants) {
        const service = {
            toUserModel: toUserModel,
            toUsersCollection: toUsersCollection,
            toGroupModel: toGroupModel,
            toGroupsCollection: toGroupsCollection,
            toDocumentModel: toDocumentModel,
            toDocumentsCollection: toDocumentsCollection,
            toCollaborationModel: toCollaborationModel,
            toCollaborationsCollection: toCollaborationsCollection,
            toMembershipModel: toMembershipModel,
            toMembershipsCollection: toMembershipsCollection
        };
        const userPrototype = {
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
            getType: function () {
                return 'user';
            },
            getCollaborationGroups: function () {
                return _.map(this.collaborations, 'group');
            },
            isAdmin: function () {
                return this.role === userConstants.role.ADMINISTRATOR;
            },
            admins: function (group) {
                var administeredGroupsId = _.map(this.admininstratedGroups, 'id');
                return _.includes(administeredGroupsId, group.id);
            },
            getExternalConnectors: function () {
                var connectors = [];
                var publicationsConnector = {name: 'Publications', enabled: true};
                var orcidConnector = {name: 'ORCID', enabled: !!this.orcidId};
                var scopusConnector = {name: 'Scopus', enabled: !!this.scopusId};
                connectors.push(publicationsConnector);
                connectors.push(orcidConnector);
                connectors.push(scopusConnector);
                return connectors;
            },
            getNewDocument: function (documentTypeObj) {
                var documentData = {
                    draftCreator: this.id,
                    draft: true,
                    type: documentTypeObj.key,
                    sourceType: documentTypeObj.defaultSource
                };
                return documentPrototype.create(documentData);
            },
            getProfileUrl: function () {
                return '/users/' + this.id;
            }

        };
        const groupPrototype = {
            getDisplayName: function () {
                return this.name;
            },
            getType: function () {
                return 'group';
            },
            getExternalConnectors: function () {
                var connectors = [];
                var publicationsConnector = {name: 'Publications', enabled: !!this.publicationsAcronym};
                var scopusConnector = {name: 'Scopus', enabled: !!this.scopusId};
                connectors.push(publicationsConnector);
                connectors.push(scopusConnector);
                return connectors;
            },
            getNewDocument: function (documentTypeObj) {
                var documentData = {
                    draftCreator: this.id,
                    draft: true,
                    type: documentTypeObj.key,
                    sourceType: documentTypeObj.defaultSource
                };
                return documentPrototype.create(documentData);
            },
            getProfileUrl: function () {
                return '/groups/' + this.id;
            }
        };

        const documentPrototype = {
            UNKNOWN_REFERENCE: 0,
            USER_REFERENCE: 1,
            GROUP_REFERENCE: 2,
            DRAFT: 'draft',
            VERIFIED: 'verified',
            PUBLIC: 'public',
            tags: [],
            fields: [
                'authors',
                'title',
                'year',
                'journal',
                'issue',
                'volume',
                'pages',
                'articleNumber',
                'doi',
                'bookTitle',
                'editor',
                'publisher',
                'conferenceName',
                'conferenceLocation',
                'acronym',
                'abstract',
                'type',
                'sourceType',
                'scopusId',
                'wosId'
            ],
            create: function (referenceData) {
                var fields = _.union(['draft', 'draftCreator', 'draftGroupCreator'], documentPrototype.fields);
                var reference = _.pick(referenceData, fields);
                _.extend(reference, documentPrototype);
                return reference;
            },
            getAllCoauthors: function () {
                return this.authors;
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
                if (!this.authorsStr)
                    return [];

                return this.authorsStr.replace(/\s+et all\s*$/i, '').split(/,|\sand\s/).map(_.trim);
            },
            getUcAuthors: function () {
                var authorsStr = this.getAuthors();
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
                    authorsStr: "",
                    draftGroupCreator: groupId,
                    draft: true
                };
            },
            getNewDraftReference: function (userId) {
                return {
                    title: "",
                    authorsStr: "",
                    draftCreator: userId,
                    draft: true
                };
            },
            getDraftCreator: function () {
                if (this.draftCreator)
                    return this.draftCreator;
                return this.draftGroupCreator;
            },
            copyDocument: function (document, creator) {
                var excludedFields = ['draft', 'draftCreator', 'draftGroupCreator'];

                var documentTypeObj = {
                    key: document.type,
                    defaultSource: document.sourceType
                };

                var newDoc = creator.getNewDocument(documentTypeObj);

                _.forEach(documentPrototype.fields, function (key) {
                    if (_.includes(excludedFields, key))
                        return;

                    newDoc[key] = document[key];
                });

                return newDoc;
            },
            addTag: function (tag) {
                if (!this.tags.includes(tag))
                    this.tags.push(tag);
            },
            removeTag: function (tag) {
                _.remove(this.tags, tag);
            }

        };

        const membershipPrototype = {
            getDisplayName: function () {
                //sTODO: to be removed when deep populate is implemented
                if (_.isFunction(this.user.getDisplayName))
                    return this.user.getDisplayName();
                else
                    return '';
            }
        };

        const collaborationPrototype = {
            getDisplayName: function () {
                //sTODO: to be removed when deep populate is implemented
                if (_.isFunction(this.group.getDisplayName))
                    return this.group.getDisplayName();
                else
                    return '';
            }
        };

        function applyToAll(elems, fun) {
            _.forEach(elems, fun);
            return elems;
        }

        function toUserModel(user) {
            _.defaultsDeep(user, userPrototype);
            toDocumentsCollection(user.documents);
            toGroupsCollection(user.admininstratedGroups);
            toCollaborationsCollection(user.collaborations);
            return user;
        }

        function toGroupModel(group) {
            _.defaultsDeep(group, groupPrototype);
            toMembershipsCollection(group.memberships)
            toUsersCollection(group.administrators);
            toDocumentsCollection(group.documents);
            return group;
        }

        function toDocumentModel(document) {
            _.defaultsDeep(document, documentPrototype);
            toUsersCollection(document.authors);
            return document;
        }

        function toMembershipModel(membership) {
            _.defaultsDeep(membership, membershipPrototype);
            toUserModel(membership.user);
            return membership
        }

        function toCollaborationModel(collaboration) {
            _.defaultsDeep(collaboration, collaborationPrototype);
            toGroupModel(collaboration.group);
            return collaboration;
        }

        function toUsersCollection(users) {
            return applyToAll(users, toUserModel);
        }

        function toGroupsCollection(groups) {
            return applyToAll(groups, toGroupModel);
        }

        function toDocumentsCollection(documents) {
            return applyToAll(documents, toDocumentModel);
        }

        function toMembershipsCollection(membership) {
            return applyToAll(membership, toMembershipModel);
        }

        function toCollaborationsCollection(collaboration) {
            return applyToAll(collaboration, toCollaborationModel);
        }

        return service;
    }
})();
