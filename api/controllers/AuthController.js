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

        // We check if the credentials are filled in
        if (typeof params.username === 'undefined' || typeof params.password === 'undefined') {
            return waterlock.cycle.loginFailure(req, res, null, {error: 'Invalid username or password'});
        }

        try {
            // Find the current user
            const user = await User.findOne({username: username});

            // If there is no user
            if (!user) {
                // Throw a 'User not found!' error and show message to the user.
                const errorMessage = 'User not found! Please contact the Data Analysis Office!';
                return waterlock.cycle.loginFailure(req, res, null, {error: errorMessage});
            }

            const method = require('waterlock-ldap-auth');
            const ldap = method.ldap;
            const connection = method.connection;

            // We try to authenticate with the credentials
            new ldap(connection).authenticate(params.username, params.password, async (err, userLDAP) => {
                // If there is an error we send a message back to the user
                if (err) {
                    waterlock.cycle.loginFailure(req, res, userLDAP, {error: 'Invalid username or password'});
                } else {
                    waterlock.cycle.loginSuccess(req, res, user);
                }
            });

        } catch (e) {
            return res.serverError(e);
        }
    },
    postLogin: function (req, res) {
        res.set('scientilla-logged', req.session.authenticated);
        res.set('scientilla-admin', req.session.user.role === 'administrator');
        res.json(req.session.user);
    },
    postLogout: function (req, res) {
        res.set('scientilla-logged', false);
        res.set('scientilla-admin', true);
        res.json({});
    }
});
