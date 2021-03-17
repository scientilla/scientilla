/* global ResearchItemTypes, ResearchItem, User, Verify */
"use strict";

const xlsx = require('xlsx');
const _ = require('lodash');

module.exports = {
    importAgreements,
};


async function importAgreements() {

    const workbook = xlsx.readFile('config/init/agreements.xlsx');
    const sheetNameList = workbook.SheetNames;
    const ws = workbook.Sheets[sheetNameList[0]];

    const agreementsRawData = xlsx.utils.sheet_to_json(ws, {header: 0, raw: false});

    let draft;

    for (const agreementRawData of agreementsRawData) {
        const startDate = _.isEmpty(agreementRawData.startDate) ? null : new Date(agreementRawData.startDate);
        const endDate = _.isEmpty(agreementRawData.endDate) ? null : new Date(agreementRawData.endDate);

        if (_.isEmpty(agreementRawData.pis))
            continue;

        const pis = await User.find({username: agreementRawData.pis.split(',')}).populate('aliases');

        const agreementsData = {
            type: ResearchItemTypes.PROJECT_AGREEMENT,
            startYear: startDate ? startDate.getFullYear() : null,
            endYear: endDate ? endDate.getFullYear() : null,
            piStr: pis.map(pi => pi.aliases[0].str).join(', '),
            projectData: {
                pis: pis.map(pi => ({email: pi.username, name: pi.name, surname: pi.surname})),
                partners: agreementRawData.partners.split(','),
                startDate: startDate ? startDate.toISOString() : null,
                endDate: endDate ? endDate.toISOString() : null,
                title: agreementRawData.title
            }
        };

        try {
            const result = await ResearchItem.createDraft(1, agreementsData);
            if (!result.success)
                continue;

            draft = result.researchItem;

        } catch (e) {
            console.log(e);
        }

        if (pis.length) {
            try {
                await Verify.verify(draft.id, 1, {});
            } catch (e) {
                console.log(e);
            }
        }
    }
}