/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

const apiPrfx = '/api/v1';
const userUsernamePath = apiPrfx + '/users/username/:username';
const groupCodePath = apiPrfx + '/groups/slug/:slug';
const groupSlugPath = apiPrfx + '/groups/code/:code';

module.exports.routes = {
    /***************************************************************************
     *                                                                          *
     * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
     * etc. depending on your default view engine) your home page.              *
     *                                                                          *
     * (Alternatively, remove this and add an `index.html` file in your         *
     * `assets` directory)                                                      *
     *                                                                          *
     ***************************************************************************/

    '/': 'Homepage.default',
    [apiPrfx + '/ping']: 'Homepage.ping',
    [apiPrfx + '/login']: 'Auth.postLogin',
    [apiPrfx + '/logout']: 'Auth.postLogout',
    ['post ' + apiPrfx + '/auths/register']: 'Auth.register',
    ['post ' + apiPrfx + '/users/:researchEntityId/drafts']: 'User.createDraft',
    ['post ' + apiPrfx + '/groups/:researchEntityId/drafts']: 'Group.createDraft',
    ['put ' + apiPrfx + '/users/:researchEntityId/drafts/verify-drafts']: 'User.verifyDrafts',
    ['put ' + apiPrfx + '/groups/:researchEntityId/drafts/verify-drafts']: 'Group.verifyDrafts',
    ['put ' + apiPrfx + '/users/:researchEntityId']: 'User.updateSettings',
    ['put ' + apiPrfx + '/groups/:researchEntityId']: 'Group.updateSettings',
    ['delete ' + apiPrfx + '/users/:researchEntityId/drafts/:draftId']: 'User.deleteDraft',
    ['delete ' + apiPrfx + '/groups/:researchEntityId/drafts/:draftId']: 'Group.deleteDraft',
    ['put ' + apiPrfx + '/users/:researchEntityId/drafts/delete']: 'User.deleteDrafts',
    ['put ' + apiPrfx + '/groups/:researchEntityId/drafts/delete']: 'Group.deleteDrafts',
    ['put ' + apiPrfx + '/users/:researchEntityId/drafts/:id']: 'User.updateDraft',
    ['put ' + apiPrfx + '/groups/:researchEntityId/drafts/:id']: 'Group.updateDraft',
    ['put ' + apiPrfx + '/users/:researchEntityId/verify-documents']: 'User.verifyDocuments',
    ['put ' + apiPrfx + '/groups/:researchEntityId/verify-documents']: 'Group.verifyDocuments',
    ['put ' + apiPrfx + '/users/:researchEntityId/documents/:documentId/unverified']: 'User.unverifyDocument',
    ['put ' + apiPrfx + '/groups/:researchEntityId/documents/:documentId/unverified']: 'Group.unverifyDocument',
    ['post ' + apiPrfx + '/users/:researchEntityId/documents']: 'User.verifyDocument',
    ['post ' + apiPrfx + '/groups/:researchEntityId/documents']: 'Group.verifyDocument',
    ['post ' + apiPrfx + '/users/:researchEntityId/discarded-document']: 'User.discardDocument',
    ['post ' + apiPrfx + '/groups/:researchEntityId/discarded-document']: 'Group.discardDocument',
    ['post ' + apiPrfx + '/users/:researchEntityId/discarded-documents']: 'User.discardDocuments',
    ['post ' + apiPrfx + '/groups/:researchEntityId/discarded-documents']: 'Group.discardDocuments',
    ['post ' + apiPrfx + '/users/:researchEntityId/copy-document']: 'User.copyDocument',
    ['post ' + apiPrfx + '/groups/:researchEntityId/copy-document']: 'Group.copyDocument',
    ['post ' + apiPrfx + '/users/:researchEntityId/copy-documents']: 'User.copyDocuments',
    ['post ' + apiPrfx + '/groups/:researchEntityId/copy-documents']: 'Group.copyDocuments',
    ['put ' + apiPrfx + '/users/:researchEntityId/documents/:documentId/tags']: 'User.addTags',
    ['put ' + apiPrfx + '/groups/:researchEntityId/documents/:documentId/tags']: 'Group.addTags',
    ['put ' + apiPrfx + '/users/:researchEntityId/drafts/:draftId/verified']: 'User.verifyDraft',
    ['put ' + apiPrfx + '/groups/:researchEntityId/drafts/:draftId/verified']: 'Group.verifyDraft',
    ['put ' + apiPrfx + '/users/:researchEntityId/drafts/:draftId/synchronized']: 'Document.synchronizeDraft',
    ['put ' + apiPrfx + '/groups/:researchEntityId/drafts/:draftId/synchronized']: 'Document.synchronizeDraft',
    ['put ' + apiPrfx + '/users/:researchEntityId/desynchronize-documents']: 'Document.desynchronizeDrafts',
    ['put ' + apiPrfx + '/groups/:researchEntityId/desynchronize-documents']: 'Document.desynchronizeDrafts',
    ['put ' + apiPrfx + '/users/:researchEntityId/documents/:documentId/privacy']: 'User.setAuthorshipPrivacy',
    ['put ' + apiPrfx + '/groups/:researchEntityId/documents/:documentId/privacy']: 'Group.setAuthorshipPrivacy',
    ['put ' + apiPrfx + '/users/:researchEntityId/documents/:documentId/favorite']: 'User.setAuthorshipFavorite',
    ['put ' + apiPrfx + '/groups/:researchEntityId/documents/:documentId/favorite']: 'Group.setAuthorshipFavorite',
    ['get ' + apiPrfx + '/settings']: 'Settings.getSettings',
    ['get ' + apiPrfx + '/users/:id/charts']: 'User.getChartsData',
    ['get ' + apiPrfx + '/groups/:id/charts']: 'Group.getChartsData',
    ['put ' + apiPrfx + '/groups/:researchEntityId/drafts/:documentId/authorships']: 'Group.setAuthorhips',
    ['put ' + apiPrfx + '/users/:researchEntityId/drafts/:documentId/authorships']: 'User.setAuthorhips',
    ['get ' + apiPrfx + '/externals']: 'Document.externalSearch',
    ['post ' + apiPrfx + '/documents/export']: 'Document.export',
    ['post ' + apiPrfx + '/users/:researchEntityId/documents/:documentId/not-duplicates']: 'User.setDocumentsAsNotDuplicate',
    ['post ' + apiPrfx + '/groups/:researchEntityId/documents/:documentId/not-duplicates']: 'Group.setDocumentsAsNotDuplicate',
    ['post ' + apiPrfx + '/groups/:researchEntityId/remove-verify']: 'Group.removeVerify',
    ['post ' + apiPrfx + '/users/:researchEntityId/remove-verify']: 'User.removeVerify',
    ['post ' + apiPrfx + '/groups/:researchEntityId/replace']: 'Group.replace',
    ['post ' + apiPrfx + '/users/:researchEntityId/replace']: 'User.replace',
    ['get ' + apiPrfx + '/researchentities/:researchEntityId/min-max-years/:type/:section?']: 'ResearchEntity.minMaxYears',
    ['get ' + apiPrfx + '/people/unique-role-categories']: 'Person.getUniqueRoleCategories',
    ['get ' + apiPrfx + '/people/unique-nationalities']: 'Person.getUniqueNationalities',
    ['put ' + apiPrfx + '/users/:userId/aliases']: 'User.saveAliases',
    ['get ' + apiPrfx + '/agreements/unique-partner-institutes']: 'Agreement.getUniquePartnerInstitutes',
    ['get ' + apiPrfx + '/memberships/:groupId/get-collaborators']: 'Membership.getCollaborators',

    //Research item API
    ['put ' + apiPrfx + '/researchentities/:researchEntityId/researchitemdrafts/delete']: 'ResearchEntity.deleteDrafts',
    ['post ' + apiPrfx + '/researchentities/:researchEntityId/researchitemdrafts']: 'ResearchEntity.createDraft',
    ['put ' + apiPrfx + '/researchentities/:researchEntityId/researchitemdrafts/:itemId']: 'ResearchEntity.updateDraft',
    ['delete ' + apiPrfx + '/researchentities/:researchEntityId/researchitemdrafts/:itemId']: 'ResearchEntity.deleteDraft',
    ['put ' + apiPrfx + '/researchentities/:researchEntityId/researchitemdrafts/:itemId/authors']: 'ResearchEntity.setResearchItemAuthors',
    ['put ' + apiPrfx + '/researchentities/:researchEntityId/researchitems/:itemId/verified']: 'ResearchEntity.verify',
    ['put ' + apiPrfx + '/researchentities/:researchEntityId/researchitems/verified']: 'ResearchEntity.multipleVerify',
    ['put ' + apiPrfx + '/researchentities/:researchEntityId/researchitems/:itemId/unverified']: 'ResearchEntity.unverify',
    ['put ' + apiPrfx + '/researchentities/:researchEntityId/researchitems/:itemId/public']: 'ResearchEntity.setPublic',
    ['put ' + apiPrfx + '/researchentities/:researchEntityId/researchitems/:itemId/favorite']: 'ResearchEntity.setFavorite',
    ['post ' + apiPrfx + '/researchentities/:researchEntityId/copy-research-item']: 'ResearchEntity.copyToDraft',
    ['post ' + apiPrfx + '/researchentities/:researchEntityId/copy-research-items']: 'ResearchEntity.copyAllToDraft',
    ['put ' + apiPrfx + '/researchentities/:researchEntityId/researchitems/:itemId/discarded']: 'ResearchEntity.discard',
    ['put ' + apiPrfx + '/researchentities/:researchEntityId/researchitems/discarded']: 'ResearchEntity.multipleDiscard',
    ['get ' + apiPrfx + '/researchentities/:researchEntityId/get-profile']: 'ResearchEntity.getProfile',
    ['get ' + apiPrfx + '/researchentities/:researchEntityId/get-edit-profile']: 'ResearchEntity.getEditProfile',
    ['post ' + apiPrfx + '/researchentities/:researchEntityId/save-profile']: 'ResearchEntity.saveProfile',
    ['post ' + apiPrfx + '/researchentities/:researchEntityId/profile/export']: 'ResearchEntity.exportProfile',
    ['post ' + apiPrfx + '/accomplishments/export']: 'Accomplishment.export',
    ['post ' + apiPrfx + '/projects/export']: 'Project.export',
    ['put ' + apiPrfx + '/projects/:projectId/group']: 'Project.generateGroup',
    ['post ' + apiPrfx + '/patents/export']: 'Patent.export',
    ['post ' + apiPrfx + '/agreements/export']: 'Agreement.export',
    ['post ' + apiPrfx + '/training-modules/export']: 'TrainingModule.export',


    //Site API
    ['get ' + userUsernamePath + '/publications']: 'User.getPublications',
    ['get ' + userUsernamePath + '/high-impact-publications']: 'User.getHighImpactPublications',
    ['get ' + userUsernamePath + '/documents']: 'User.getPublicDocuments',
    ['get ' + userUsernamePath + '/dissemination-talks']: 'User.getDisseminationTalks',
    ['get ' + userUsernamePath + '/scientific-talks']: 'User.getScientificTalks',
    ['get ' + userUsernamePath + '/favorite-publications']: 'User.getFavoritePublications',
    ['get ' + userUsernamePath + '/oral-presentations']: 'User.getOralPresentations',
    ['get ' + userUsernamePath + '/accomplishments']: 'User.getAccomplishments',
    ['get ' + userUsernamePath + '/competitive-projects']: 'User.getCompetitiveProjects',
    ['get ' + userUsernamePath + '/industrial-projects']: 'User.getIndustrialProjects',
    ['get ' + userUsernamePath + '/patent-families']: 'User.getPatentFamilies',
    ['get ' + userUsernamePath + '/patents']: 'User.getPatents',
    ['get ' + userUsernamePath + '/profile']: 'User.getPublicProfile',
    ['get ' + userUsernamePath + '/profile-image']: 'userData.getProfileImage',

    ['get ' + groupCodePath + '/publications']: 'Group.getPublications',
    ['get ' + groupCodePath + '/high-impact-publications']: 'Group.getHighImpactPublications',
    ['get ' + groupCodePath + '/documents']: 'Group.getPublicDocuments',
    ['get ' + groupCodePath + '/dissemination-talks']: 'Group.getDisseminationTalks',
    ['get ' + groupCodePath + '/scientific-talks']: 'Group.getScientificTalks',
    ['get ' + groupCodePath + '/favorite-publications']: 'Group.getFavoritePublications',
    ['get ' + groupCodePath + '/oral-presentations']: 'Group.getOralPresentations',
    ['get ' + groupCodePath + '/accomplishments']: 'Group.getAccomplishments',
    ['get ' + groupCodePath + '/competitive-projects']: 'Group.getCompetitiveProjects',
    ['get ' + groupCodePath + '/industrial-projects']: 'Group.getIndustrialProjects',
    ['get ' + groupCodePath + '/patent-families']: 'Group.getPatentFamilies',
    ['get ' + groupCodePath + '/patents']: 'Group.getPatents',

    ['get ' + groupSlugPath + '/publications']: 'Group.getPublications',
    ['get ' + groupSlugPath + '/high-impact-publications']: 'Group.getHighImpactPublications',
    ['get ' + groupSlugPath + '/documents']: 'Group.getPublicDocuments',
    ['get ' + groupSlugPath + '/dissemination-talks']: 'Group.getDisseminationTalks',
    ['get ' + groupSlugPath + '/scientific-talks']: 'Group.getScientificTalks',
    ['get ' + groupSlugPath + '/favorite-publications']: 'Group.getFavoritePublications',
    ['get ' + groupSlugPath + '/oral-presentations']: 'Group.getOralPresentations',
    ['get ' + groupSlugPath + '/accomplishments']: 'Group.getAccomplishments',
    ['get ' + groupSlugPath + '/competitive-projects']: 'Group.getCompetitiveProjects',
    ['get ' + groupSlugPath + '/industrial-projects']: 'Group.getIndustrialProjects',
    ['get ' + groupSlugPath + '/patent-families']: 'Group.getPatentFamilies',
    ['get ' + groupSlugPath + '/patents']: 'Group.getPatents',

    //Commands
    ['put ' + apiPrfx + '/status/enable']: 'Status.enable',
    ['put ' + apiPrfx + '/status/disable']: 'Status.disable',
    ['get ' + apiPrfx + '/backup/dumps']: 'Backup.getDumps',
    ['post ' + apiPrfx + '/backup/restore']: 'Backup.restore',
    ['post ' + apiPrfx + '/backup/make']: 'Backup.make',
    ['post ' + apiPrfx + '/backup/upload']: 'Backup.upload',
    ['post ' + apiPrfx + '/backup/remove']: 'Backup.remove',
    ['post ' + apiPrfx + '/backup/download']: 'Backup.download',

    ['get ' + apiPrfx + '/task/:command']: 'Task.isRunning',
    ['post ' + apiPrfx + '/task']: 'Task.run',

    ['get ' + apiPrfx + '/logs/tasks']: 'Log.getTasks',
    ['get ' + apiPrfx + '/logs/:taskName/:date?']: 'Log.read',

    ['get ' + apiPrfx + '/access-logs/get/:name?']: 'AccessLog.get',
    ['post ' + apiPrfx + '/access-logs/download']: 'AccessLog.download',

    ['get ' + apiPrfx + '/general-setting/:name']: 'GeneralSettings.getByName',
    ['post ' + apiPrfx + '/general-setting/:name']: 'GeneralSettings.saveByName',

    ['get ' + apiPrfx + '/source-metrics/:type']: 'SourceMetric.getMetrics',
    ['post ' + apiPrfx + '/source-metrics/import']: 'SourceMetric.importMetrics',
    ['post ' + apiPrfx + '/source-metrics/assign']: 'SourceMetric.assignMetrics',

    ['get ' + apiPrfx + '/customize']: 'Customize.getCustomizations',
    ['post ' + apiPrfx + '/customize/reset']: 'Customize.resetCustomizations',
    ['post ' + apiPrfx + '/customize']: 'Customize.setCustomizations',

    ['get ' + apiPrfx + '/external-connectors']: 'ExternalConnectors.getConnectors',
    ['post ' + apiPrfx + '/external-connectors/reset']: 'ExternalConnectors.resetConnectors',
    ['post ' + apiPrfx + '/external-connectors']: 'ExternalConnectors.setConnectors',

    //MBO
    ['get ' + apiPrfx + '/mbo/v2017/overall_performance/researcher']: 'User.getMBOOverallPerformance',
    ['get ' + apiPrfx + '/mbo/v2017/iit_performance/researcher']: 'User.getMBOInstitutePerformance',
    ['get ' + apiPrfx + '/mbo/v2017/iit_performance/line']: 'Group.getMBOInstitutePerformance',
    ['get ' + apiPrfx + '/mbo/v2017/invited_talk/researcher']: 'User.getMBOInvitedTalks',
    ['get ' + apiPrfx + '/mbo/v2017/invited_talk/line']: 'Group.getMBOInvitedTalks',

    /***************************************************************************
     *                                                                          *
     * Custom routes here...                                                    *
     *                                                                          *
     * If a request to a URL doesn't match any of the custom routes above, it   *
     * is matched against Sails route blueprints. See `config/blueprints.js`    *
     * for configuration options and examples.                                  *
     *                                                                          *
     ***************************************************************************/

};
