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

  'post /auths/register' : 'Auth.register',
  'post /users/:researchEntityId/drafts': 'User.createDraft',
  'post /groups/:researchEntityId/drafts': 'Group.createDraft',
  'put /users/:id/drafts/verify-drafts': 'User.verifyDrafts',
  'put /groups/:id/drafts/verify-drafts': 'Group.verifyDrafts',
  'put /users/:userId/drafts/:id': 'User.updateDraft',
  'put /groups/:userId/drafts/:id': 'Group.updateDraft',
  'put /users/:userId/documents/:id': 'Document.update',
  'put /groups/:userId/documents/:id': 'Document.update',
  'put /users/:id/verify-documents': 'User.verifyDocuments',
  'put /groups/:id/verify-documents': 'Group.verifyDocuments',
  'put /users/:id/documents/:documentId/unverified': 'User.unverifyDocument',
  'put /groups/:id/documents/:documentId/unverified': 'Group.unverifyDocument',
  'post /users/:id/documents/:documentId/tags' : 'User.addTags',
  'post /users/:id/documents': 'User.verifyDocument',
  'post /groups/:id/documents': 'Group.verifyDocument',
  'post /users/:id/discarded-document': 'User.discardDocument',
  'post /groups/:id/discarded-document': 'Group.discardDocument',
  'post /users/:id/discarded-documents': 'User.discardDocuments',
  'post /groups/:id/discarded-documents': 'Group.discardDocuments',
  'post /users/:id/copy-drafts': 'User.createDrafts',
  'post /groups/:id/copy-drafts': 'Group.createDrafts',
  'put /users/:id/drafts/:draftId/verified': 'User.verifyDraft',
  'put /groups/:id/drafts/:draftId/verified': 'Group.verifyDraft',
  'get /documents/:id/suggestions' : 'Suggestion.find', //sTODO delete
  'get /documents/:id/suggested-collaborators' : 'Document.getSuggestedCollaborators',
  'get /users/:id/external-documents' : 'User.getExternalDocuments',
  'get /groups/:id/external-documents' : 'Group.getExternalDocuments',
  'delete /documents/delete':'Document.deleteDrafts'


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
