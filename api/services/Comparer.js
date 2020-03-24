// UserComparer.js - in api/services

"use strict";

const xlsx = require('xlsx');
const _ = require('lodash');
const fs = require('fs');
const util = require('util');
const path = require('path');
const inquirer = require('inquirer');
const readdir = util.promisify(fs.readdir);

module.exports = {
    users
};

async function users() {
    const folder = path.resolve('user_compare');
    const files = await readdir(folder);
    const file = await inquirer
        .prompt([
            {
                type: 'rawlist',
                name: 'file',
                message: 'Which file do you want to use?',
                choices: files,
            },
        ])
        .then(answers => {
            return answers.file;
        });
    const filePath = path.resolve(folder, file);
    const workbook = xlsx.readFile(filePath);
    const sheet = await inquirer
        .prompt([
            {
                type: 'rawlist',
                name: 'sheet',
                message: 'Which sheet do you want to use?',
                choices: workbook.SheetNames,
            },
        ])
        .then(answers => {
            return answers.sheet;
        });

    const worksheet = workbook.Sheets[sheet];
    const range = xlsx.utils.decode_range(worksheet['!ref']);
    const row = 0;
    const headings = [];
    const columnNames = [];

    for (let column = range.s.c; column <= range.e.c; column++) {

        const ref = xlsx.utils.encode_cell({c: column, r: row});
        if (!worksheet[ref]) {
            // if cell doesn't exist, move on
            continue;
        }

        const cell = worksheet[ref];

        headings.push({
            row: row,
            column: column,
            value: cell.v
        });

        columnNames.push(cell.v);
    }

    const columnNameOfFirstName = await inquirer
        .prompt([
            {
                type: 'rawlist',
                name: 'name',
                message: 'What column do you want to pick for the (first) name?',
                choices: columnNames,
            },
        ])
        .then(answers => {
            return answers.name;
        });

    const columnOfFirstName = headings.filter(heading => heading.value === columnNameOfFirstName)
        .map(heading => heading.column);

    const columnNameOfName = await inquirer
        .prompt([
            {
                type: 'rawlist',
                name: 'name',
                message: 'What column do you want to pick for the (last) name?',
                choices: columnNames,
            },
        ])
        .then(answers => {
            return answers.name;
        });

    const columnOfName = headings.filter(heading => heading.value === columnNameOfName)
        .map(heading => heading.column);

    const missingUsers = [];
    const foundUsers = [];

    for (let row = range.s.r + 1; row <= range.e.r; row++) {
        let ref = xlsx.utils.encode_cell({c: columnOfFirstName, r: row});
        if (!worksheet[ref]) {
            // if cell doesn't exist, move on
            continue;
        }

        const firstName = worksheet[ref].v;

        ref = xlsx.utils.encode_cell({c: columnOfName, r: row});
        if (!worksheet[ref]) {
            // if cell doesn't exist, move on
            continue;
        }

        const name = worksheet[ref].v;

        const user = await User.findOne({ name: firstName, surname : name});

        if (user) {
            foundUsers.push({name: name, firstName: firstName});
        } else {
            missingUsers.push({name: name, firstName: firstName});
            console.log('name:' + name + ', firstname:' + firstName);
        }
    }

    console.log('------------------------------------------');
    console.log('Found users: ' + foundUsers.length);
    console.log('Missing users: ' + missingUsers.length);
}
