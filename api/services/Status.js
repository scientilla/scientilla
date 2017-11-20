// Status.js - in api/services

"use strict";

const _ = require('lodash');
const fs = require('fs');

module.exports = {
    disable,
    enable,
    isEnabled,
    get
};

const lockFilename = '.lock';

function disable() {
    if (!fs.existsSync(lockFilename))
        createFile(lockFilename);
    return 0;
}

function enable() {
    if (fs.existsSync(lockFilename))
        fs.unlinkSync(lockFilename);
    return 0;
}

function get() {
    return isEnabled() ? 'ENABLED' : 'DISABLED';
}

function isEnabled() {
    return !fs.existsSync(lockFilename);
}

function createFile(filepath) {
    fs.closeSync(fs.openSync(filepath, 'a'));
}