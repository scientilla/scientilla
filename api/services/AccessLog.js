const moment = require('moment');
const util = require('util');
const fs = require('fs');
const path = require('path');
const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const exists = util.promisify(fs.exists);
const appendFile = util.promisify(fs.appendFile);
const readline = require('readline');
const stream = require('stream');

const fileFormat = 'DDMMYYYY';
const baseFolder = 'access_logs';

module.exports = {
    create,
    get,
    download
}

async function create(req) {
    const timestamp = moment();
    const fileName = `access_logs_${timestamp.format(fileFormat)}.log`;
    const filePath = path.join(baseFolder, fileName);
    await appendToFile(filePath, `"${timestamp}", "${req.path}", "${req.method}", "${req.socket.remoteAddress}"\n`);
}

async function get(name = false) {
    if (name) {
        return new Promise(async (resolve, reject) => {
            const instream = fs.createReadStream(path.join(baseFolder, name + '.log'));
            const outstream = new (stream)();
            const rl = readline.createInterface(instream, outstream);
            let output = [];

            rl.on('line', line => {
                output.push(line);
            });

            rl.on('close', () => {
                resolve(output);
            });
        }).then(output => {
            return {
                type: 'success',
                file: output
            };
        }).catch(err => {
            return {
                type: 'failed',
                message: err
            };
        });
    } else {
        const files = await readdir(baseFolder);
        return {
            type: 'success',
            files: files.filter(f => f.endsWith('.log'))
        };
    }
}

async function download(name) {
    const filePath = path.resolve(sails.config.appPath, baseFolder, name + '.log');
    const stat = util.promisify(fs.stat)

    return stat(filePath).then(() => {
        return fs.createReadStream(filePath)
    }).catch(err => {
        throw {
            success: false,
            message: 'Access log not found!'
        };
    })
}

async function appendToFile(path, data) {
    if (await exists(path)) {
        return await appendFile(path, data);
    }

    return writeFile(path, data);
}
