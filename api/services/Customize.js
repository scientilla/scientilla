/* global Customize, GruntTaskRunner, Group */

const fs = require('fs');
const path = require('path');
const { promisify } = require("util");
const writeFile = promisify(fs.writeFile);

module.exports = {
    getCustomizations,
    setCustomizations,
    resetCustomizations
};

async function getCustomizations() {
    sails.config.customizations.institute = await Group.findOne({id: 1});
    return sails.config.customizations;
}

async function setCustomizations(req, footer, styles) {
    let promises = [];

    sails.config.customizations.footer = footer;

    sails.config.customizations.styles = styles;
    sails.config.customizations.styles.stylesArray = [];

    if (styles.primaryColor) {
        sails.config.customizations.styles.stylesArray.push({
            match: 'primary-color',
            replacement: '#' + styles.primaryColor
        });
    }

    if (styles.secondaryColor) {
        sails.config.customizations.styles.stylesArray.push({
            match: 'secondary-color',
            replacement: '#' + styles.secondaryColor
        });
    }

    if (styles.headerBackgroundColor) {
        sails.config.customizations.styles.stylesArray.push({
            match: 'header-background-color',
            replacement: '#' + styles.headerBackgroundColor
        });
    }

    if (styles.footerBackgroundColor) {
        sails.config.customizations.styles.stylesArray.push({
            match: 'footer-background-color',
            replacement: '#' + styles.footerBackgroundColor
        });
    }

    if (styles.baseGray) {
        sails.config.customizations.styles.stylesArray.push({
            match: 'base-gray',
            replacement: '#' + styles.baseGray
        });
    }

    if (styles.linkTextColor) {
        sails.config.customizations.styles.stylesArray.push({
            match: 'link-text-color',
            replacement: '#' + styles.linkTextColor
        });
    }

    if (styles.warningColor) {
        sails.config.customizations.styles.stylesArray.push({
            match: 'warning-color',
            replacement: '#' + styles.warningColor
        });
    }

    if (styles.successColor) {
        sails.config.customizations.styles.stylesArray.push({
            match: 'success-color',
            replacement: '#' + styles.successColor
        });
    }

    if (styles.errorColor) {
        sails.config.customizations.styles.stylesArray.push({
            match: 'error-color',
            replacement: '#' + styles.errorColor
        });
    }

    if (styles.documentColor) {
        sails.config.customizations.styles.stylesArray.push({
            match: 'document-color',
            replacement: '#' + styles.documentColor
        });
    }

    if (styles.hIndexColor) {
        sails.config.customizations.styles.stylesArray.push({
            match: 'h-index-color',
            replacement: '#' + styles.hIndexColor
        });
    }

    if (styles.citationColor) {
        sails.config.customizations.styles.stylesArray.push({
            match: 'citation-color',
            replacement: '#' + styles.citationColor
        });
    }

    if (styles.impactFactorColor) {
        sails.config.customizations.styles.stylesArray.push({
            match: 'impact-factor-color',
            replacement: '#' + styles.impactFactorColor
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

    await writeFile(
        sails.config.appPath + '/config/customizations.js',
        'module.exports.customizations = ' + JSON.stringify(sails.config.customizations, null, 4)
    );

    const errors = await runGruntTasks();

    if (errors.length > 0) {
        return {
            type: 'error',
            message: 'Something went wrong while saving the customizations!',
            customizations: sails.config.customizations
        }
    }

    return {
        type: 'success',
        message: 'Customizations successfully saved!',
        customizations: sails.config.customizations,
    };
}


async function resetCustomizations() {
    sails.config.customizations = _.cloneDeep(sails.config.customizationDefaults);

    await writeFile(
        sails.config.appPath + '/config/customizations.js',
        'module.exports.customizations = ' + JSON.stringify(sails.config.customizationDefaults, null, 4)
    );

    const errors = await runGruntTasks();
    sails.log.debug(errors);

    if (errors.length > 0) {
        return {
            type: 'error',
            message: 'Something went wrong while resetting the customizations!',
            customizations: sails.config.customizations
        }
    }

    return {
        type: 'success',
        message: 'Default settings are set!',
        customizations: sails.config.customizations
    };
}

async function runGruntTasks() {
    const errors = [];

    switch (sails.config.environment) {
        case 'development':
            await Promise.all([
                GruntTaskRunner.run('copy:uploadsDev'),
                GruntTaskRunner.run('recompileAssets')
            ]).catch(() => {
                errors.push('Upload & recompile failed!');
            });
            break;
        case 'production':
            await Promise.all([
                GruntTaskRunner.run('copy:uploadsBuild'),
                GruntTaskRunner.run('rebuildProd')
            ]).catch(() => {
                errors.push('Upload & rebuild failed!');
            });
            break;
        default:
            errors.push('Wrong environment');
            break;
    }

    return errors;
}
