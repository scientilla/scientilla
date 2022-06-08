// Log.js - in api/services

"use strict";

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const {promisify} = require('util');
const readdirPromise = promisify(fs.readdir);
const moment = require('moment');
const readline = require('readline');
const stream = require('stream');
const baseFolder = path.join('logs');

const AU = require('ansi_up');
const ansi_up = new AU.default;

module.exports = {
    getTasks,
    read
};

function getTasks() {
    return new Promise(async (resolve, reject) => {
        await readdirPromise(baseFolder).then(fileNames => {
            let files = fileNames.filter(name => {
                return name !== '.gitkeep';
            });

            let tasks = [];

            files.map(name => {
                if (name.match(/_[0-9]{8}.log/g)) {
                    const fileInfo = name.split('_');
                    const taskName = fileInfo.shift();
                    const date = fileInfo.pop().replace('.log', '');

                    const index = tasks.findIndex((task => task.taskName === taskName));
                    if (index === -1) {
                        tasks.push({
                            taskName: taskName,
                            dates: [date]
                        });
                    } else {
                        tasks[index].dates.push(date);

                        tasks[index].dates = _.orderBy(tasks[index].dates, date => {
                            return new moment(date).format('YYYYMMDD');
                        }, ['desc']);
                    }
                }
            });

            resolve(tasks);
        }).catch(err => {
            reject(err);
        });
    }).then(tasks => {
        return {
            type: 'success',
            tasks: tasks
        };
    }).catch(err => {
        return {
            type: 'failed',
            message: err
        };
    });
}

function read(req) {
    return new Promise(async (resolve, reject) => {
        const taskName = req.params.taskName;
        const date = req.params.date;

        await readdirPromise(baseFolder).then(async fileNames => {
            let files = fileNames.filter(name => {
                return name !== '.gitkeep' && name.match(/_[0-9]{8}.log/g);
            });

            files = files.map(name => {
                const fileInfo = name.split('_');
                return {
                    fileName: name,
                    taskName: fileInfo.shift(),
                    date: fileInfo.pop().replace('.log', '')
                };
            });

            files = files.filter(file => {
                return file.taskName === taskName;
            });

            files = _.orderBy(files, file => {
                return new moment(file.date).format('YYYMMDD');
            }, ['desc']);

            if (date) {
                files = files.filter(file => {
                    return file.date === date;
                });
            }
            const file = _.head(files);
            const filePath = path.join(baseFolder, file.fileName);
            const instream = fs.createReadStream(filePath);
            const outstream = new (stream)();
            const rl = readline.createInterface(instream, outstream);
            let output = [];

            rl.on('line', line => {
                ansi_up.use_classes = true;
                const lineHtml = ansi_up.ansi_to_html(line);
                output.push(lineHtml);
            });

            rl.on('close', () => {
                const limit = 1000;
                if (output.length > limit) {
                    output = output.slice(Math.max(output.length - limit, 0));
                    output.unshift(`<strong>Only showing last ${limit} lines, please login into the server to see the complete log file</strong>`);
                }

                resolve(output.join('<br>'));
            });
        }).catch(err => {
            reject(err);
        });
    }).then(logs => {
        return {
            type: 'success',
            logs: logs
        };
    }).catch(err => {
        return {
            type: 'failed',
            message: err
        };
    });
}
