/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 *
 * For more information on how policies work, see:
 * http://sailsjs.org/#!/documentation/concepts/Policies
 *
 * For more information on configuring policies, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.policies.html
 */

const _ = require('lodash');

const isLogged = ['isLogged'];
const isAdmin = ['isAdmin'];
const isActivityOwner = ['isActivityOwner'];
const isGroupOwner = ['isGroupOwner'];
const isResearchEntityOwner = ['isResearchEntityOwner'];
const hasValidAPIKey = ['hasValidAPIKey'];

const defaultPolicy = {
    '*': isLogged,
    findOne: true,
    find: true,
    populate: true,
    destroy: isAdmin,
    create: isAdmin,
    update: isAdmin
};

const defaultAdminPolicy = {
    '*': isAdmin,
    findOne: isAdmin,
    find: isAdmin,
    populate: isAdmin,
    destroy: isAdmin,
    create: isAdmin,
    update: isAdmin
};

module.exports.policies = {

    /***************************************************************************
     *                                                                          *
     * Default policy for all controllers and actions (`true` allows public     *
     * access)                                                                  *
     *                                                                          *
     ***************************************************************************/

    '*': true,

    /***************************************************************************
     *                                                                          *
     * Here's an example of mapping some policies to run before a controller    *
     * and its actions                                                          *
     *                                                                          *
     ***************************************************************************/

    AuthController: {
        '*': true
    },

    AliasController: defaultPolicy,

    AuthorshipController: defaultPolicy,

    AuthorshipGroupController: defaultPolicy,

    GroupController: _.defaults({
        getExternalDocuments: true,
        getChartsData: true,
        update: isGroupOwner,
        createDraft: isGroupOwner,
        createDrafts: isGroupOwner,
        verifyDraft: isGroupOwner,
        verifyDrafts: isGroupOwner,
        verifyDocument: isGroupOwner,
        verifyDocuments: isGroupOwner,
        discardDocument: isGroupOwner,
        discardDocuments: isGroupOwner,
        unverifyDocument: isGroupOwner,
        updateDraft: isGroupOwner,
        setAuthorships: isGroupOwner,
        deleteDraft: isGroupOwner,
        deleteDrafts: isGroupOwner,
        getPublicDocuments: true,
        getPublications: true,
        getHighImpactPublications: true,
        getFavoritePublications: true,
        getDisseminationTalks: true,
        getScientificTalks: true,
        getAccomplishments: true,
        getCompetitiveProjects: true,
        getIndustrialProjects: true,
        getPatentFamilies: true,
        getPatents: true,
        getMBOInstitutePerformance: true,
        getMBOInvitedTalks: true,
    }, defaultPolicy),

    InstituteController: defaultPolicy,

    MembershipController: defaultPolicy,

    MembershipGroupController: defaultPolicy,

    SettingsController: _.defaults({
        getSettings: true,
    }, defaultPolicy),

    SourceController: _.defaults({
        create: isLogged,
    }, defaultPolicy),

    SourceMetricSourceController: defaultPolicy,

    TaglabelController: defaultPolicy,

    UserController: _.defaults({
        jwt: true,
        getExternalDocuments: true,
        getChartsData: true,
        update: isActivityOwner,
        createDraft: isActivityOwner,
        createDrafts: isActivityOwner,
        verifyDraft: isActivityOwner,
        verifyDrafts: isActivityOwner,
        verifyDocument: isActivityOwner,
        verifyDocuments: isActivityOwner,
        discardDocument: isActivityOwner,
        discardDocuments: isActivityOwner,
        unverifyDocument: isActivityOwner,
        updateDraft: isActivityOwner,
        setAuthorships: isActivityOwner,
        deleteDraft: isActivityOwner,
        deleteDrafts: isActivityOwner,
        getPublicDocuments: true,
        getPublications: true,
        getHighImpactPublications: true,
        getFavoritePublications: true,
        getOralPresentations: true,
        getPublicProfile: hasValidAPIKey,
        getDisseminationTalks: true,
        getScientificTalks: true,
        getAccomplishments: true,
        getCompetitiveProjects: true,
        getIndustrialProjects: true,
        getPatentFamilies: true,
        getPatents: true,
        getMBOOverallPerformance: true,
        getMBOInstitutePerformance: true,
        getMBOInvitedTalks: true,
    }, defaultPolicy),

    UserDataController: _.defaults({
        '*': hasValidAPIKey,
        getProfileImage: true
    }, defaultPolicy),

    ResearchEntityController: _.defaults({
        createDraft: isResearchEntityOwner,
        updateDraft: isResearchEntityOwner,
        deleteDraft: isResearchEntityOwner,
        verify: isResearchEntityOwner,
        unverify: isResearchEntityOwner,
        getProfile: true,
        getEditProfile: isResearchEntityOwner,
        saveProfile: isResearchEntityOwner,
        exportProfile: isResearchEntityOwner,
        minMaxYears: isLogged,
    }, defaultPolicy),

    ResearchItemTypeController: defaultPolicy,

    PublicCompetitiveProjectsController: defaultPolicy,

    ProjectStatusController: defaultPolicy,

    DocumentController: _.defaults({
        export: isLogged,
    }, defaultPolicy),

    AccomplishmentController: _.defaults({
        export: isLogged,
    }, defaultPolicy),

    ProjectController: _.defaults({
        export: isLogged,
    }, defaultPolicy),

    PatentController: _.defaults({
        export: isLogged,
    }, defaultPolicy),

    BackupController: _.defaults({
        getDumps: isAdmin,
        make: isAdmin,
        restore: isAdmin,
        upload: isAdmin,
        remove: isAdmin
    }, defaultAdminPolicy),

    CustomizeController: _.defaults({
        getCustomizations: true,
        setCustomizations: isAdmin,
        resetCustomizations: isAdmin
    }, defaultAdminPolicy),

    SourceMetricController: _.defaults({
        getMetrics: isAdmin,
        importMetrics: isAdmin,
        assignMetrics: isAdmin
    }, defaultAdminPolicy),

    LogController: _.defaults({
        getTasks: isAdmin,
        read: isAdmin
    }, defaultAdminPolicy),

    GeneralSettingsController: _.defaults({
        getByName: isAdmin,
        saveByName: isAdmin,
    }, defaultAdminPolicy),

    PersonController: _.defaults({
        getUniqueRoleCategories: isLogged,
        getUniqueNationalities: isLogged
    }, defaultPolicy)
};
