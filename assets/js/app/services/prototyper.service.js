(function () {
    "use strict";

    angular.module("services")
        .factory("Prototyper", Prototyper);

    Prototyper.$inject = [
        'userConstants',
        'DocumentLabels',
        'DocumentKinds'
    ];

    function Prototyper(userConstants, DocumentLabels, DocumentKinds) {
        const service = {
            toUserModel: toUserModel,
            toUsersCollection: applyToAll(toUserModel),
            toGroupModel: toGroupModel,
            toGroupsCollection: applyToAll(toGroupModel),
            toDocumentModel: toDocumentModel,
            toDocumentsCollection: applyToAll(toDocumentModel),
            toCollaborationModel: toCollaborationModel,
            toCollaborationsCollection: applyToAll(toCollaborationModel),
            toMembershipModel: toMembershipModel,
            toMembershipsCollection: applyToAll(toMembershipModel),
            toAuthorshipModel: toAuthorshipModel,
            toAuthorshipsCollection: applyToAll(toAuthorshipModel),
            toInstituteModel: toInstituteModel,
            toInstitutesCollection: applyToAll(toInstituteModel),
            toTagLabelModel: toTagLabelModel,
            toTagLabelsCollection: applyToAll(toTagLabelModel),
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
                var administeredGroupsId = _.map(this.administratedGroups, 'id');
                return _.includes(administeredGroupsId, group.id);
            },
            getExternalConnectors: function () {
                var connectors = [];
                var scopusConnector = {name: 'Scopus', enabled: !!this.scopusId};
                connectors.push(scopusConnector);
                return connectors;
            },
            getNewDocument: function (documentTypeObj) {
                var documentData = {
                    draftCreator: this.id,
                    kind: DocumentKinds.DRAFT,
                    type: documentTypeObj.key,
                    sourceType: documentTypeObj.defaultSource
                };
                return documentPrototype.create(documentData);
            },
            getProfileUrl: function () {
                return '/users/' + this.id;
            },
            getTagsByDocument: function (document) {
                if (!document.tagLabels || !document.userTags)
                    return [];

                var filteredUserTags = document.userTags.filter(function (ut) {
                    return ut.researchEntity === this.id;
                }.bind(this));

                return document.tagLabels.filter(function (tagLabel) {
                    return !!filteredUserTags.find(function (ut) {
                        return tagLabel.id === ut.tagLabel;
                    });
                });
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
                var scopusConnector = {name: 'Scopus', enabled: !!this.scopusId};
                connectors.push(scopusConnector);
                return connectors;
            },
            getNewDocument: function (documentTypeObj) {
                var documentData = {
                    draftCreator: this.id,
                    kind: DocumentKinds.DRAFT,
                    type: documentTypeObj.key,
                    sourceType: documentTypeObj.defaultSource
                };
                return documentPrototype.create(documentData);
            },
            getProfileUrl: function () {
                return '/groups/' + this.id;
            },
            getTagsByDocument: function (document) {
                if (!document.groupTagLabels || !document.groupTags)
                    return [];

                var filteredGroupTags = document.groupTags.filter(function (gt) {
                    return gt.researchEntity === this.id;
                }.bind(this));

                return document.groupTagLabels.filter(function (tagLabel) {
                    return !!filteredGroupTags.find(function (gt) {
                        return tagLabel.id === gt.tagLabel;
                    });
                });
            }
        };

        const documentPrototype = {
            UNKNOWN_DOCUMENT: 0,
            USER_DOCUMENT: 1,
            GROUP_DOCUMENT: 2,
            labels: [],
            fields: [
                'authorsStr',
                'title',
                'year',
                'itSource',
                'source',
                'issue',
                'volume',
                'pages',
                'articleNumber',
                'doi',
                'abstract',
                'type',
                'sourceType',
                'scopusId',
                'wosId',
                'authorships',
                'affiliations',
                'institutes'
            ],
            create: function (documentData) {
                var fields = _.union(['kind', 'draftCreator', 'draftGroupCreator'], documentPrototype.fields);
                var document = _.pick(documentData, fields);
                _.extend(document, documentPrototype);
                return document;
            },
            isValid: function () {
                const authorsStrRegex = /^((\w|-|')+(\s(\w|-|')+)*((\s|-)?\w\.)+)(,\s(\w|-|')+(\s(\w|-|')+)*((\s|-)?\w\.)+)*$/;
                const self = this;
                const requiredFields = [
                    'authorsStr',
                    'title',
                    'year',
                    'type',
                    'sourceType'
                ];
                // TODO: refactor, invited_talk should be read by a service;
                const invitedTalkType = 'invited_talk';
                if (this.type === invitedTalkType)
                    requiredFields.push('itSource');
                else
                    requiredFields.push('source');

                return _.every(requiredFields, function (v) {
                        return self[v];
                    }) && authorsStrRegex.test(self.authorsStr);
            },
            getAllCoauthors: function () {
                return this.authors;
            },
            getType: function () {
                if (!!this.owner)
                    return this.USER_DOCUMENT;
                else if (!!this.groupOwner)
                    return this.GROUP_DOCUMENT;
                else
                    return this.UNKNOWN_DOCUMENT;
            },
            getAuthors: function () {
                if (!this.authorsStr)
                    return [];

                return this.authorsStr.replace(/\s+et all\s*$/i, '').split(/,|\sand\s/).map(_.trim);
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
            getUserIndex: function (user) {
                var index = _.findIndex(this.getAuthors(), a => user.getAliases().includes(a));
                return index;
            },
            copyDocument: function (document, creator) {
                var excludedFields = ['kind', 'draftCreator', 'draftGroupCreator'];

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
            addLabel: function (label) {
                if (!this.hasLabel(label))
                    this.labels.push(label);
            },
            removeLabel: function (label) {
                _.remove(this.labels, function (t) {
                    return t === label;
                });
            },
            hasLabel: function (label) {
                return this.labels.includes(label);
            },
            isDiscarded: function () {
                return this.hasLabel(DocumentLabels.DISCARDED);
            },
            isUnverifying: function () {
                return this.hasLabel(DocumentLabels.UVERIFYING);
            },
            getInstituteIdentifier: function (instituteIndex) {
                const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
                if (instituteIndex < alphabet.length)
                    return alphabet[instituteIndex];
                const getBaseLog = (y, x) => Math.log(y) / Math.log(x);
                const firstLetter = alphabet [Math.floor(getBaseLog(instituteIndex, alphabet.length)) - 1];
                const secondLetter = alphabet [instituteIndex % alphabet.length];
                return firstLetter + secondLetter;
            }

        };

        const membershipPrototype = {
            getDisplayName: function () {
                if (_.isFunction(this.user.getDisplayName))
                    return this.user.getDisplayName();
                else
                    return '';
            }
        };

        const collaborationPrototype = {
            getDisplayName: function () {
                if (_.isFunction(this.group.getDisplayName))
                    return this.group.getDisplayName();
                else
                    return '';
            }
        };

        const authorshipPrototype = {};

        const institutePrototype = {
            getDisplayName: function () {
                return this.name;
            }
        };

        const tagLabelPrototype = {
            getDisplayName: function () {
                return this.value;
            }
        };

        function checkDuplicates(document) {
            if (document.duplicates && document.duplicates.length > 0) {
                document.addLabel(DocumentLabels.DUPLICATE);
            }
        }

        function initializeAffiliations(document) {
            _.forEach(document.authorships, a => {
                if (a.affiliations)
                    return;
                const authorships = _.filter(document.affiliations, {authorship: a.id});
                const institutes = _.filter(document.institutes, i => authorships.some(a => a.institute === i.id));
                a.affiliations = institutes;
            });
        }

        function applyToAll(fun) {
            return function (elems) {
                _.forEach(elems, fun);
                return elems;
            };
        }

        function toUserModel(user) {
            _.defaultsDeep(user, userPrototype);
            service.toDocumentsCollection(user.documents);
            service.toGroupsCollection(user.memberships);
            service.toGroupsCollection(user.administratedGroups);
            service.toCollaborationsCollection(user.collaborations);
            return user;
        }

        function toGroupModel(group) {
            _.defaultsDeep(group, groupPrototype);
            service.toUsersCollection(group.members);
            service.toUsersCollection(group.administrators);
            service.toDocumentsCollection(group.documents);
            return group;
        }

        function toDocumentModel(document) {
            initializeAffiliations(document);
            _.defaultsDeep(document, documentPrototype);
            service.toUsersCollection(document.authors);
            service.toTagLabelsCollection(document.tagLabels);
            service.toTagLabelsCollection(document.groupTagLabels);
            service.toAuthorshipsCollection(document.authorships);
            checkDuplicates(document);
            return document;
        }

        function toMembershipModel(membership) {
            _.defaultsDeep(membership, membershipPrototype);
            service.toUserModel(membership.user);
            return membership;
        }

        function toCollaborationModel(collaboration) {
            _.defaultsDeep(collaboration, collaborationPrototype);
            service.toGroupModel(collaboration.group);
            return collaboration;
        }

        function toAuthorshipModel(authorship) {
            _.defaultsDeep(authorship, authorshipPrototype);
            service.toInstitutesCollection(authorship.affiliations);
            return authorship;
        }

        function toInstituteModel(institute) {
            _.defaultsDeep(institute, institutePrototype);
            return institute;
        }

        function toTagLabelModel(tagLabel) {
            _.defaultsDeep(tagLabel, tagLabelPrototype);
            return tagLabel;
        }

        return service;
    }
})();
