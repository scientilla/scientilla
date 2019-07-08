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
        var config = _.merge({}, sails.config.connectors);

        config.elsevier = _.merge({}, scopusConnector.getDefaults(), config.elsevier);

        res.halt(Promise.resolve(config));
    },

    setConnectors: function (req, res) {
        let connectors = JSON.parse(req.body.connectors);

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

                return res.json({
                    type: 'success',
                    message: 'External connectors succesfully saved!',
                    connectors: sails.config.connectors,
                });
            }
        );
    }
};

