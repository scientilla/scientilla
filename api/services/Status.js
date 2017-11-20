// Status.js - in api/services

"use strict";

const _ = require('lodash');
const fs = require('fs');

module.exports = {
    disable,
    enable
};

const lockFilename = '.lock';

async function disable() {
    if (!fs.existsSync(lockFilename))
        createFile(lockFilename);
    return 0;
}

async function enable() {
    if (fs.existsSync(lockFilename))
        fs.unlinkSync(lockFilename);
    return 0;
}

function createFile(filepath) {
    fs.closeSync(fs.openSync(filepath, 'a'));
}