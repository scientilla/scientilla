/**
 * ExternalConnectorsController
 *
 * @description :: Server-side logic for managing external connector config settings
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var fs = require('fs');
var scopusConnector = require('../services/ScopusConnector');

module.exports = {
    getConnectors: function (req, res) {
        const connectors = _.merge({}, sails.config.connectorDefaults, sails.config.connectors);
        connectors.elsevier = _.merge({}, scopusConnector.getDefaults(), connectors.elsevier);
        res.halt(Promise.resolve(connectors));
    },

    setConnectors: async function (req, res) {
        let connectors = JSON.parse(req.body.connectors);
        connectors = _.merge({}, sails.config.connectorDefaults, connectors);

        sails.config.connectors.publications.active = connectors.publications.active;
        sails.config.connectors.elsevier.active = connectors.elsevier.active;
        sails.config.connectors.elsevier.scopus.url = connectors.elsevier.scopus.url;
        sails.config.connectors.elsevier.scopus.apiKey = connectors.elsevier.scopus.apiKey;
        sails.config.connectors.elsevier.scopus.token = connectors.elsevier.scopus.token;
        sails.config.connectors.elsevier.scival.url = connectors.elsevier.scival.url;
        sails.config.connectors.elsevier.scival.clientKey = connectors.elsevier.scival.clientKey;

        fs.writeFile(sails.config.appPath + '/config/connectors.js',
            'module.exports.connectors = ' + JSON.stringify(sails.config.connectors, null, 4),
            function(err) {
                if (err) {
                    return console.log(err);
                }

                const connectors = _.merge({}, sails.config.connectorDefaults, sails.config.connectors);
                connectors.elsevier = _.merge({}, scopusConnector.getDefaults(), connectors.elsevier);

                return res.json({
                    type: 'success',
                    message: 'External connectors successfully saved!',
                    connectors: connectors,
                });
            }
        );
    },

    resetConnectors: async function (req, res) {
        sails.config.connectors = sails.config.connectorDefaults;

        fs.writeFile(sails.config.appPath + '/config/connectors.js',
            'module.exports.connectors = ' + JSON.stringify(sails.config.connectors, null, 4),
            function(err) {
                if (err) {
                    return console.log(err);
                }

                const connectors = _.merge({}, sails.config.connectorDefaults, sails.config.connectors);
                connectors.elsevier = _.merge({}, scopusConnector.getDefaults(), connectors.elsevier);

                return res.json({
                    type: 'success',
                    message: 'External connectors successfully reset!',
                    connectors: connectors,
                });
            }
        );
    }
};

