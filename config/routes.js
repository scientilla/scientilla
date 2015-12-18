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

  '/': {
    view: 'homepage'
  },

  'get r|^/users/(\\d+)$|id' : 'User.getOne',
  'get r|^/groups/(\\d+)$|id' : 'Group.getOne',
  'post /auths/register' : 'Auth.register',
  'post /users/:userId/references': 'Reference.create',
  'post /groups/:userId/references': 'Reference.create',
  'put /users/:userId/references/:id': 'Reference.update',
  'put /groups/:userId/references/:id': 'Reference.update',
  'get /users/:id/references': 'User.getReferences',
  'get /groups/:id/references': 'Group.getReferences',
  'delete /users/:id/references/:referenceId': 'User.deleteReference',
  'delete /groups/:id/references/:referenceId': 'Group.deleteReference',
  'post /users/:id/privateReferences/': 'User.verifyReference',
  'put /users/:id/references/:referenceId/verified': 'User.verifyDraft',
  'put /groups/:id/references/:referenceId/verified': 'Group.verifyDraft',
  'get /references/:id/suggestions' : 'Suggestion.find', //sTODO delete
  'get /references/:id/suggested-collaborators' : 'Reference.getSuggestedCollaborators',
  'get /users/:id/suggested-references' : 'User.getSuggestedReferences',
  'get /users/:id/notifications' : 'User.getNotifications',
  'get /users/:id/external-references' : 'User.getExternalReferences',
  'get /groups/:id/external-references' : 'Group.getExternalReferences'

//    'get /': {
//        controller: 'index',
//        action: 'index'
//    }

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
