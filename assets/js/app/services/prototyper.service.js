(function () {
    "use strict";

    angular.module("services")
        .factory("Prototyper", Prototyper);

    Prototyper.$inject = [
        'userConstants',
        'DocumentLabels',
        'DocumentKinds',
        'documentFieldsRules',
        'documentOrigins'
    ];

    function Prototyper(userConstants, DocumentLabels, DocumentKinds, documentFieldsRules, documentOrigins) {
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
                return this.aliases.map(a => a.str);
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
                var publicationsConnector = {value: 'publications', label: 'Publications', enabled: true};
                var scopusConnector = {value: 'scopus', label: 'Scopus', enabled: !!this.scopusId};
                connectors.push(publicationsConnector);
                connectors.push(scopusConnector);
                return connectors;
            },
            getNewDocument: function (documentTypeObj) {
                var documentData = {
                    draftCreator: this.id,
                    kind: DocumentKinds.DRAFT,
                    type: documentTypeObj.key,
                    sourceType: documentTypeObj.defaultSource,
                    origin: documentOrigins.SCIENTILLA
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
                var publicationsConnector = {
                    value: 'publications',
                    label: 'Publications',
                    enabled: !!this.publicationsAcronym
                };
                var scopusConnector = {value: 'scopus', label: 'Scopus', enabled: !!this.scopusId};
                connectors.push(publicationsConnector);
                connectors.push(scopusConnector);
                return connectors;
            },
            getNewDocument: function (documentTypeObj) {
                var documentData = {
                    draftCreator: this.id,
                    kind: DocumentKinds.DRAFT,
                    type: documentTypeObj.key,
                    sourceType: documentTypeObj.defaultSource,
                    origin: documentOrigins.SCIENTILLA
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
            },
            getActiveMembers: function () {
                return this.members.filter(u => {
                    const userMembersihp = this.memberships.find(m => m.user === u.id);
                    return userMembersihp && userMembersihp.synchronized && userMembersihp.active;
                });
            },
            getCollaborators: function () {
                return this.members.filter(u => {
                    const userMembersihp = this.memberships.find(m => m.user === u.id);
                    return userMembersihp && !userMembersihp.synchronized && userMembersihp.active;
                });
            },
            getFormerMembers: function () {
                return this.members.filter(u => {
                    const userMembersihp = this.memberships.find(m => m.user === u.id);
                    return userMembersihp && !userMembersihp.active;
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
                'institutes',
                'synchronized',
                'origin'
            ],
            create: function (documentData) {
                var fields = _.union(['kind', 'draftCreator', 'draftGroupCreator'], documentPrototype.fields);
                var document = _.pick(documentData, fields);
                _.extend(document, documentPrototype);
                return document;
            },
            isValid: function () {
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

                return _.every(requiredFields, v => this[v]) &&
                    _.every(documentFieldsRules, (rule, k) => {
                        if (!this[k]) return rule.allowNull;
                        return rule.regex.test(this[k]);
                    });
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

                return this.authorsStr.replace(/\s+et all\s*$/i, '').split(/,\s*/).map(_.trim);
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
                const authors = this.getAuthors().map(a => a.toLocaleLowerCase());
                const aliases = user.getAliases().map(a => a.toLocaleLowerCase());
                return _.findIndex(authors, a => aliases.includes(a));
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
                const base26Chars = "0123456789abcdefghijklmnopqrstuvwxyz".split("");
                const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
                const alphabetMapper = {};
                alphabet.forEach((v, i) => alphabetMapper[base26Chars[i]] = v);
                const base26Value = instituteIndex.toString(alphabet.length).split('');
                if (base26Value.length > 1)
                    base26Value[0] = base26Chars[base26Chars.indexOf(base26Value[0]) - 1];

                return base26Value.map(c => alphabetMapper[c]).join('');
            },
            isSuggested: function (researchEntity) {
                const f = researchEntity.getType() === 'user' ? 'authors' : 'groups';
                return this.kind === DocumentKinds.VERIFIED && !this[f].some(re => re.id === researchEntity.id);
            },
            isDraft: function () {
                return this.kind === DocumentKinds.DRAFT;
            },
            isVerified: function (researchEntity) {
                const f = researchEntity.getType() === 'user' ? 'authors' : 'groups';
                return this[f].some(re => re.id === researchEntity.id);
            },
            getStringKind(researchEntity) {
                if (this.isSuggested(researchEntity))
                    return 'Suggested';
                if (this.isDraft())
                    return 'Draft';
                if (this.isVerified(researchEntity))
                    return 'Verified';

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
            checkDuplicates(document);
            service.toUsersCollection(document.authors);
            service.toTagLabelsCollection(document.tagLabels);
            service.toTagLabelsCollection(document.groupTagLabels);
            service.toAuthorshipsCollection(document.authorships);
            return document;
        }

        function checkDuplicates(document) {
            document.isComparable = !document.isDraft() &&
                document.duplicates &&
                document.duplicates.length &&
                document.duplicates.every(d => d.duplicateKind === 'v');
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
