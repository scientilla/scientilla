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
    ['put ' + apiPrfx + '/users/:researchEntityId']: 'User.updateProfile',
    ['put ' + apiPrfx + '/groups/:researchEntityId']: 'Group.updateProfile',
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
    ['get ' + apiPrfx + '/users/:researchEntityId/charts']: 'User.getChartsData',
    ['get ' + apiPrfx + '/groups/:researchEntityId/charts']: 'Group.getChartsData',
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
    ['post ' + apiPrfx + '/researchentities/:researchEntityId/copy-research-item']: 'ResearchEntity.copyResearchItem',
    ['post ' + apiPrfx + '/researchentities/:researchEntityId/copy-research-items']: 'ResearchEntity.copyResearchItems',
    ['put ' + apiPrfx + '/researchentities/:researchEntityId/researchitems/:itemId/discarded']: 'ResearchEntity.discard',
    ['put ' + apiPrfx + '/researchentities/:researchEntityId/researchitems/discarded']: 'ResearchEntity.multipleDiscard',
    ['post ' + apiPrfx + '/accomplishments/export']: 'Accomplishment.export',
    ['get ' + apiPrfx + '/researchentities/:researchEntityId/get-profile']: 'ResearchEntity.getProfile',
    ['get ' + apiPrfx + '/researchentities/:researchEntityId/get-edit-profile']: 'ResearchEntity.getEditProfile',
    ['post ' + apiPrfx + '/researchentities/:researchEntityId/save-profile']: 'ResearchEntity.saveProfile',
    ['post ' + apiPrfx + '/researchentities/:researchEntityId/profile/export']: 'ResearchEntity.exportProfile',


    //Site API
    ['get ' + apiPrfx + '/users/username/:username/publications']: 'User.getPublications',
    ['get ' + apiPrfx + '/groups/slug/:slug/publications']: 'Group.getPublications',
    ['get ' + apiPrfx + '/users/username/:username/high-impact-publications']: 'User.getHighImpactPublications',
    ['get ' + apiPrfx + '/groups/slug/:slug/high-impact-publications']: 'Group.getHighImpactPublications',
    ['get ' + apiPrfx + '/users/username/:username/documents']: 'User.getPublicDocuments',
    ['get ' + apiPrfx + '/groups/slug/:slug/documents']: 'Group.getPublicDocuments',
    ['get ' + apiPrfx + '/users/username/:username/dissemination-talks']: 'User.getDisseminationTalks',
    ['get ' + apiPrfx + '/groups/slug/:slug/dissemination-talks']: 'Group.getDisseminationTalks',
    ['get ' + apiPrfx + '/users/username/:username/scientific-talks']: 'User.getScientificTalks',
    ['get ' + apiPrfx + '/groups/slug/:slug/scientific-talks']: 'Group.getScientificTalks',
    ['get ' + apiPrfx + '/users/username/:username/favorite-publications']: 'User.getFavoritePublications',
    ['get ' + apiPrfx + '/groups/slug/:slug/favorite-publications']: 'Group.getFavoritePublications',
    ['get ' + apiPrfx + '/users/username/:username/oral-presentations']: 'User.getOralPresentations',
    ['get ' + apiPrfx + '/users/username/:username/profile']: 'User.getProfile',

    //Commands
    ['put ' + apiPrfx + '/status/enable']: 'Status.enable',
    ['put ' + apiPrfx + '/status/disable']: 'Status.disable',
    ['get ' + apiPrfx + '/backup/dumps']: 'Backup.getDumps',
    ['post ' + apiPrfx + '/backup/restore']: 'Backup.restore',
    ['post ' + apiPrfx + '/backup/make']: 'Backup.make',
    ['post ' + apiPrfx + '/backup/upload']: 'Backup.upload',
    ['post ' + apiPrfx + '/backup/remove']: 'Backup.remove',
    ['post ' + apiPrfx + '/backup/download']: 'Backup.download',

    ['get ' + apiPrfx + '/logs/tasks']: 'Log.getTasks',
    ['get ' + apiPrfx + '/logs/:taskName/:date?']: 'Log.read',

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
