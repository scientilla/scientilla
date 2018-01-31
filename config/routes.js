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
    '/api/v1/ping': 'Homepage.ping',
    '/api/v1/login': 'Auth.postLogin',
    '/api/v1/logout': 'Auth.postLogout',
    'post /api/v1/auths/register': 'Auth.register',
    'post /api/v1/users/:researchEntityId/drafts': 'User.createDraft',
    'post /api/v1/groups/:researchEntityId/drafts': 'Group.createDraft',
    'put /api/v1/users/:researchEntityId/drafts/verify-drafts': 'User.verifyDrafts',
    'put /api/v1/groups/:researchEntityId/drafts/verify-drafts': 'Group.verifyDrafts',
    'put /api/v1/users/:researchEntityId': 'User.updateProfile',
    'put /api/v1/groups/:researchEntityId': 'Group.updateProfile',
    'delete /api/v1/users/:researchEntityId/drafts/:draftId': 'User.deleteDraft',
    'delete /api/v1/groups/:researchEntityId/drafts/:draftId': 'Group.deleteDraft',
    'put /api/v1/users/:researchEntityId/drafts/delete': 'User.deleteDrafts',
    'put /api/v1/groups/:researchEntityId/drafts/delete': 'Group.deleteDrafts',
    'put /api/v1/users/:researchEntityId/drafts/:id': 'User.updateDraft',
    'put /api/v1/groups/:researchEntityId/drafts/:id': 'Group.updateDraft',
    'put /api/v1/users/:researchEntityId/verify-documents': 'User.verifyDocuments',
    'put /api/v1/groups/:researchEntityId/verify-documents': 'Group.verifyDocuments',
    'put /api/v1/users/:researchEntityId/documents/:documentId/unverified': 'User.unverifyDocument',
    'put /api/v1/groups/:researchEntityId/documents/:documentId/unverified': 'Group.unverifyDocument',
    'post /api/v1/users/:researchEntityId/documents': 'User.verifyDocument',
    'post /api/v1/groups/:researchEntityId/documents': 'Group.verifyDocument',
    'post /api/v1/users/:researchEntityId/discarded-document': 'User.discardDocument',
    'post /api/v1/groups/:researchEntityId/discarded-document': 'Group.discardDocument',
    'post /api/v1/users/:researchEntityId/discarded-documents': 'User.discardDocuments',
    'post /api/v1/groups/:researchEntityId/discarded-documents': 'Group.discardDocuments',
    'post /api/v1/users/:researchEntityId/copy-document': 'User.copyDocument',
    'post /api/v1/groups/:researchEntityId/copy-document': 'Group.copyDocument',
    'post /api/v1/users/:researchEntityId/copy-documents': 'User.copyDocuments',
    'post /api/v1/groups/:researchEntityId/copy-documents': 'Group.copyDocuments',
    'put /api/v1/users/:researchEntityId/documents/:documentId/tags': 'User.addTags',
    'put /api/v1/groups/:researchEntityId/documents/:documentId/tags': 'Group.addTags',
    'put /api/v1/users/:researchEntityId/drafts/:draftId/verified': 'User.verifyDraft',
    'put /api/v1/groups/:researchEntityId/drafts/:draftId/verified': 'Group.verifyDraft',
    'put /api/v1/users/:researchEntityId/drafts/:draftId/synchronized': 'Document.synchronizeDraft',
    'put /api/v1/groups/:researchEntityId/drafts/:draftId/synchronized': 'Document.synchronizeDraft',
    'put /api/v1/users/:researchEntityId/desynchronize-documents': 'Document.desynchronizeDrafts',
    'put /api/v1/groups/:researchEntityId/desynchronize-documents': 'Document.desynchronizeDrafts',
    'put /api/v1/users/:researchEntityId/documents/:documentId/privacy': 'User.setAuthorshipPrivacy',
    'put /api/v1/groups/:researchEntityId/documents/:documentId/privacy': 'Group.setAuthorshipPrivacy',
    'put /api/v1/users/:researchEntityId/documents/:documentId/favorite': 'User.setAuthorshipFavorite',
    'put /api/v1/groups/:researchEntityId/documents/:documentId/favorite': 'Group.setAuthorshipFavorite',
    'get /api/v1/settings': 'Settings.getSettings',
    'get /api/v1/users/:researchEntityId/charts': 'User.getChartsData',
    'get /api/v1/groups/:researchEntityId/charts': 'Group.getChartsData',
    'put /api/v1/groups/:researchEntityId/drafts/:documentId/authorships': 'Group.setAuthorhips',
    'put /api/v1/users/:researchEntityId/drafts/:documentId/authorships': 'User.setAuthorhips',
    'get /api/v1/externals': 'Document.externalSearch',
    'get /api/v1/users/username/:username/publications': 'User.getPublications',
    'get /api/v1/groups/slug/:slug/publications': 'Group.getPublications',
    'get /api/v1/users/username/:username/high-impact-publications': 'User.getHighImpactPublications',
    'get /api/v1/groups/slug/:slug/high-impact-publications': 'Group.getHighImpactPublications',
    'get /api/v1/users/username/:username/documents': 'User.getPublicDocuments',
    'get /api/v1/groups/slug/:slug/documents': 'Group.getPublicDocuments',
    'get /api/v1/users/username/:username/dissemination-talks': 'User.getDisseminationTalks',
    'get /api/v1/groups/slug/:slug/dissemination-talks': 'Group.getDisseminationTalks',
    'get /api/v1/users/username/:username/scientific-talks': 'User.getScientificTalks',
    'get /api/v1/groups/slug/:slug/scientific-talks': 'Group.getScientificTalks',
    'post /api/v1/users/:researchEntityId/documents-not-duplicate': 'User.setDocumentAsNotDuplicate',
    'post /api/v1/groups/:researchEntityId/documents-not-duplicate': 'Group.setDocumentAsNotDuplicate',
    'post /api/v1/groups/:researchEntityId/remove-verify': 'Group.removeVerify',
    'post /api/v1/users/:researchEntityId/remove-verify': 'User.removeVerify',

    //Commands
    'put /api/v1/status/enable': 'Status.enable',
    'put /api/v1/status/disable': 'Status.disable',
    'get /api/v1/backup/dumps': 'Backup.getDumps',
    'post /api/v1/backup/restore': 'Backup.restore',
    'post /api/v1/backup/make': 'Backup.make',

    //MBO
    'get /api/v1/mbo/v2017/overall_performance/researcher': 'User.getMBOOverallPerformance',
    'get /api/v1/mbo/v2017/iit_performance/researcher': 'User.getMBOInstitutePerformance',
    'get /api/v1/mbo/v2017/iit_performance/line': 'Group.getMBOInstitutePerformance',
    'get /api/v1/mbo/v2017/invited_talk/researcher': 'User.getMBOInvitedTalks',
    'get /api/v1/mbo/v2017/invited_talk/line': 'Group.getMBOInvitedTalks',

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
