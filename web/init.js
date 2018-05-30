const fs = require('fs');
const path = require('path');
const env = process.env.NODE_ENV || 'development';
const config = require(`./configs/env/${env}`);

module.exports = () => {
    let configs = {};

    const configsLocation = path.join(__dirname, 'configs/');
    fs.readdirSync(configsLocation)
        .filter(filename => filename.endsWith('.js'))
        .forEach(filename => {
            const configPath = path.join(configsLocation, filename);
            const name = filename.replace(/\.[^/.]+$/, "");
            configs[name] = require(configPath);
        });
    configs = {...config, ...configs};

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