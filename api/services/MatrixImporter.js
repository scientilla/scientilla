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
 *
 * Steps:
 * 1. Research domains
 * 1.1 Get the research domains from Matrix
 * 1.2 Create or update the group in Scientilla if needed.
 * 1.3 Change the active state of research domains that are in Scientilla but not in Matrix to false
 * 2. Centers
 * 2.1 Get the unique centers from Matrix by looping over all the items
 * 2.2 Create or update the group in Scientilla if needed.
 * 2.3 Create if not already exists a membershipgroup between the unique centers and the institute
 * 2.4 Change the active state of centers that are in Scientilla but not in Matrix to false
 */
async function run() {
    const options = _.cloneDeep(sails.config.scientilla.matrix);
    const currentMatrix = await Utils.waitForSuccessfulRequest(Object.assign({}, options, {
        params: {
            viewSupports: true,
            viewNotPublic: true
        }
    }));
    const fullMatrix = await Utils.waitForSuccessfulRequest(Object.assign({}, options, {
        params: {
            all: true
        }
    }));

    // 1.1 Get the research domains
    const upToDateResearchDomains = [];
    const updatedResearchDomains = [];
    const createdResearchDomains = [];

    if (_.has(fullMatrix, 'researchDomains')) {
        // Loop over the research domains received from matrix
        for (const researchDomain of fullMatrix.researchDomains) {
            // 1.2 Create or update the group in Scientilla if needed.

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
                    upToDateResearchDomains.push(group);
                } else {
                    // If they are not equal, update the group
                    group = await Group.update({id: group.id}, {
                        code: researchDomain.code,
                        name: researchDomain.name,
                        type: GroupTypes.RESEARCH_DOMAIN,
                        active: true
                    });
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
                createdResearchDomains.push(group);
            }
        }
    }
    const handledResearchDomains = upToDateResearchDomains.concat(updatedResearchDomains, createdResearchDomains);

    // 1.3 Change the active state of research domains that are in Scientilla but not in Matrix to false
    const deactivatedResearchDomains = handledResearchDomains.length > 0 && await Group.update({
        id: {'!': handledResearchDomains.map(researchDomain => researchDomain.id)},
        type: GroupTypes.RESEARCH_DOMAIN,
        active: true
    }, {
        active: false
    }) || [];

    sails.log.debug(`Research domains up-to-date: ${upToDateResearchDomains.length}`);
    sails.log.debug(`Research domains updated: ${updatedResearchDomains.length}`);
    sails.log.debug(`Research domains created: ${createdResearchDomains.length}`);
    sails.log.debug(`Research domains de-activated: ${deactivatedResearchDomains.length}`);
    sails.log.debug(`----------------------------------------------------`);

    // Centers
    const institute = await Group.findOne({type: GroupTypes.INSTITUTE});

    // 2.1 Get the unique centers from Matrix by looping over all the items
    const centers = []
    if (_.has(fullMatrix, 'supports')) {
        for (const support of fullMatrix.supports) {
            for (const center of support.centers) {
                centers.push({
                    code: center.code,
                    name: center.name
                });
            }
        }
    }

    if (_.has(fullMatrix, 'researchStructures')) {
        for (const researchStructure of fullMatrix.researchStructures) {
            for (const center of researchStructure.centers) {
                centers.push({
                    code: center.code,
                    name: center.name
                });
            }
        }
    }
    const uniqueCenters = _.uniqWith(centers, _.isEqual);
    sails.log.debug(`Unique centers found: ${uniqueCenters.length}`);

    const upToDateCenters = [];
    const updatedCenters = [];
    const createdCenters = [];
    const createdCenterGroupMemberships = [];
    const upToDateCenterGroupMemberships = [];

    // Loop over the unique centers
    for (const center of uniqueCenters) {
        // 2.2 Create or update the group in Scientilla if needed.

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
                upToDateCenters.push(group);
            } else {
                // If they are not equal, update the group
                group = await Group.update({ id: group.id }, {
                    code: center.code,
                    name: center.name,
                    type: GroupTypes.CENTER,
                    active: true
                });
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
            createdCenters.push(group);
        }

        // 2.3 Create if not already exists a membershipgroup between the unique centers and the institute
        let membershipGroup = await MembershipGroup.findOne({
            parent_group: 1,
            child_group: group.id,
            synchronized: true
        });

        if (membershipGroup) {
            await MembershipGroup.update({id: membershipGroup.id}, {
                lastsynch: moment().format(ISO8601Format),
                active: true
            });
            membershipGroup = await MembershipGroup.find({id: membershipGroup.id});
            upToDateCenterGroupMemberships.push(membershipGroup);
        } else {
            membershipGroup = await MembershipGroup.create({
                child_group: group.id,
                parent_group: 1,
                lastsynch: moment().format(ISO8601Format),
                active: true,
                synchronized: true
            });
            createdCenterGroupMemberships.push(membershipGroup);
        }
    }

    const handledCenters = upToDateCenters.concat(updatedCenters, createdCenters);

    // 2.4 Change the active state of centers that are in Scientilla but not in Matrix to false
    const deactivatedCenters = handledCenters.length > 0 && await Group.update({
        id: {'!': handledCenters.map(center => center.id)},
        type: GroupTypes.CENTER,
        active: true
    }, {
        active: false
    }) || [];

    sails.log.debug(`Centers up-to-date: ${upToDateCenters.length}`);
    sails.log.debug(`Centers updated: ${updatedCenters.length}`);
    sails.log.debug(`Centers created: ${createdCenters.length}`);
    sails.log.debug(`Centers de-activated: ${deactivatedCenters.length}`);
    sails.log.debug(`Center memberships created: ${createdCenterGroupMemberships.length}`);
    sails.log.debug(`Center memberships up-to-date: ${upToDateCenterGroupMemberships.length}`);
    sails.log.debug(`----------------------------------------------------`);

    const handleStructure = async (name, type) => {
        const upToDateStructures = [];
        const updatedStructures = [];
        const createdStructures = [];
        const createdStructureGroupMemberships = [];
        const upToDateStructureGroupMemberships = [];
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
            if (type === GroupTypes.DIRECTORATE) {
                matrixType = 'Support';
            }
            const structures = currentMatrix[name].filter(structure => structure.type === matrixType);

            for (const structure of structures) {
                if (!structure.cdr) {
                    continue;
                }
                const active = (structure.endDate === null || moment(structure.endDate, dateFormat).isAfter(moment())) && structure.public;
                let group = await Group.findOne({code: structure.cdr});
                const pis = structure[getPiLabel(type)];
                const structurePis = [];

                if (group) {
                    let center
                    let centerMembership
                    if (_.has(structure, 'center') && !_.isEmpty(structure.center)) {
                        center = await Group.findOne({code: structure.center.code});
                        if (center) {
                            centerMembership = await MembershipGroup.findOne({
                                child_group: group.id,
                                parent_group: center.id,
                                synchronized: true
                            });

                            if (centerMembership) {
                                upToDateStructureGroupMemberships.push(centerMembership);
                            }
                        }
                    }

                    let mainResearchDomain
                    let mainResearchDomainMembership
                    if (_.has(structure, 'mainResearchDomain') && !_.isEmpty(structure.mainResearchDomain)) {
                        mainResearchDomain = await Group.findOne({code: structure.mainResearchDomain.code});
                        if (mainResearchDomain) {
                            mainResearchDomainMembership = await MembershipGroup.findOne({
                                child_group: group.id,
                                parent_group: mainResearchDomain.id,
                                synchronized: true
                            });

                            if (mainResearchDomainMembership) {
                                upToDateStructureGroupMemberships.push(mainResearchDomainMembership);
                            }
                        }
                    }

                    const missingAdministrators = [];
                    const missingPis = [];
                    for (const structurePi of pis) {
                        const user = await User.findOne({username: structurePi.email});

                        if (!user) {
                            continue;
                        }

                        const administrator = await GroupAdministrator.findOne({
                            administrator: user.id,
                            group: group.id
                        });

                        if (!administrator) {
                            missingAdministrators.push(user);
                        } else {
                            uptoDateStructureAdministrators.push(administrator);
                        }

                        const pi = await PrincipalInvestigator.findOne({
                            pi: user.id,
                            group: group.id
                        });

                        if (!pi) {
                            missingPis.push(user);
                        } else {
                            upToDateStructurePis.push(pi);
                            structurePis.push(pi);
                        }
                    }

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
                        upToDateStructures.push(group);
                    } else {

                        // Create center membershipgroup if needed
                        if (center) {
                            if (centerMembership) {
                                await MembershipGroup.update({id: centerMembership.id}, {
                                    lastsynch: moment().format(ISO8601Format),
                                    active: true
                                });

                                const membership = await MembershipGroup.findOne({id: centerMembership.id});

                                upToDateStructureGroupMemberships.push(membership);
                            } else {
                                const membership = await MembershipGroup.create({
                                    child_group: group.id,
                                    parent_group: center.id,
                                    lastsynch: moment().format(ISO8601Format),
                                    active: true,
                                    synchronized: true
                                });

                                createdStructureGroupMemberships.push(membership);
                            }
                        }

                        // Create research domain membershipgroup if needed
                        if (mainResearchDomain) {
                            if (mainResearchDomainMembership) {
                                await MembershipGroup.update({id: mainResearchDomainMembership.id}, {
                                    lastsynch: moment().format(ISO8601Format),
                                    active: true
                                });

                                const membership = await MembershipGroup.findOne({id: mainResearchDomainMembership.id});

                                upToDateStructureGroupMemberships.push(membership);
                            } else {
                                const membership = await MembershipGroup.create({
                                    child_group: group.id,
                                    parent_group: mainResearchDomain.id,
                                    lastsynch: moment().format(ISO8601Format),
                                    active: true,
                                    synchronized: true
                                });

                                createdStructureGroupMemberships.push(membership);
                            }
                        }

                        // Create missing administrators
                        for (const user of missingAdministrators) {
                            const administrator = await GroupAdministrator.create({
                                administrator: user.id,
                                group: group.id
                            });

                            createdStructureAdministrators.push(administrator);
                        }

                        // Create missing pis
                        for (const user of missingPis) {
                            const pi = await PrincipalInvestigator.create({
                                pi: user.id,
                                group: group.id
                            });

                            createdStructurePis.push(pi);
                            structurePis.push(pi);
                        }

                        await Group.update({id: group.id}, {
                            type: type,
                            slug: structure.slug,
                            name: structure.description,
                            shortname: structure.acronym,
                            starting_date: structure.startDate,
                            active: active
                        });
                        group = await Group.findOne({id: group.id});

                        updatedStructures.push(group);
                    }
                } else {
                    // Create new group
                    group = await Group.create({
                        code: structure.cdr,
                        slug: structure.slug,
                        type: type,
                        name: structure.description,
                        shortname: structure.acronym,
                        starting_date: structure.startDate,
                        active: active
                    });

                    // Create center membershipgroup
                    if (_.has(structure, 'center') && !_.isEmpty(structure.center)) {
                        const center = await Group.findOne({code: structure.center.code});

                        if (center) {
                            const membership = await MembershipGroup.create({
                                child_group: group.id,
                                parent_group: center.id,
                                lastsynch: moment().format(ISO8601Format),
                                active: true,
                                synchronized: true
                            });
                            createdStructureGroupMemberships.push(membership);
                        } else {
                            sails.log.debug(`Missing center: ${structure.center.code}!`);
                        }
                    }


                    for (const structurePi of pis) {
                        const user = await User.findOne({username: structurePi.email});

                        if (!user) {
                            continue;
                        }

                        // Create group administrator
                        const administrator = await GroupAdministrator.create({
                            administrator: user.id,
                            group: group.id
                        });

                        createdStructureAdministrators.push(administrator);

                        // Create group pi
                        const pi = await PrincipalInvestigator.create({
                            pi: user.id,
                            group: group.id
                        });

                        createdStructurePis.push(pi);
                        structurePis.push(pi);
                    }

                    createdStructures.push(group);
                }

                // Remove the old pis
                const removedPis = structurePis.length > 0 && await PrincipalInvestigator.destroy({
                    id: {'!': structurePis.map(p => p.id)},
                    group: group.id
                }) || [];
                for (const pi of removedPis) {
                    removedStructurePis.push(pi);
                }

                // Create or update ResearchEntityData
                let researchEntityData = await ResearchEntityData.findOne({research_entity: group.researchEntity});
                const fullMatrixStructure = fullMatrix[name].find(s => s.cdr === structure.cdr);
                if (!researchEntityData) {
                    researchEntityData = await ResearchEntityData.create({researchEntity: group.researchEntity, importedData: {matrix: fullMatrixStructure}});
                    createdStructureResearchEntityData.push(researchEntityData);
                } else {
                    if (!_.isEqual(researchEntityData.importedData.matrix, fullMatrixStructure)) {
                        const tmpResearchEntityData = _.cloneDeep(researchEntityData);
                        tmpResearchEntityData.importedData.matrix = fullMatrixStructure;
                        researchEntityData = await ResearchEntityData.update({id: researchEntityData.id}, {importedData: tmpResearchEntityData.importedData});
                        updatedStructureResearchEntityData.push(researchEntityData);
                    } else {
                        upToDateStructureResearchEntityData.push(researchEntityData);
                    }
                }
            }
        } else {
            sails.log.debug(`${name} not found in matrix!`);
        }

        const handledStructures = upToDateStructures.concat(updatedStructures, createdStructures);

        // Update the groups that are not in matrix anymore = that are active groups with the sync flag => set to not active
        const deactivatedStructures = handledStructures.length > 0 && await Group.update({
            id: {'!': handledStructures.map(s => s.id)},
            type: type,
            active: true
        }, {
            active: false
        }) || [];

        const handledMemberships = createdStructureGroupMemberships.concat(upToDateStructureGroupMemberships);
        const removedStructureMemberships = handledMemberships > 0 && handledStructures.length > 0 && await MembershipGroup.destroy({
            id: {'!': handledMemberships.map(m => m.id)},
            child_group: handledStructures.map(s => s.id)
        }) || [];

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

    // Different types in Scientilla and Matrix?
    await handleStructure('supports', GroupTypes.DIRECTORATE);

    await handleStructure('researchStructures', GroupTypes.RESEARCH_LINE);

    await handleStructure('researchStructures', GroupTypes.FACILITY);
}
