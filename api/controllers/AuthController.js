/**
 * AuthController
 *
 * @module      :: Controller
 * @description    :: Provides the base authentication
 *                 actions used to make waterlock work.
 *
 * @docs        :: http://waterlock.ninja/documentation
 */

const _ = require('lodash');

module.exports = require('waterlock').waterlocked({
    register: function (req, res) {
        if (!sails.config.scientilla.registerEnabled)
            return res.badRequest('Registering is currently disabled');
        const params = waterlock._utils.allParams(req);
        User.registerUser(params)
            .then(function (user) {
                waterlock.cycle.loginSuccess(req, res, user);
            })
            .catch(function (err) {
                sails.log.debug(err);
                res.badRequest(err);
            });

    },
    login: async function (req, res) {
        const username = _.toLower(req.body.username);
        const password = req.body.password;
        const params = {
            username: username,
            password: password
        };

        try {
            // Find a auth record by username
            let auth = await Auth.findOneByUsername(username);

            // Find the current user
            const user = await User.findOne({ username: username });

            // If there is no user
            if (!user) {
                // Throw a 'User not found!' error and show message to the user.
                const errorMessage = 'User not found! Please contact the Data Analysis Office!';
                waterlock.cycle.loginFailure(req, res, null, { error: errorMessage });
                throw 'User not found!';
            }

            // We check if the auth is eqau
            if (auth && auth.id !== user.auth) {
                await User.update({id: user.id}, {auth: auth.id});
            }
            const method = require('waterlock-ldap-auth');
            const ldap = method.ldap;
            const connection = method.connection;

            // We check if the credentials are filled in
            if (typeof params.username === 'undefined' || typeof params.password === 'undefined') {
                waterlock.cycle.loginFailure(req, res, null, {error: 'Invalid username or password'});
            } else {
                // We try to authenticate with the credentials
                new ldap(connection).authenticate(params.username, params.password, async (err, userLDAP) => {

                    // If there is an error we send a message back to the user
                    if (err) {
                        waterlock.cycle.loginFailure(req, res, userLDAP, {error: 'Invalid username or password'});
                    } else {
                        const attr = {
                            username: params.username,
                            entryUUID: userLDAP.entryUUID,
                            dn: userLDAP.dn,
                            name: user.name,
                            surname: user.surname
                        };

                        _.forOwn(method.attributes, function(fields, oid) {
                            _.forOwn(fields, function(definition, name) {
                                if (user.hasOwnProperty(oid)) {
                                    attr[name] = user[oid];
                                }
                            });
                        });

                        if (!auth) {
                            // If we have a user, we try to attach a auth record to the user
                            await new Promise(function (resolve, reject) {
                                waterlock.engine.attachAuthToUser(attr, user, function (err) {
                                    if (err) {
                                        sails.log.debug('An error happened while creating a auth for the user!');
                                        reject();
                                    } else {
                                        resolve();
                                    }
                                });
                            });

                            // Try to find the auth again
                            auth = await Auth.findOneByUsername(username);

                            // If there is still no auth record, we throw an error.
                            if (!auth) {
                                throw 'Failed to attach auth to user!';
                            }
                        }

                        // We try to match the auth and user
                        waterlock.engine.findAuth(auth, function(err, user) {
                            if (err) {
                                waterlock.cycle.loginFailure(req, res, null, {error: 'User not found!'});
                            } else {
                                waterlock.cycle.loginSuccess(req, res, user);
                            }
                        });
                    }
                });
            }
        } catch (e) {
            return res.serverError();
        }
    },
    postLogin: function(req, res) {
        res.set('scientilla-logged', req.session.authenticated);
        res.set('scientilla-admin', req.session.user.role === 'administrator');
        res.json(req.session.user);
    },
    postLogout: function(req, res) {
        res.set('scientilla-logged', false);
        res.set('scientilla-admin', true);
        res.json({});
    }
});
