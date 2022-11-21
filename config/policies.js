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
const isActivityOwner = ['isActivityOwner'];
const isGroupOwner = ['isGroupOwner'];
const isResearchEntityOwner = ['isResearchEntityOwner'];
const hasValidAPIKey = ['hasValidAPIKey'];
const hasRole = require('../api/policies/hasRole.js');

const ROLES = {
    USER: 'user',
    SUPERUSER: 'superuser',
    ADMINISTRATOR: 'administrator',
    EVALUATOR: 'evaluator',
    GUEST: 'guest'
};

const defaultPolicy = {
    '*': isLogged,
    findOne: true,
    find: true,
    populate: true,
    destroy: hasRole([ROLES.ADMINISTRATOR]),
    create: hasRole([ROLES.ADMINISTRATOR]),
    update: hasRole([ROLES.ADMINISTRATOR])
};

const defaultAdminPolicy = {
    '*': hasRole([ROLES.ADMINISTRATOR]),
    findOne: hasRole([ROLES.ADMINISTRATOR]),
    find: hasRole([ROLES.ADMINISTRATOR]),
    populate: hasRole([ROLES.ADMINISTRATOR]),
    destroy: hasRole([ROLES.ADMINISTRATOR]),
    create: hasRole([ROLES.ADMINISTRATOR]),
    update: hasRole([ROLES.ADMINISTRATOR])
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
        getOralPresentations: true,
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
        aliases: isActivityOwner
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
        exportProfile: isResearchEntityOwner
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

    TrainingModuleController: _.defaults({
        export: isLogged,
    }, defaultPolicy),

    BackupController: _.defaults({
        getDumps: hasRole([ROLES.ADMINISTRATOR]),
        make: hasRole([ROLES.ADMINISTRATOR]),
        restore: hasRole([ROLES.ADMINISTRATOR]),
        upload: hasRole([ROLES.ADMINISTRATOR]),
        remove: hasRole([ROLES.ADMINISTRATOR]),
        download: hasRole([ROLES.ADMINISTRATOR])
    }, defaultAdminPolicy),

    CustomizeController: _.defaults({
        getCustomizations: true,
        setCustomizations: hasRole([ROLES.ADMINISTRATOR]),
        resetCustomizations: hasRole([ROLES.ADMINISTRATOR])
    }, defaultAdminPolicy),

    SourceMetricController: _.defaults({
        getMetrics: hasRole([ROLES.ADMINISTRATOR]),
        importMetrics: hasRole([ROLES.ADMINISTRATOR]),
        assignMetrics: hasRole([ROLES.ADMINISTRATOR])
    }, defaultAdminPolicy),

    LogController: _.defaults({
        getTasks: hasRole([ROLES.ADMINISTRATOR]),
        read: hasRole([ROLES.ADMINISTRATOR])
    }, defaultAdminPolicy),

    GeneralSettingsController: _.defaults({
        getByName: hasRole([ROLES.ADMINISTRATOR]),
        saveByName: hasRole([ROLES.ADMINISTRATOR])
    }, defaultAdminPolicy),

    PersonController: _.defaults({
        getUniqueRoleCategories: isLogged,
        getUniqueNationalities: isLogged
    }, defaultPolicy),

    AllMembershipController: defaultPolicy,

    AllMembershipGroupController: defaultPolicy,

    AgreementController: _.defaults({
        getUniquePartnerInstitutes: isLogged,
        export: isLogged
    }, defaultPolicy),

    PhdInstituteController: _.defaults({
        destroy: hasRole([ROLES.SUPERUSER, ROLES.ADMINISTRATOR]),
        create: hasRole([ROLES.SUPERUSER, ROLES.ADMINISTRATOR]),
        update: hasRole([ROLES.SUPERUSER, ROLES.ADMINISTRATOR])
    }, defaultPolicy),

    PhdCourseController: _.defaults({
        destroy: hasRole([ROLES.SUPERUSER, ROLES.ADMINISTRATOR]),
        create: hasRole([ROLES.SUPERUSER, ROLES.ADMINISTRATOR]),
        update: hasRole([ROLES.SUPERUSER, ROLES.ADMINISTRATOR])
    }, defaultPolicy),

    PhdCycleController: _.defaults({
        destroy: hasRole([ROLES.SUPERUSER, ROLES.ADMINISTRATOR]),
        create: hasRole([ROLES.SUPERUSER, ROLES.ADMINISTRATOR]),
        update: hasRole([ROLES.SUPERUSER, ROLES.ADMINISTRATOR])
    }, defaultPolicy),

    TaskController: _.defaults({
        run: hasRole([ROLES.SUPERUSER, ROLES.EVALUATOR, ROLES.ADMINISTRATOR]),
        isRunning: isLogged
    }, defaultAdminPolicy),

    AccessLogController: _.defaults({
        get: hasRole([ROLES.ADMINISTRATOR]),
        download: hasRole([ROLES.ADMINISTRATOR])
    }, defaultAdminPolicy),
};
