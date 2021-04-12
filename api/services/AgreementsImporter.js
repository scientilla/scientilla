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

        const pis = agreementRawData.pis.split(',').map(email => {
            const nameSurname = email.split('@')[0].split('.');
            return {
                email,
                name: nameSurname[0],
                surname: nameSurname[1]
            };
        });

        const agreementsData = {
            type: ResearchItemTypes.PROJECT_AGREEMENT,
            startYear: startDate ? startDate.getFullYear() : null,
            endYear: endDate ? endDate.getFullYear() : null,
            authorsStr: await ResearchItem.generateAuthorsStr(pis),
            projectData: {
                pis: pis,
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

        try {
            await Verify.verify(draft.id, 1, {});
        } catch (e) {
            console.log(e);
        }
    }
}