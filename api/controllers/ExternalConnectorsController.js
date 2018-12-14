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

    setConnector: function (req, res) {
        let connector = JSON.parse(req.body.connector);

        switch(connector.type) {
            case 'elsevier':
                sails.config.connectors.elsevier.active = connector.data.active;
                sails.config.connectors.elsevier.scopus.url = connector.data.scopus.url;
                sails.config.connectors.elsevier.scopus.apiKey = connector.data.scopus.apiKey;
                sails.config.connectors.elsevier.scopus.token = connector.data.scopus.token;
                sails.config.connectors.elsevier.scival.url = connector.data.scival.url;
                sails.config.connectors.elsevier.scival.clientKey = connector.data.scival.clientKey;
                break;
            default:
                break;
        }

        fs.writeFile(sails.config.appPath + '/config/connectors.js',
            'module.exports.connectors = ' + JSON.stringify(sails.config.connectors),
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

