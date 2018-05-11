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
    login: function (req, res) {
        const login = require('waterlock').actions.waterlocked().login;
        const username = _.toLower(req.body.username);
        return Auth
            .findOneByUsername(username)
            .then(function (auth) {
                req.query.type = (!auth || !auth.password) ? 'ldap' : 'local';
                login(req, res);
            })
            .catch(err => res.serverError());
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
