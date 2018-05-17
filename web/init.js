const fs = require('fs');
const path = require('path');

module.exports = () => {
    const configs = {};

    const configsLocation = path.join(__dirname, 'configs/');
    fs.readdirSync(configsLocation).forEach(filename => {
        const configPath = path.join(configsLocation, filename);
        const name = filename.replace(/\.[^/.]+$/, "");
        configs[name] = require(configPath);
    });

    global.configs = configs;

    const controllersLocation = path.join(__dirname, 'controllers/');
    fs.readdirSync(controllersLocation).forEach(filename => {
        const controllerPath = path.join(controllersLocation, filename);
        const name = filename.replace(/\.[^/.]+$/, "");
        global[name] = require(controllerPath);
    });

    const hooksLocation = path.join(__dirname, 'hooks/');
    fs.readdirSync(hooksLocation).forEach(filename => {
        const hookPath = path.join(hooksLocation, filename);
        const hook = require(hookPath);
        hook.start();
    });

    console.log('-----------SERVER STARTED-------------------');
};