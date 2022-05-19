/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * Only applies to HTTP requests (not WebSockets)
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.http.html
 */

const lodash = require('lodash');
const fs = require('fs');
const Promise = require('bluebird');
const AccessLog = require('../api/services/AccessLog.js');

module.exports.http = {

    /****************************************************************************
     *                                                                           *
     * Express middleware to use for every Sails request. To add custom          *
     * middleware to the mix, add a function to the middleware config object and *
     * add its key to the "order" array. The $custom key is reserved for         *
     * backwards-compatibility with Sails v0.9.x apps that use the               *
     * `customMiddleware` config option.                                         *
     *                                                                           *
     ****************************************************************************/

    middleware: {

        /***************************************************************************
         *                                                                          *
         * The order in which middleware should be run for HTTP request. (the Sails *
         * router is invoked by the "router" middleware below.)                     *
         *                                                                          *
         ***************************************************************************/

        order: [
            'startRequestTimer',
            'cookieParser',
            'session',
            'bodyParser',
            'myRequestLogger',
            'handleBodyParserError',
            'compress',
            'methodOverride',
            'poweredBy',
            '$custom',
            'checkStatus',
            'checkLogged',
            'checkUserRole',
            'router',
            'www',
            'favicon',
            '404',
            '500',
            'checkDisabled'
        ],

        /****************************************************************************
         *                                                                           *
         * Example custom middleware; logs each request to the console.              *
         *                                                                           *
         ****************************************************************************/

        compress: require('compression')(),

        checkStatus: async function (req, res, next) {
            res.set('scientilla-status', Status.get());
            return next();
        },

        checkLogged: async function (req, res, next) {
            const user = await getUser(req);
            res.set('scientilla-logged', req.session.authenticated);
            return next();
        },

        checkUserRole: async function (req, res, next) {
            const user = await getUser(req);
            if (user)
                res.set('scientilla-admin', user.role == 'administrator');
            return next();
        },


        myRequestLogger: async function (req, res, next) {
            if (!req.path.startsWith('/api/v1/'))
                return next();
            await AccessLog.create(req);
            return next();
        }

        ,


        /***************************************************************************
         *                                                                          *
         * The body parser that will handle incoming multipart HTTP requests. By    *
         * default as of v0.10, Sails uses                                          *
         * [skipper](http://github.com/balderdashy/skipper). See                    *
         * http://www.senchalabs.org/connect/multipart.html for other options.      *
         *                                                                          *
         ***************************************************************************/

// bodyParser: require('skipper')

    },

    /***************************************************************************
     *                                                                          *
     * The number of seconds to cache flat files on disk being served by        *
     * Express static middleware (by default, these files are in `.tmp/public`) *
     *                                                                          *
     * The HTTP static cache is only active in a 'production' environment,      *
     * since that's the only time Express will cache flat-files.                *
     *                                                                          *
     ***************************************************************************/

// cache: 31557600000
}
;

async function getUser(req) {
    return req.session.user;
    const accessToken = req.get('access_token');
    if (accessToken) {
        const jwt = await Jwt.findOneByToken(accessToken).populate('owner');
        const user = jwt.owner;
        return user;
    }
    return undefined;

}
