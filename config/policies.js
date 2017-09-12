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
const isActivityOwner = ['isActivityOwner']
const isGroupOwner = ['isGroupOwner']

const defaultPolicy = {
    '*': isLogged,
    findOne: true,
    find: true,
    populate: true,
    delete: isAdmin,
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

    CollaborationGroupController: defaultPolicy,

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
        setAuthorhips: isGroupOwner,
        deleteDraft: isGroupOwner
    }, defaultPolicy),

    InstituteController: _.defaults({
        create: isLogged,
    }, defaultPolicy),

    MembershipController: defaultPolicy,

    SettingsController: _.defaults({
        getSettings: true,
    }, defaultPolicy),

    SourceController: _.defaults({
        create: isLogged,
    }, defaultPolicy),

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
        setAuthorhips: isActivityOwner,
        deleteDraft: isActivityOwner
    }, defaultPolicy),
};
