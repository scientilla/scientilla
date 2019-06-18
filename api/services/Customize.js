/* global Customize, GruntTaskRunner, Group */

const fs = require('fs');
const path = require('path');
const {promisify} = require("util");
const writeFile = promisify(fs.writeFile);

module.exports = {
    getCustomizations,
    setCustomizations,
    resetCustomizations
};

async function getCustomizations() {
    sails.config.customizations.institute =  await Group.findOne({id: 1});
    return sails.config.customizations;
}

//TODO remove req
async function setCustomizations(req, footer, styles) {
    let promises = [];

    sails.config.customizations.footer = footer;

    sails.config.customizations.styles = styles;
    sails.config.customizations.styles.stylesArray = [];

    if (styles.primaryColor) {
        sails.config.customizations.styles.stylesArray.push({
            name: 'primary-color',
            to: '#' + styles.primaryColor
        });
    }

    if (styles.secondaryColor) {
        sails.config.customizations.styles.stylesArray.push({
            name: 'secondary-color',
            to: '#' + styles.secondaryColor
        });
    }

    if (styles.headerBackgroundColor) {
        sails.config.customizations.styles.stylesArray.push({
            name: 'header-background-color',
            to: '#' + styles.headerBackgroundColor
        });
    }

    if (styles.footerBackgroundColor) {
        sails.config.customizations.styles.stylesArray.push({
            name: 'footer-background-color',
            to: '#' + styles.footerBackgroundColor
        });
    }

    if (styles.baseGray) {
        sails.config.customizations.styles.stylesArray.push({
            name: 'base-gray',
            to: '#' + styles.baseGray
        });
    }

    if (styles.linkTextColor) {
        sails.config.customizations.styles.stylesArray.push({
            name: 'link-text-color',
            to: '#' + styles.linkTextColor
        });
    }

    if (styles.warningColor) {
        sails.config.customizations.styles.stylesArray.push({
            name: 'warning-color',
            to: '#' + styles.warningColor
        });
    }

    if (styles.successColor) {
        sails.config.customizations.styles.stylesArray.push({
            name: 'success-color',
            to: '#' + styles.successColor
        });
    }

    if (styles.errorColor) {
        sails.config.customizations.styles.stylesArray.push({
            name: 'error-color',
            to: '#' + styles.errorColor
        });
    }

    promises.push(new Promise(function (resolve, reject) {
        req.file('headerLogo').upload({
            dirname: path.resolve(sails.config.appPath, 'assets/uploads')
        }, function (err, files) {
            if (err) {
                reject(err);
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

    promises.push(new Promise(function (resolve, reject) {
        req.file('instituteIcon').upload({
            dirname: path.resolve(sails.config.appPath, 'assets/uploads')
        }, function (err, files) {
            if (err) {
                reject(err);
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

    await Promise.all(promises);
    await runGruntTasks();

    const err = await writeFile(sails.config.appPath + '/config/customizations.js',
        'module.exports.customizations = ' + JSON.stringify(sails.config.customizations));

    if (err)
        return err;

    return {
        type: 'success',
        message: 'Customizations succesfully saved!',
        customizations: sails.config.customizations,
    };
}


async function resetCustomizations() {
    sails.config.customizations = sails.config.customizationDefaults;

    const err = await writeFile(sails.config.appPath + '/config/customizations.js',
        'module.exports.customizations = ' + JSON.stringify(sails.config.customizationDefaults));

    if (err)
        return err;

    await runGruntTasks();

    return {
        type: 'success',
        message: 'Default settings are set!',
        customizations: sails.config.customizations,
    };
}

async function runGruntTasks() {
    switch (sails.config.environment) {
        case  'development':
            await GruntTaskRunner.run('copy:uploadsDev');
            await GruntTaskRunner.run('recompileAssets');
            break;
        case 'production':
            await GruntTaskRunner.run('copy:uploadsBuild');
            await GruntTaskRunner.run('rebuildProd');
            break;
    }
}