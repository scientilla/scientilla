/* Global Group, GroupTypes */
"use strict";

const _ = require('lodash');
const moment = require('moment');
moment.locale('en');
const ISO8601Format = 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]';
const dateFormat = 'YYYY-MM-DD';

module.exports = {
    run
};

function getPiLabel(type) {
    return {
        [GroupTypes.RESEARCH_LINE]: 'pis',
        [GroupTypes.FACILITY]: 'pis',
        [GroupTypes.DIRECTORATE]: 'supervisors',
        [GroupTypes.OTHER]: 'supervisors'
    }[type];
}

/*
 * Matrix importer

 * We decided that groups of type Center, Research Line, Facility, Support (=directorate) & Research Domain will only
 * be generated or updated from Matrix, creating one manually is not possible.
 *
 * The centers are unique ones found in the centers array of support and research structures.
 *
 * The groups of type Center, Research Line, Facility, Support (=directorate) & Research Domain that are not found in matrix will be set as not active.
 * The same happens for not public items. Both will keep the last membershipgroup record without changing the active state.
 */
async function run() {
    // Get the options from the configuration
    const options = _.cloneDeep(sails.config.scientilla.matrix);
    // Get the current matrix output
    const currentMatrix = await Utils.waitForSuccessfulRequest(Object.assign({}, options, {
        params: {
            viewSupports: true,
            viewNotPublic: true
        }
    }));
    // Get the full matrix output
    const fullMatrix = await Utils.waitForSuccessfulRequest(Object.assign({}, options, {
        params: {
            all: true
        }
    }));

    const upToDateResearchDomains = [];
    const updatedResearchDomains = [];
    const createdResearchDomains = [];

    // Check of matrix has the property 'researchDomains'
    if (_.has(fullMatrix, 'researchDomains')) {
        // Loop over the research domains received from matrix
        for (const researchDomain of fullMatrix.researchDomains) {

            // Find group of type research domain by code
            let group = await Group.findOne({code: researchDomain.code});

            // If the group is found
            if (group) {
                // Compare the fields
                if (
                    group.code === researchDomain.code &&
                    group.name === researchDomain.name &&
                    group.type === GroupTypes.RESEARCH_DOMAIN &&
                    group.active === true
                ) {
                    // Push to an array to log later
                    upToDateResearchDomains.push(group);
                } else {
                    // If they are not equal, update the group
                    group = await Group.update({id: group.id}, {
                        code: researchDomain.code,
                        name: researchDomain.name,
                        type: GroupTypes.RESEARCH_DOMAIN,
                        active: true
                    });

                    // Push to an array to log later
                    updatedResearchDomains.push(group);
                }
            } else {
                // Otherwise create a new group
                group = await Group.create({
                    code: researchDomain.code,
                    name: researchDomain.name,
                    type: GroupTypes.RESEARCH_DOMAIN,
                    active: true
                });

                // Push to an array to log later
                createdResearchDomains.push(group);
            }
        }
    }
    // Merge the handled research domains into one array
    const handledResearchDomains = upToDateResearchDomains.concat(updatedResearchDomains, createdResearchDomains);

    // Update the active state of research domains that are in Scientilla but not in Matrix to false
    const deactivatedResearchDomains = handledResearchDomains.length > 0 && await Group.update({
        id: {'!': handledResearchDomains.map(researchDomain => researchDomain.id)},
        type: GroupTypes.RESEARCH_DOMAIN,
        active: true
    }, {
        active: false
    }) || [];

    // Log the information
    sails.log.debug(`Research domains up-to-date: ${upToDateResearchDomains.length}`);
    sails.log.debug(`Research domains updated: ${updatedResearchDomains.length}`);
    sails.log.debug(`Research domains created: ${createdResearchDomains.length}`);
    sails.log.debug(`Research domains de-activated: ${deactivatedResearchDomains.length}`);
    sails.log.debug(`----------------------------------------------------`);

    /*
     * Get the centers of the structure
     *
     * @param {object} structure This the structure object
     * @return {array} This returns an array with the centers of the structure
     */
    const getStructureCenters = structure => {
        const centers = [];
        // Calculate the active flag for the structure
        const active = (structure.endDate === null || moment(structure.endDate, dateFormat).isAfter(moment())) && structure.public;
        // If the structure is active`
        if (active) {
            // Loop over the centers
            for (const center of structure.centers) {
                // And push them to an array
                centers.push({
                    code: center.code,
                    name: center.name
                });
            }
        }
        return centers;
    };

    // Get the unique centers from Matrix by looping over all the items
    let centers = [];
    // Check of matrix has the property 'supports'
    if (_.has(fullMatrix, 'supports')) {
        // Loop over the support structures
        for (const structure of fullMatrix.supports) {
            // Merge the centers of the structure with the current ones
            centers = centers.concat(getStructureCenters(structure));
        }
    }

    // Check of matrix has the property 'researchStructures'
    if (_.has(fullMatrix, 'researchStructures')) {
        // Loop over the research structures
        for (const structure of fullMatrix.researchStructures) {
            // Merge the centers of the structure with the current ones
            centers = centers.concat(getStructureCenters(structure));
        }
    }
    // Get the unique centers
    const uniqueCenters = _.uniqWith(centers, _.isEqual);
    // Print the number of unique centers
    sails.log.debug(`Unique centers found: ${uniqueCenters.length}`);

    const upToDateCenters = [];
    const updatedCenters = [];
    const createdCenters = [];
    const createdCenterGroupMemberships = [];
    const upToDateCenterGroupMemberships = [];

    // Loop over the unique centers
    for (const center of uniqueCenters) {
        // Find group of type center by code
        let group = await Group.findOne({code: center.code});

        // If the group is found
        if (group) {
            // Compare the fields
            if (
                group.code === center.code &&
                group.name === center.name &&
                group.type === GroupTypes.CENTER &&
                group.active === true
            ) {
                // Push to an array to log later
                upToDateCenters.push(group);
            } else {
                // If they are not equal, update the group
                group = await Group.update({ id: group.id }, {
                    code: center.code,
                    name: center.name,
                    type: GroupTypes.CENTER,
                    active: true
                });
                // Push to an array to log later
                updatedCenters.push(group);
            }
        } else {
            // Otherwise create a new group
            group = await Group.create({
                code: center.code,
                name: center.name,
                type: GroupTypes.CENTER,
                active: true
            });
            // Push to an array to log later
            createdCenters.push(group);
        }

        // Find the group membership of the center and the institute
        let membershipGroup = await MembershipGroup.findOne({
            parent_group: 1,
            child_group: group.id
        });

        // If the group membership is found
        if (membershipGroup) {
            // Update the lastsynch date
            await MembershipGroup.update({id: membershipGroup.id}, {
                lastsynch: moment().format(ISO8601Format),
                synchronized: true,
                active: true
            });
            membershipGroup = await MembershipGroup.find({id: membershipGroup.id});
            // Push to an array to log later
            upToDateCenterGroupMemberships.push(membershipGroup);
        } else {
            // Create new group membership between center and the institute
            membershipGroup = await MembershipGroup.create({
                child_group: group.id,
                parent_group: 1,
                lastsynch: moment().format(ISO8601Format),
                active: true,
                synchronized: true
            });
            // Push to an array to log later
            createdCenterGroupMemberships.push(membershipGroup);
        }
    }

    // Merge the handled centers into one array
    const handledCenters = upToDateCenters.concat(updatedCenters, createdCenters);

    // Change the active state of centers that are in Scientilla but not in Matrix to false
    const deactivatedCenters = handledCenters.length > 0 && await Group.update({
        id: {'!': handledCenters.map(center => center.id)},
        type: GroupTypes.CENTER,
        active: true
    }, {
        active: false
    }) || [];

    // Log the information
    sails.log.debug(`Centers up-to-date: ${upToDateCenters.length}`);
    sails.log.debug(`Centers updated: ${updatedCenters.length}`);
    sails.log.debug(`Centers created: ${createdCenters.length}`);
    sails.log.debug(`Centers de-activated: ${deactivatedCenters.length}`);
    sails.log.debug(`Center memberships created: ${createdCenterGroupMemberships.length}`);
    sails.log.debug(`Center memberships up-to-date: ${upToDateCenterGroupMemberships.length}`);
    sails.log.debug(`----------------------------------------------------`);

    /*
     * Handle the matrix structures of group type
     *
     * @param {string} name This the key name in matrix
     * @param {string} type This is the name of group type
     */
    const handleMatrixOfGroupType = async (name, type) => {
        const upToDateStructures = [];
        const updatedStructures = [];
        const createdStructures = [];
        const skippedStructures = [];
        const createdStructureGroupMemberships = [];
        const upToDateStructureGroupMemberships = [];
        const removedStructureMemberships = [];
        const uptoDateStructureAdministrators = [];
        const createdStructureAdministrators = [];
        const upToDateStructurePis = [];
        const createdStructurePis = [];
        const removedStructurePis = [];
        const createdStructureResearchEntityData = [];
        const updatedStructureResearchEntityData = [];
        const upToDateStructureResearchEntityData = [];

        if (_.has(currentMatrix, name)) {
            let matrixType = type;

            // The type of directorate in matrix is different so override
            if (type === GroupTypes.DIRECTORATE) {
                matrixType = 'Support';
            }

            // Filter the current matrix for structures of the wanted type
            const structures = currentMatrix[name].filter(structure => structure.type === matrixType);

            // Loop over the structures
            for (const structure of structures) {
                // Skip if the structure or structure cdr is empty
                if (!structure || !structure.cdr) {
                    continue;
                }

                // Calculate the active flag for the structure group
                const active = (structure.endDate === null || moment(structure.endDate, dateFormat).isAfter(moment())) && structure.public;

                if (matrixType === 'Support' && !active) {
                    skippedStructures.push(structure);
                    continue;
                }

                // Find the group in the database by the cdr
                let group = await Group.findOne({code: structure.cdr});
                // Get the pis from the structure
                const pis = structure[getPiLabel(type)];
                const structurePis = [];

                let center;
                let centerMembership;
                let mainResearchDomain;
                let mainResearchDomainMembership;

                // Check if the group exists
                if (group) {

                    // Check if the structure has a center
                    if (_.has(structure, 'center.code')) {
                        // Find the group of the center in the database
                        center = await Group.findOne({code: structure.center.code});

                        // If found
                        if (center) {
                            // Find the membership group record
                            centerMembership = await MembershipGroup.findOne({
                                child_group: group.id,
                                parent_group: center.id
                            });

                            // Push the membership to an array to log later
                            if (centerMembership) {
                                upToDateStructureGroupMemberships.push(centerMembership);
                            }
                        }
                    }

                    // Check of the structure has a main research domain
                    if (_.has(structure, 'mainResearchDomain.code')) {
                        // Find the group of the main research domain in the database
                        mainResearchDomain = await Group.findOne({code: structure.mainResearchDomain.code});

                        // If found
                        if (mainResearchDomain) {
                            // Find the membership group record
                            mainResearchDomainMembership = await MembershipGroup.findOne({
                                child_group: group.id,
                                parent_group: mainResearchDomain.id
                            });

                            // Push the membership to an array to log later
                            if (mainResearchDomainMembership) {
                                upToDateStructureGroupMemberships.push(mainResearchDomainMembership);
                            }
                        }
                    }

                    const missingAdministrators = [];
                    const missingPis = [];
                    // Loop over the structure pis
                    for (const structurePi of pis) {
                        // Find the pi user in the database
                        const user = await User.findOne({or:[
                            {username: structurePi.email},
                            {legacyEmail: structurePi.email}
                        ]});

                        // Skip if the user is not found
                        if (!user) {
                            continue;
                        }

                        // Find if the user is administrator of the group
                        const administrator = await GroupAdministrator.findOne({
                            administrator: user.id,
                            group: group.id
                        });

                        // If the administrator is not found: push to an array to log later and create the group administrator
                        if (!administrator) {
                            missingAdministrators.push(user);
                        } else {
                            // If found, push to an array to log later
                            uptoDateStructureAdministrators.push(administrator);
                        }

                        // Find if the user is a pi of the group
                        const pi = await PrincipalInvestigator.findOne({
                            pi: user.id,
                            group: group.id
                        });

                        // If the pi is not found: push to an array to log later and create the group pi
                        if (!pi) {
                            missingPis.push(user);
                        } else {
                            // If found, push to an array to log later
                            upToDateStructurePis.push(pi);
                            structurePis.push(pi);
                        }
                    }

                    // Check if the current group is equal to the structure comparing specific values
                    if (
                        group.type === type &&
                        group.slug === structure.slug &&
                        group.name === structure.description &&
                        group.shortname === structure.acronym &&
                        moment(group.starting_date, ISO8601Format).isSame(moment(structure.startDate, dateFormat)) &&
                        (
                            !center ||
                            center && centerMembership
                        ) && (
                            !mainResearchDomain ||
                            mainResearchDomain && mainResearchDomainMembership
                        ) &&
                        _.isEmpty(missingAdministrators) &&
                        _.isEmpty(missingPis) &&
                        group.active === active
                    ) {
                        // If equal: push to an array to log later
                        upToDateStructures.push(group);
                    } else {
                        // If the group is not completely equal

                        // Create center membership group if needed
                        if (center) {
                            if (centerMembership) {
                                // If the center membership is already existing, find the membership
                                await MembershipGroup.update({id: centerMembership.id}, {
                                    lastsynch: moment().format(ISO8601Format),
                                    synchronized: true,
                                    active: true
                                });
                                centerMembership = await MembershipGroup.findOne({id: centerMembership.id});

                                // Push to an array to log later
                                upToDateStructureGroupMemberships.push(centerMembership);
                            } else {
                                // If the center membership group is missing: create one
                                await MembershipGroup.create({
                                    child_group: group.id,
                                    parent_group: center.id,
                                    lastsynch: moment().format(ISO8601Format),
                                    active: true,
                                    synchronized: true
                                });
                                centerMembership = await MembershipGroup.findOne({
                                    child_group: group.id,
                                    parent_group: center.id
                                });

                                // Push to array to log later
                                createdStructureGroupMemberships.push(centerMembership);
                            }
                        }

                        // Create research domain membership group if needed
                        if (mainResearchDomain) {
                            if (mainResearchDomainMembership) {
                                // If the main research domain membership is already existing, find the membership
                                await MembershipGroup.update({id: mainResearchDomainMembership.id}, {
                                    lastsynch: moment().format(ISO8601Format),
                                    synchronized: true,
                                    active: true
                                });
                                mainResearchDomainMembership = await MembershipGroup.findOne({id: mainResearchDomainMembership.id});

                                // Push to an array to log later
                                upToDateStructureGroupMemberships.push(mainResearchDomainMembership);
                            } else {
                                // If the main research domain membership group is missing: create one
                                await MembershipGroup.create({
                                    child_group: group.id,
                                    parent_group: mainResearchDomain.id,
                                    lastsynch: moment().format(ISO8601Format),
                                    active: true,
                                    synchronized: true
                                });
                                mainResearchDomainMembership = await MembershipGroup.findOne({
                                    child_group: group.id,
                                    parent_group: mainResearchDomain.id
                                });

                                // Push to an array to log later
                                createdStructureGroupMemberships.push(mainResearchDomainMembership);
                            }
                        }

                        // Loop over & create missing administrators
                        for (const user of missingAdministrators) {
                            const administrator = await GroupAdministrator.create({
                                administrator: user.id,
                                group: group.id
                            });

                            // Push to an array to log later
                            createdStructureAdministrators.push(administrator);
                        }

                        // Loop over & create missing pis
                        for (const user of missingPis) {
                            const pi = await PrincipalInvestigator.create({
                                pi: user.id,
                                group: group.id
                            });

                            // Push to an array to log later
                            createdStructurePis.push(pi);
                            structurePis.push(pi);
                        }

                        // Update the group with the structure data
                        await Group.update({id: group.id}, {
                            type: type,
                            slug: structure.slug,
                            name: structure.description,
                            shortname: structure.acronym,
                            starting_date: structure.startDate,
                            active: active
                        });
                        group = await Group.findOne({id: group.id});

                        // Push to an array to log later
                        updatedStructures.push(group);
                    }
                } else {
                    // Create new group with the structure data
                    group = await Group.create({
                        code: structure.cdr,
                        slug: structure.slug,
                        type: type,
                        name: structure.description,
                        shortname: structure.acronym,
                        starting_date: structure.startDate,
                        active: active
                    });

                    // Create center membership group record
                    if (_.has(structure, 'center.code')) {
                        // Find the group of the center
                        center = await Group.findOne({code: structure.center.code});

                        // If found
                        if (center) {
                            // Create the membership group record for the center & group
                            await MembershipGroup.create({
                                child_group: group.id,
                                parent_group: center.id,
                                lastsynch: moment().format(ISO8601Format),
                                active: true,
                                synchronized: true
                            });
                            centerMembership = await MembershipGroup.findOne({
                                child_group: group.id,
                                parent_group: center.id
                            });

                            // Push to an array to log later
                            createdStructureGroupMemberships.push(centerMembership);
                        } else {
                            // If the center group is not found print the error
                            sails.log.debug(`Missing center: ${structure.center.code}!`);
                        }
                    }

                    // Check of the structure has a main research domain
                    if (_.has(structure, 'mainResearchDomain.code')) {
                        // Find the group of the main research domain in the database
                        mainResearchDomain = await Group.findOne({code: structure.mainResearchDomain.code});

                        // If found
                        if (mainResearchDomain) {
                            // If the main research domain membership group is missing: create one
                            await MembershipGroup.create({
                                child_group: group.id,
                                parent_group: mainResearchDomain.id,
                                lastsynch: moment().format(ISO8601Format),
                                active: true,
                                synchronized: true
                            });
                            mainResearchDomainMembership = await MembershipGroup.findOne({
                                child_group: group.id,
                                parent_group: mainResearchDomain.id
                            });

                            // Push to an array to log later
                            createdStructureGroupMemberships.push(mainResearchDomainMembership);
                        } else {
                            // If the center group is not found print the error
                            sails.log.debug(`Missing main research domain: ${structure.mainResearchDomain.code}!`);
                        }
                    }

                    // Loop over the structure pis
                    for (const structurePi of pis) {
                        // Find the pi user
                        const user = await User.findOne({or:[
                            {username: structurePi.email},
                            {legacyEmail: structurePi.email}
                        ]});

                        // Skip if not found
                        if (!user) {
                            continue;
                        }

                        // Create group administrator
                        const administrator = await GroupAdministrator.create({
                            administrator: user.id,
                            group: group.id
                        });

                        // Push to an array to log later
                        createdStructureAdministrators.push(administrator);

                        // Create group pi
                        const pi = await PrincipalInvestigator.create({
                            pi: user.id,
                            group: group.id
                        });

                        // Push to an array to log later
                        createdStructurePis.push(pi);
                        structurePis.push(pi);
                    }

                    // Push to an array to log later
                    createdStructures.push(group);
                }

                // Remove the old pis of the group from the database
                const removedPis = structurePis.length > 0 && await PrincipalInvestigator.destroy({
                    id: {'!': structurePis.map(p => p.id)},
                    group: group.id
                }) || [];

                // Loop over the removed pis
                for (const pi of removedPis) {
                    // Push to an array to log later
                    removedStructurePis.push(pi);
                }

                const membershipIds = [];
                if (mainResearchDomainMembership) {
                    membershipIds.push(mainResearchDomainMembership.id);
                }

                if (centerMembership) {
                    membershipIds.push(centerMembership.id);
                }

                // Remove the other memberships
                const removedMemberships = membershipIds.length > 0 && await MembershipGroup.destroy({
                    id: {'!': membershipIds},
                    child_group: group.id,
                    synchronized: true
                }) || [];

                // Loop over the removed memberships
                for (const membership of removedMemberships) {
                    // Push to an array to log later
                    removedStructureMemberships.push(membership);
                }

                // Find the research entity data record of the group
                let researchEntityData = await ResearchEntityData.findOne({research_entity: group.researchEntity});
                // Store the matrix structure temporarily
                const fullMatrixStructure = fullMatrix[name].find(s => s.cdr === structure.cdr);

                // If the research entity is not found
                if (!researchEntityData) {
                    // Create a new record
                    researchEntityData = await ResearchEntityData.create({researchEntity: group.researchEntity, importedData: {matrix: fullMatrixStructure}});

                    // Push to an array to log later
                    createdStructureResearchEntityData.push(researchEntityData);
                } else {
                    // If the research entity is found: compare if it's equal to the current one
                    if (!_.isEqual(researchEntityData.importedData.matrix, fullMatrixStructure)) {
                        // If not update the research entity data record
                        const tmpResearchEntityData = _.cloneDeep(researchEntityData);
                        tmpResearchEntityData.importedData.matrix = fullMatrixStructure;
                        researchEntityData = await ResearchEntityData.update({id: researchEntityData.id}, {importedData: tmpResearchEntityData.importedData});

                        // Push to an array to log later
                        updatedStructureResearchEntityData.push(researchEntityData);
                    } else {
                        // Push to an array to log later
                        upToDateStructureResearchEntityData.push(researchEntityData);
                    }
                }
            }
        } else {
            // Print if the key is not found in matrix
            sails.log.debug(`${name} not found in matrix!`);
        }

        if (skippedStructures.length > 0) {
            const codes = skippedStructures.map(s => s.cdr);
            for (const code of codes) {
                await Group.destroy({
                    code: code
                });
            }
        }

        // Merge the handled structures into one array
        const handledStructures = upToDateStructures.concat(updatedStructures, createdStructures);
        // Update the groups that are not in matrix anymore to not active
        const deactivatedStructures = handledStructures.length > 0 && await Group.update({
            id: {'!': handledStructures.map(s => s.id)},
            type: type,
            active: true
        }, {
            active: false
        }) || [];

        // Log the information
        sails.log.debug(`${type} structures skipped: ${skippedStructures.length}`);
        sails.log.debug(`${type} structures up-to-date: ${upToDateStructures.length}`);
        sails.log.debug(`${type} structures updated: ${updatedStructures.length}`);
        sails.log.debug(`${type} structures created: ${createdStructures.length}`);
        sails.log.debug(`${type} structures de-activated: ${deactivatedStructures.length}`);
        sails.log.debug(`${type} structures group memberships created: ${createdStructureGroupMemberships.length}`);
        sails.log.debug(`${type} structures group memberships up-to-date: ${upToDateStructureGroupMemberships.length}`);
        sails.log.debug(`${type} structures group memberships removed: ${removedStructureMemberships.length}`);
        sails.log.debug(`${type} structures pis created: ${createdStructurePis.length}`);
        sails.log.debug(`${type} structures pis removed: ${removedStructurePis.length}`);
        sails.log.debug(`${type} structures pis up-to-date: ${upToDateStructurePis.length}`);
        sails.log.debug(`${type} structures administrators created: ${createdStructureAdministrators.length}`);
        sails.log.debug(`${type} structures administrators up-to-date: ${uptoDateStructureAdministrators.length}`);
        sails.log.debug(`${type} structures research entity data created: ${createdStructureResearchEntityData.length}`);
        sails.log.debug(`${type} structures research entity data updated: ${updatedStructureResearchEntityData.length}`);
        sails.log.debug(`${type} structures research entity data up-to-date: ${upToDateStructureResearchEntityData.length}`);
        sails.log.debug(`----------------------------------------------------`);
    };

    // Import the directorate data from matrix
    await handleMatrixOfGroupType('supports', GroupTypes.DIRECTORATE);

    // Import the research line data from matrix
    await handleMatrixOfGroupType('researchStructures', GroupTypes.RESEARCH_LINE);

    // Import the facility data from matrix
    await handleMatrixOfGroupType('researchStructures', GroupTypes.FACILITY);

    await SqlService.refreshMaterializedView('person');
    sails.log.debug('Refreshed person view...');
}
