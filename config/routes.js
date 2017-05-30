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

    'post /auths/register': 'Auth.register',
    'post /users/:researchEntityId/drafts': 'User.createDraft',
    'post /groups/:researchEntityId/drafts': 'Group.createDraft',
    'put /users/:researchEntityId/drafts/verify-drafts': 'User.verifyDrafts',
    'put /groups/:researchEntityId/drafts/verify-drafts': 'Group.verifyDrafts',
    'put /users/:researchEntityId': 'User.updateProfile',
    'put /groups/:researchEntityId': 'Group.updateProfile',
    'put /users/:researchEntityId/drafts/:id': 'User.updateDraft',
    'put /groups/:researchEntityId/drafts/:id': 'Group.updateDraft',
    'put /users/:researchEntityId/verify-documents': 'User.verifyDocuments',
    'put /groups/:researchEntityId/verify-documents': 'Group.verifyDocuments',
    'put /users/:researchEntityId/documents/:documentId/unverified': 'User.unverifyDocument',
    'put /groups/:researchEntityId/documents/:documentId/unverified': 'Group.unverifyDocument',
    'post /users/:researchEntityId/documents': 'User.verifyDocument',
    'post /groups/:researchEntityId/documents': 'Group.verifyDocument',
    'post /users/:researchEntityId/discarded-document': 'User.discardDocument',
    'post /groups/:researchEntityId/discarded-document': 'Group.discardDocument',
    'post /users/:researchEntityId/discarded-documents': 'User.discardDocuments',
    'post /groups/:researchEntityId/discarded-documents': 'Group.discardDocuments',
    'post /users/:researchEntityId/copy-drafts': 'User.createDrafts',
    'post /groups/:researchEntityId/copy-drafts': 'Group.createDrafts',
    'put /users/:researchEntityId/documents/:documentId/tags': 'User.addTags',
    'put /groups/:researchEntityId/documents/:documentId/tags': 'Group.addTags',
    'put /users/:researchEntityId/drafts/:draftId/verified': 'User.verifyDraft',
    'put /groups/:researchEntityId/drafts/:draftId/verified': 'Group.verifyDraft',
    'get /users/:researchEntityId/external-documents': 'User.getExternalDocuments',
    'get /groups/:researchEntityId/external-documents': 'Group.getExternalDocuments',
    'get /settings': 'Settings.getSettings',
    'get /users/:researchEntityId/charts': 'User.getChartsData',
    'get /groups/:researchEntityId/charts': 'Group.getChartsData',
    'put /groups/:researchEntityId/drafts/:documentId/authorships': 'Group.setAuthorhips',
    'put /users/:researchEntityId/drafts/:documentId/authorships': 'User.setAuthorhips'


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
