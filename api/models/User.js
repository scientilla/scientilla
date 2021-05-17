/*global require, User, Group, Document, sails, Alias, Auth, Authorship, SqlService, PerformanceCalculator, DocumentKinds, DocumentNotDuplicate, ResearchEntity, Profile, ChartData */
'use strict';

/**
 * User
 *
 * @module      :: Model
 * @description :: This is the base user model
 * @docs        :: http://waterlock.ninja/documentation
 */

const assert = require('assert');
const _ = require('lodash');
const waterlock = require('waterlock');
const Promise = require("bluebird");
const SubResearchEntity = require('../lib/SubResearchEntity');

const USER = 'user';
const SUPERUSER = 'superuser';
const ADMINISTRATOR = 'administrator';
const EVALUATOR = 'evaluator';
const GUEST = 'guest';

module.exports = _.merge({}, SubResearchEntity, {
    DEFAULT_SORTING: {
        surname: 'asc',
        name: 'asc',
        updatedAt: 'desc'
    },
    USER: USER,
    SUPERUSER: SUPERUSER,
    ADMINISTRATOR: ADMINISTRATOR,
    EVALUATOR: EVALUATOR,
    GUEST: GUEST,
    attributes: require('waterlock').models.user.attributes({
        //Constants
        username: {
            type: 'email',
            defaultsTo: "",
            unique: true
        },
        name: {
            type: 'STRING',
            defaultsTo: ""
        },
        surname: {
            type: 'STRING',
            defaultsTo: ""
        },
        slug: {
            type: 'STRING',
            unique: true,
            alphanumericdashed: true,
            minLength: 3,
            defaultsTo: ""
        },
        alreadyAccess: {
            type: "BOOLEAN",
            defaultsTo: false
        },
        alreadyOpenedSuggested: {
            type: "BOOLEAN",
            defaultsTo: false
        },
        already_changed_profile: {
            type: "BOOLEAN",
            defaultsTo: false
        },
        role: {
            type: 'STRING',
            enum: [
                USER,
                SUPERUSER,
                ADMINISTRATOR,
                EVALUATOR,
                GUEST
            ],
            defaultsTo: USER
        },
        orcidId: {
            type: 'STRING'
        },
        scopusId: {
            type: 'STRING'
        },
        jobTitle: {
            type: 'STRING'
        },
        displayName: {
            columnName: 'display_name',
            type: 'STRING',
            defaultsTo: ""
        },
        displaySurname: {
            columnName: 'display_surname',
            type: 'STRING',
            defaultsTo: ""
        },
        config: {
            type: 'JSON'
        },
        researchEntity: {
            columnName: 'research_entity',
            model: 'researchentity'
        },
        drafts: {
            collection: 'Document',
            via: 'draftCreator'
        },
        documents: {
            collection: 'Document',
            via: 'users',
            through: 'authorship'
        },
        publicDocuments: {
            collection: 'Document',
            via: 'researchEntity',
            through: 'publicauthorship'
        },
        disseminationTalks: {
            collection: 'Document',
            via: 'researchEntity',
            through: 'disseminationtalk'
        },
        scientificTalks: {
            collection: 'Document',
            via: 'researchEntity',
            through: 'scientifictalk'
        },
        publications: {
            collection: 'Document',
            via: 'researchEntity',
            through: 'publication'
        },
        highImpactPublications: {
            collection: 'Document',
            via: 'researchEntity',
            through: 'highimpactpublication'
        },
        favoritePublications: {
            collection: 'Document',
            via: 'researchEntity',
            through: 'favoritepublication'
        },
        oralPresentations: {
            collection: 'Document',
            via: 'researchEntity',
            through: 'oralpresentation'
        },
        suggestedDocuments: {
            collection: 'Document',
            via: 'users',
            through: 'documentsuggestion'
        },
        favoriteDocuments: {
            collection: 'Document',
            via: 'users',
            through: 'favoritedocument'
        },
        externalDocuments: {
            collection: 'document',
            via: 'researchEntity',
            through: 'externaldocument'
        },
        authorships: {
            collection: 'authorship',
            via: 'researchEntity',
        },
        discardedDocuments: {
            collection: 'Document',
            via: 'discardedCoauthors',
            through: 'discardeddocument'
        },
        jsonWebTokens: {
            collection: 'jwt',
            via: 'owner'
        },
        aliases: {
            collection: 'alias',
            via: 'user'
        },
        administratedGroups: {
            collection: 'group',
            via: 'administrators',
            through: 'groupadministrator'
        },
        managedGroups: {
            collection: 'group',
            via: 'pi',
            through: 'principalinvestigator'
        },
        memberships: {
            collection: 'Group',
            via: 'members',
            through: 'membership'
        },
        groupMemberships: {
            collection: 'Membership',
            via: 'user',
        },
        attributes: {
            collection: 'Attribute',
            through: 'userattribute'
        },
        userData: {
            collection: 'userData',
            via: 'user',
            unique: true
        },
        lastsynch: 'datetime',
        active: {
            type: "BOOLEAN",
            defaultsTo: true
        },
        synchronized: {
            type: "BOOLEAN",
            defaultsTo: false
        },
        contractEndDate: {
            type: 'datetime',
            columnName: 'contract_end_date'
        },
        cid: {
            type: 'STRING'
        },
        getAliases: async function () {
            const aliases = await Alias.find({user: this.id});
            if (!aliases)
                return [];
            return aliases.map(a => a.str);
        },
        getType: function () {
            return 'user';
        },
        getModel: function () {
            return User;
        },
        getDocumentNotDuplicateModel: function () {
            return DocumentNotDuplicate;
        },
    }),
    getDocumentNotDuplicateModel: () => DocumentNotDuplicate,
    getAdministeredGroups: function (userId) {
        return User.findOneById(userId)
            .populate('administratedGroups')
            .then(function (user) {
                return user.administratedGroups;
            });
    },
    setSlug: async function (user) {
        const name = user.displayName ? user.displayName : user.name;
        const surname = user.displaySurname ? user.displaySurname : user.surname;

        // Create basic slug
        let basicSlug = Utils.stringToSlug([name, surname].filter(s => s).join('-'));

        // Check if slug is longer than 3 characters, validation is set to three
        if (basicSlug.length < 3) {
            basicSlug = new Date.toString();
        }

        let slug = basicSlug;
        let slugNumber = 1;
        while (true) {
            // Find user by slug except user itself
            let otherUsersBySlug = await User.find({
                slug: slug
            });
            otherUsersBySlug = otherUsersBySlug.filter(u => u.id !== user.id);

            // No user found, break loop
            if (otherUsersBySlug.length === 0)
                break;

            // Otherwise add number to slug and try again
            slug = basicSlug + slugNumber;

            // Increase by one
            slugNumber++;
        }

        user.slug = slug;
        return user;
    },
    createUserWithoutAuth: async (newUser) => {
        // Lowercase email
        newUser.username = _.toLower(newUser.username);

        try {
            // Check if username is unique
            await User.checkUsername(newUser);

            // Add the role to the user
            await User.setNewUserRole(newUser);

            // Set the slug for the user
            await User.setSlug(newUser);

            // Return created user
            return User.create(newUser);
        } catch(e) {
            sails.log.debug(`Couldn't create an user for ${newUser.username}`);
            sails.log.debug(e);
        }

    },
    setNewUserRole: function (user) {
        return User
            .count()
            .then(function (usersNum) {
                usersNum === 0 ? user.role = ADMINISTRATOR : user.role = USER;
                return user;
            });
    },
    checkUsername: async function (user) {
        if (!_.isEmpty(user.username)) {
            const sameUsernameUsers = await User.findByUsername(user.username);
            if (sameUsernameUsers.length > 0) {
                throw new Error('Username already used');
            }
        }
    },
    generateAliasesStr(name, surname) {
        if (_.isEmpty(name) || _.isEmpty(surname))
            return [];

        function capitalizeAll(str, wordSeparators) {
            function capitalize(str) {
                return str.charAt(0).toLocaleUpperCase() + str.slice(1);
            }

            let retStr = str.toLocaleLowerCase();
            for (const c of wordSeparators)
                retStr = retStr.split(c).map(capitalize).join(c);
            return retStr
        }

        const separators = [' ', '-', '.'];
        const nameInitials = name.split(' ').map(n => n[0]).join('.') + '.';

        const ret = [
            capitalizeAll(surname + ' ' + nameInitials, separators),
            capitalizeAll(surname.replace(' ', '-') + ' ' + nameInitials, separators),
        ]

        return _.uniq(ret);
    },
    createAliases: async function (user) {
        let generatedAliasesStr = User.generateAliasesStr(user.name, user.surname)

        if (_.has(user, 'displayName') && _.has(user, 'displaySurname')) {
            generatedAliasesStr = generatedAliasesStr.concat(User.generateAliasesStr(user.displayName, user.displaySurname));
        }

        const aliases = _.uniq(generatedAliasesStr).map(str => ({
            user: user.id,
            str: str
        }));

        const newAliases = [];
        for (const alias of aliases) {
            const foundAlias = await Alias.findOne(alias);
            if (!foundAlias) {
                newAliases.push(alias);
            }
        }

        if (!_.isEmpty(newAliases)) {
            await Alias.create(newAliases);
        }
    },
    getAuthorshipsData: async function (document, researchEntityId, verificationData = {}) {
        const user = await User.findOneById(researchEntityId);

        if (!user)
            return {
                isVerifiable: false,
                error: 'User not found',
                item: researchEntityId
            };

        const position = !_.isNil(verificationData.position) ? verificationData.position : await document.getAuthorIndex(user);

        const authors = document.getAuthors();
        if (position >= authors.length)
            return {
                isVerifiable: false,
                error: "Document Verify fail: position not valid",
                document: document
            };

        const authorStr = authors[position];

        const authorship = document.getAuthorshipByPosition(position) || Authorship.getEmpty(authorStr, position, document.id);
        //TODO: [Accrocchio] remove when deep populate is added to waterline
        assert(!_.isNil(document.affiliations), 'getAuthorshipAffiliations: affiliations missing');

        const affiliations = document.affiliations
            .filter(a => a.authorship === authorship.id)
            .map(a => a.institute);
        //[/Accrocchio]

        const affiliationInstituteIds = !_.isEmpty(verificationData.affiliationInstituteIds) ? verificationData.affiliationInstituteIds : affiliations;


        if (_.isEmpty(affiliationInstituteIds) || _.isNil(position))
            return {
                isVerifiable: false,
                error: "Document Verify fail: affiliation or position not specified",
                document: document
            };


        return {
            isVerifiable: true,
            position: authorship.position,
            authorStr: authorStr,
            affiliationInstituteIds,
            document: document,
            corresponding: !_.isNil(verificationData.corresponding) ? verificationData.corresponding : authorship.corresponding,
            synchronize: !_.isNil(verificationData.synchronize) ? verificationData.synchronize : document.synchronized,
            'public': !_.isNil(verificationData.public) ? verificationData.public : authorship.public,
            first_coauthor: !_.isNil(verificationData.first_coauthor) ? verificationData.first_coauthor : authorship.first_coauthor,
            last_coauthor: !_.isNil(verificationData.last_coauthor) ? verificationData.last_coauthor : authorship.last_coauthor,
            oral_presentation: !_.isNil(verificationData.oral_presentation) ? verificationData.oral_presentation : authorship.oral_presentation
        };
    },
    getDocumentVerifyErrors: async function (researchEntityId, document, verificationData, check = true, docToRemove) {
        const alreadyVerifiedDocuments = await Authorship.find({
            document: document.id,
            researchEntity: researchEntityId
        });
        if (alreadyVerifiedDocuments.length)
            return {
                error: 'Document already verified',
                item: researchEntityId
            };

        if (!document || document.kind !== DocumentKinds.VERIFIED)
            return {
                error: 'Document not found',
                item: researchEntityId
            };

        if (check && (await SubResearchEntity.getDuplicates(User, researchEntityId, document, docToRemove)).length > 0) {
            return {
                error: 'Documents must be compared',
                item: document
            };
        }

        const searchCond = {
            scopusId: document.scopusId
        };
        if (docToRemove)
            searchCond.id = {'!': docToRemove};

        if (check && document.scopusId) {
            const alreadyVerifiedDocuments = (await User
                .findOne(researchEntityId)
                .populate('documents', searchCond)).documents;
            if (alreadyVerifiedDocuments.length)
                return {
                    error: 'Document already verified (duplicated scopusId)',
                    item: document
                };
        }
        const authorshipData = await User.getAuthorshipsData(document, researchEntityId, verificationData);

        if (!authorshipData) {
            return null;
        }

        if (!authorshipData.isVerifiable)
            return {
                error: authorshipData.error,
                item: authorshipData.document
            };

        if (authorshipData.document.isPositionVerified(authorshipData.position)) {
            if (docToRemove) {
                const a = authorshipData.document.getAuthorshipByPosition(authorshipData.position);
                if (a && a.researchEntity === researchEntityId) {
                    return null;
                }
            }

            return {
                error: "The position is already verified",
                item: authorshipData.document
            };
        }
        return null;
    },
    getDraftVerifyErrors: async function (researchEntityId, draft, verificationData, check, docToRemove) {
        if (!draft || draft.kind !== DocumentKinds.DRAFT)
            return {
                error: 'Document not found',
                item: null
            };
        if (!draft.isValid())
            return {
                error: 'Document not valid for verification',
                item: draft
            };
        if (check && (await SubResearchEntity.getDuplicates(User, researchEntityId, draft, docToRemove)).length > 0) {
            return {
                error: 'Documents must be compared',
                item: draft
            };
        }
        if (check && draft.scopusId) {
            const searchCond = {
                scopusId: draft.scopusId
            };
            if (docToRemove)
                searchCond.id = {'!': docToRemove};
            const alreadyVerifiedDocuments = (await User
                .findOne(researchEntityId)
                .populate('documents', searchCond)).documents;
            if (alreadyVerifiedDocuments.length)
                return {
                    error: 'Document already verified (duplicated scopusId)',
                    item: draft
                };
        }

        const authorshipData = await User.getAuthorshipsData(draft, researchEntityId, verificationData);

        if (!authorshipData.isVerifiable)
            return {
                error: authorshipData.error,
                item: authorshipData.document
            };

        const documentCopies = await Document.findCopies(draft, authorshipData.position);

        const n = documentCopies.length;
        if (n === 0)
            return null;
        const docToVerify = documentCopies[0];

        if (docToVerify.isPositionVerified(authorshipData.position)) {
            const authorName = docToVerify.authorsStr.split(', ')[authorshipData.position];
            if (docToRemove) {
                const a = docToVerify.getAuthorshipByPosition(authorshipData.position);
                if (a && a.researchEntity === researchEntityId) {
                    return null;
                }
            }
            return {
                error: `You cannot verify this document as ${authorName} because someone else already claimed to be that author`,
                item: docToVerify
            };
        }
        return null;
    },
    doVerifyDocument: async function (document, researchEntityId, authorshipData) {
        await User.removeDiscarded(User, researchEntityId, document.id);
        if (authorshipData.position < 0)
            return {
                error: "User not selected",
                item: authorshipData.document
            };
        const newAuthorship = Authorship.filterFields(authorshipData);
        newAuthorship.researchEntity = researchEntityId;
        newAuthorship.document = document.id;
        newAuthorship.affiliations = authorshipData.affiliationInstituteIds;

        const authorshipFindCriteria = {
            document: newAuthorship.document,
            position: newAuthorship.position
        };

        await Authorship.destroy(authorshipFindCriteria);
        const authorship = await Authorship.create(newAuthorship);
        _.assign(authorship, newAuthorship);
        await authorship.savePromise();

        await Alias.addAlias(researchEntityId, document.authorsStr, authorshipData.position);

        const index = document.authorships.map(a => a.position).indexOf(authorshipData.position);
        if (index !== -1)
            document.authorships.splice(index, 1);

        document.authorships.push(authorship);
        return document;
    },
    afterCreate: async function (user, cb) {
        if (!user.id)
            return cb();

        await ResearchEntity.createResearchEntity(User, user, 'user');

        await User.createAliases(user);

        cb();
    },
    afterDestroy: async function (destroyedUsers, proceed) {
        // Loop over destroyed users
        for (const user of destroyedUsers) {
            // Delete ResearchEntity record of user
            await ResearchEntity.destroy({id: user.researchEntity});

            // Delete ChartData record of user
            await ChartData.destroy({
                researchEntityType: 'user',
                researchEntity: user.id
            });
        }

        proceed();
    },
    isInternalUser: function (user) {
        return _.endsWith(user.username, '@' + sails.config.scientilla.ldap.domain);
    },
    getAuthorshipModel: function () {
        return Authorship;
    },
    updateProfile: async function (userId, userData) {
        let aliases;
        if (_.isArray(userData.aliases)) {
            aliases = userData.aliases;
            delete userData.aliases;
        }
        const oldResearchEntity = await User.findOne({id: userId});
        const res = await User.update({id: userId}, userData);
        const newResearchEntity = res[0];

        if (aliases && userId)
            Alias.createOrUpdateAll(userId, aliases);

        const command = 'import:external:user:' + newResearchEntity.id;
        if (newResearchEntity.scopusId !== oldResearchEntity.scopusId)
            GruntTaskRunner.run(command + ':' + DocumentOrigins.SCOPUS);

        return newResearchEntity;
    },
    getMBOOverallPerformance: async function (username, year) {
        if (username) {
            const user = await User.findOne({username}).populate('documents');
            if (!user)
                throw 'User not found';
            return await PerformanceCalculator.getUserPerformance(user, year);
        }

        return await PerformanceCalculator.getUsersPerformance(year);
    },
    getMBOInstitutePerformance: async function (username, year) {
        if (username) {
            const user = await User.findOne({username}).populate('documents');
            if (!user)
                throw 'User not found';
            return await PerformanceCalculator.getUserInstitutePerformance(user, year);
        }

        return await PerformanceCalculator.getUsersInstitutePerformance(year);
    },
    getMBOInvitedTalks: async function (username, year) {
        if (username) {
            const user = await User.findOne({username}).populate('documents');
            if (!user)
                throw 'User not found';
            return await PerformanceCalculator.getUserMBOInvitedTalks(user, year);
        }

        return await PerformanceCalculator.getUsersMBOInvitedTalks(year);
    }
});