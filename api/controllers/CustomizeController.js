/**
 * CustomizeController
 *
 * @description :: Server-side logic for managing customizable config settings
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var fs = require('fs');
var path = require('path');

module.exports = {
    getCustomizations: function (req, res) {
        res.halt(Promise.resolve(sails.config.customizations));
    },

    setCustomizations: function (req, res) {

        let institute = JSON.parse(req.body.institute);
        let footer = JSON.parse(req.body.footer);
        let styles = JSON.parse(req.body.styles);
        let promises = [];

        sails.config.customizations.institute = institute;
        sails.config.customizations.footer = footer;

        sails.config.customizations.styles = styles;
        sails.config.customizations.styles.stylesArray = [
            {
                name: 'primary-color',
                to: '#' + styles.primaryColor
            }, {
                name: 'secondary-color',
                to: '#' + styles.secondaryColor
            }, {
                name: 'header-background-color',
                to: '#' + styles.headerBackgroundColor
            }, {
                name: 'footer-background-color',
                to: '#' + styles.footerBackgroundColor
            }, {
                name: 'base-gray',
                to: '#' + styles.baseGray
            }, {
                name: 'link-text-color',
                to: '#' + styles.linkTextColor
            }, {
                name: 'warning-color',
                to: '#' + styles.warningColor
            }, {
                name: 'success-color',
                to: '#' + styles.successColor
            }, {
                name: 'error-color',
                to: '#' + styles.errorColor
            }
        ];

        promises.push(new Promise(function(resolve, reject) {
            req.file('headerLogo').upload({
                dirname: path.resolve(sails.config.appPath, 'assets/uploads')
            }, function (err, files) {
                if (err) {
                    reject(res.serverError(err));
                }

                if (files.length > 0) {
                    let src = files[0].fd.split('/');
                    src = src[src.length - 1];

                    if (typeof sails.config.customizations.logos === "undefined") {
                        sails.config.customizations.logos = {};
                    }

                    sails.config.customizations.logos.header = {
                        src: '/uploads/' + src,
                        name: files[0].filename
                    };
                }

                resolve();
            });
        }));

        promises.push(new Promise(function(resolve, reject) {
            req.file('instituteIcon').upload({
                dirname: path.resolve(sails.config.appPath, 'assets/uploads')
            }, function (err, files) {
                if (err) {
                    reject(res.serverError(err));
                }

                if (files.length > 0) {
                    let src = files[0].fd.split('/');
                    src = src[src.length - 1];

                    if (typeof sails.config.customizations.logos === "undefined") {
                        sails.config.customizations.logos = {};
                    }

                    sails.config.customizations.logos.institute = {
                        src: '/uploads/' + src,
                        name: files[0].filename
                    };
                }

                resolve();
            });
        }));

        Promise.all(promises).then(function() {
            switch(true) {
                case sails.config.environment === 'development':
                    GruntTaskRunner.run('copy:uploadsDev');
                    GruntTaskRunner.run('recompileAssets');
                    break;
                case sails.config.environment === 'production':
                    GruntTaskRunner.run('copy:uploadsBuild');
                    GruntTaskRunner.run('rebuildProd');
                    break;
                default:
                    break;
            }

            fs.writeFile(sails.config.appPath + '/config/customizations.js',
                'module.exports.customizations = ' + JSON.stringify(sails.config.customizations),
                function(err) {
                    if (err) {
                        return console.log(err);
                    }

                    return res.json({
                        type: 'success',
                        message: 'Customizations succesfully saved!',
                        customizations: sails.config.customizations,
                    });
                }
            );
        });
    },

    resetCustomizations: function (req, res) {
        sails.config.customizations = sails.config.customizationDefaults;

        fs.writeFile(sails.config.appPath + '/config/customizations.js',
            'module.exports.customizations = ' + JSON.stringify(sails.config.customizationDefaults),
            function(err) {
                if(err) {
                    return console.log(err);
                }

                switch(true) {
                    case sails.config.environment === 'development':
                        GruntTaskRunner.run('copy:uploadsDev');
                        GruntTaskRunner.run('recompileAssets');
                        break;
                    case sails.config.environment === 'production':
                        GruntTaskRunner.run('copy:uploadsBuild');
                        GruntTaskRunner.run('rebuildProd');
                        break;
                    default:
                        break;
                }

                return res.json({
                    type: 'success',
                    message: 'Default settings are set!',
                    customizations: sails.config.customizations,
                });
            }
        );
    }
};

