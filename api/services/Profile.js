// Profile.js - in api/services

"use strict";

const docx = require("docx");
const fs = require('fs');
const path = require('path');
const util = require('util');
const PdfPrinter = require('pdfmake');
const { Base64Encode } = require('base64-stream');

function concatStrings(strings = [], options = {}) {
    options = _.extend({
        seperator: ', ',
        hideEmpty: true
    }, options);

    if (options.hideEmpty) {
        strings = strings.filter(string => string !== '' && typeof string !== 'undefined')
    }

    return strings.join(options.seperator)
}

function isFuture(date) {
    const now = new Date();
    date = new Date(date);

    if (date < now) {
        return false;
    }

    return true;
}

function formatDate(date) {
    date = new Date(date);
    let dd = date.getDate();
    let mm = date.getMonth() + 1;

    const yyyy = date.getFullYear();

    if (dd < 10) {
        dd = '0' + dd;
    }

    if (mm < 10) {
        mm = '0' + mm;
    }

    return dd + '/' + mm + '/' + yyyy;
}

function formatDateExperience(date) {
    date = new Date(date);
    let mm = date.getMonth() + 1;

    const yyyy = date.getFullYear();

    if (mm < 10) {
        mm = '0' + mm;
    }

    return mm + '/' + yyyy;
}

function formatDateEducation(date) {
    date = new Date(date);

    const yyyy = date.getFullYear();

    return yyyy;
}

function initializeOptions(options) {
    if (!_.has(options, 'basic')) {
        options.basic = true;
    }

    if (!_.has(options, 'socials')) {
        options.socials = true;
    }

    if (!_.has(options, 'about')) {
        options.about = true;
    }

    if (!_.has(options, 'experiences')) {
        options.experiences = true;
    }

    if (!_.has(options, 'education')) {
        options.education = true;
    }

    if (!_.has(options, 'certificates')) {
        options.certificates = true;
    }

    if (!_.has(options, 'skills')) {
        options.skills = true;
    }

    if (!_.has(options, 'documents')) {
        options.documents = true;
    }

    if (!_.has(options, 'accomplishments')) {
        options.accomplishments = true;
    }

    return options;
}

function insertIntoArray(arr, value) {

    return arr.reduce((result, element, index, array) => {

        result.push(element);

        if (index < array.length - 1) {
            result.push(value);
        }

        return result;
    }, []);
}

module.exports = {
    toPDF,
    toDoc
};

async function getProfile(researchEntityId) {
    const profile = await ResearchEntityData.getProfile(researchEntityId);

    // Getting the documents
    const user = await User.findOne({researchEntity: researchEntityId}).populate('documents');
    const documentIds = user.documents.map(d => d.id);
    const documentPopulates = [
        'source',
        'authors',
        'authorships',
        'groupAuthorships',
        'affiliations',
        'sourceMetrics',
        'userTags',
        'tagLabels',
        'groupTags',
        'groupTagLabels',
        'institutes',
        'groups',
        'scopusDocumentMetadata',
        'openaireMetadata'
    ];
    const documents = await Document.find({
        kind: DocumentKinds.VERIFIED,
        id: documentIds
    }).populate(documentPopulates);

    profile.documents = documents;

    // Getting the accomplishments
    const researchEntity = await ResearchEntity.findOne({id: researchEntityId}).populate('accomplishments');
    const accomplishmentIds = researchEntity.accomplishments.map(a => a.id);
    const accomplishmentPopulates = [
        'type',
        'authors',
        'affiliations',
        'institutes',
        'source',
        'verified',
        'verifiedUsers',
        'verifiedGroups'
    ];

    const accomplishments = await Accomplishment.find(accomplishmentIds).populate(accomplishmentPopulates);

    profile.accomplishments = accomplishments;

    return profile;
}

async function toPDF(researchEntityId, options = {}) {

    options = initializeOptions(options);

    let tmpText = '';

    const profile = await getProfile(researchEntityId);

    function getExperienceText(experience) {
        const stack = [];

        if (!_.isEmpty(experience)) {

            if (!_.isEmpty(experience.company)) {
                stack.push({
                    text: experience.company,
                    style: 'bold'
                });
            }

            if (!_.isEmpty(experience.jobTitle)) {
                stack.push({
                    text: experience.jobTitle,
                });
            }

            experience.from = formatDateExperience(experience.from);

            if (!_.has(experience, 'to') || _.isEmpty(experience.to) || isFuture(experience.to)) {
                experience.to = 'Present';
            } else {
                experience.to = formatDateExperience(experience.to);
            }

            tmpText = concatStrings([experience.from, experience.to], {seperator: ' - '});
            if (!_.isEmpty(tmpText)) {
                stack.push({
                    text: tmpText,
                    style: 'lighten'
                });
            }

            tmpText = concatStrings([experience.location, experience.country]);
            if (!_.isEmpty(tmpText)) {
                stack.push({
                    text: tmpText,
                    style: 'lighten'
                });
            }

            if (!_.isEmpty(experience.lines)) {
                for (const line of experience.lines) {
                    if (!_.isEmpty(line.name) || !_.isEmpty(line.office)) {
                        stack.push({
                            text: concatStrings([line.name, line.office], {seperator: ' - '}),
                            style: 'lighten'
                        });
                    }
                }
            }

            if (!_.isEmpty(experience.jobDescription)) {
                stack.push({
                    text: experience.jobDescription
                });
            }
        }

        return stack;
    }

    function getEducationText(educationItem) {
        const stack = [];

        if (!_.isEmpty(educationItem)) {

            if (!_.isEmpty(educationItem.institute)) {
                stack.push(educationItem.institute);
            }

            if (!_.isEmpty(educationItem.title)) {
                stack.push({
                    text: educationItem.title,
                    style: 'bold'
                });
            }

            educationItem.from = formatDateEducation(educationItem.from);

            if (!_.has(educationItem, 'to') || _.isEmpty(educationItem.to) || isFuture(educationItem.to)) {
                educationItem.to = 'Present';
            } else {
                educationItem.to = formatDateEducation(educationItem.to);
            }

            tmpText = concatStrings([educationItem.from, educationItem.to], {seperator: ' - '});
            if (!_.isEmpty(tmpText)) {
                stack.push({
                    text: tmpText,
                    style: 'lighten'
                });
            }

            tmpText = concatStrings([educationItem.location, educationItem.country]);
            if (!_.isEmpty(tmpText)) {
                stack.push({
                    text: tmpText,
                    style: 'lighten'
                });
            }
        }

        return stack;
    }

    function getCertificateText(certificate) {
        const stack = [];

        if (!_.isEmpty(certificate)) {
            if (!_.isEmpty(certificate.title)) {
                stack.push({
                    text: certificate.title,
                    style: 'bold'
                });
            }

            if (!_.isEmpty(certificate.description)) {
                stack.push({
                    text: certificate.description
                });
            }

            if (!_.isEmpty(certificate.date)) {
                stack.push({
                    text: formatDate(certificate.date),
                    style: 'lighten'
                });
            }
        }

        return stack;
    }

    function getSkillCategoryText(category) {
        const stack = [];

        if (!_.isEmpty(category)) {
            if (!_.isEmpty(category.categoryName)) {
                stack.push({
                    text: category.categoryName,
                    style: 'bold'
                });
            }

            if (!_.isEmpty(category.skills)) {

                const skills = [];
                for (let i = 0; i < category.skills.length; i++) {
                    const skill = category.skills[i];
                    skills.push(skill);
                }

                stack.push({
                    ul: skills
                });
            }
        }

        return stack;
    }

    function getDocumentCategoryText(category, documents) {
        const text = [];

        if (!_.isEmpty(category)) {
            text.push({
                text: category,
                style: 'h3'
            });
        }

        for (let i = 0; i < documents.length; i++) {
            const document = documents[i];

            if (!_.isEmpty(document)) {
                if (i > 0) {
                    text.push({
                        text: ' '
                    });
                }

                const documentText = [];
                let subText = [];

                if (!_.isEmpty(document.authorsStr)) {
                    documentText.push(document.authorsStr);
                }

                if (!_.isEmpty(document.year)) {
                    documentText.push(' (' + document.year + '). ');
                }

                if (!_.isEmpty(document.title)) {
                    subText.push(document.title);
                }

                if (!_.isEmpty(document.source)) {
                    subText.push({
                        text: document.source.title,
                        style: 'italics'
                    });
                }

                if (!_.isEmpty(document.volume)) {
                    subText.push(document.volume);
                }

                if (!_.isEmpty(document.pages)) {
                    subText.push(document.pages);
                }

                if (subText.length > 0) {
                    subText = insertIntoArray(subText, ', ');
                    subText.push('.');
                }

                text.push({
                    unbreakable: true,
                    text: _.concat(documentText, subText),
                    margin: [20,0,0,0]
                });
            }
        }

        return text;
    }

    function getAccomplishmentCategoryText(category, accomplishments) {
        const text = [];

        if (!_.isEmpty(category)) {
            text.push({
                text: category,
                style: 'h3'
            });
        }

        for (let i = 0; i < accomplishments.length; i++) {
            const accomplishment = accomplishments[i];
            const stack = [];

            if (!_.isEmpty(accomplishment)) {
                if (i > 0) {
                    text.push({
                        text: ' '
                    });
                }

                if (!_.isEmpty(accomplishment.title)) {
                    stack.push({
                        text: accomplishment.title,
                        style: 'bold',
                    });
                }

                if (!_.isEmpty(accomplishment.issuer)) {
                    stack.push({
                        text: 'Issuer: ' + accomplishment.issuer
                    });
                }

                if (!_.isEmpty(accomplishment.year)) {
                    stack.push({
                        text: 'Year: ' + accomplishment.year
                    });
                }

                text.push({
                    stack: stack,
                    margin: [20,0,0,0]
                });
            }
        }

        return text;
    }

    return await new Promise(async resolve => {
        /// Define font files
        const fonts = {
            RobotoSlab: {
                normal: 'assets/fonts/RobotoSlab-Regular.ttf',
                bold: 'assets/fonts/RobotoSlab-Bold.ttf'
            },
            OpenSans: {
                normal: 'assets/fonts/OpenSans-Regular.ttf',
                bold: 'assets/fonts/OpenSans-Bold.ttf',
                italics: 'assets/fonts/OpenSans-RegularItalic.ttf'
            },
            FontAwesome: {
                normal: 'assets/fonts/fa-regular-400.ttf',
                bold: 'assets/fonts/fa-solid-900.ttf',
                italics: 'assets/fonts/fa-brands-400.ttf'
            }
        };

        let base64String = '';
        const printer = new PdfPrinter(fonts);

        const content = [];
        let basicProfile = [];

        // Basic profile
        if (options.basic) {
            if (_.has(profile, 'export.basicInformation') && !_.isEmpty(profile.export.basicInformation)) {
                tmpText = concatStrings([profile.name, profile.surname], {seperator: ' '});

                if (!_.isEmpty(tmpText)) {
                    basicProfile.push(
                        {
                            text: tmpText,
                            style: 'h1'
                        }
                    );
                }

                basicProfile.push({
                    text: [
                        profile.export.basicInformation
                    ]
                });
            } else {
                tmpText = concatStrings([profile.name, profile.surname], {seperator: ' '});
                if (!_.isEmpty(tmpText)) {
                    basicProfile.push(
                        {
                            text: tmpText,
                            style: 'h1'
                        }
                    );
                }

                const jobDescription = [];

                if (!_.isEmpty(profile.jobTitle)) {
                    jobDescription.push(profile.jobTitle);
                }

                if (!_.isEmpty(profile.role)) {
                    jobDescription.push(profile.role);
                }

                if (!_.isEmpty(jobDescription)) {
                    basicProfile.push({
                        text: concatStrings(jobDescription, {seperator: ' - '})
                    });
                }


                const directorates = profile.groups.filter(group => group.type === 'Directorate');
                const researchLines = profile.groups.filter(group => group.type === 'Research Line');
                const facilities = profile.groups.filter(group => group.type === 'Facility');

                if (!_.isEmpty(directorates)) {
                    const directorateNames = directorates.map(directorate => {
                        if (_.has(directorate, 'offices') && directorate.offices.length > 0) {
                            return directorate.name + ' - ' + concatStrings(directorate.offices);
                        }
                        return directorate.name;
                    });

                    if (directorateNames.length > 1) {

                        for (const name of directorateNames) {
                            basicProfile.push({
                                text: name
                            });
                        }

                        basicProfile.push({
                            text: ' ',
                            fontSize: 5
                        });

                    } else {
                        basicProfile.push({
                            text: [concatStrings(directorateNames)]
                        });
                    }
                }

                if (!_.isEmpty(researchLines)) {

                    const researchLineNames = researchLines.map(researchLine => {
                        if (_.has(researchLine, 'center.name')) {
                            return researchLine.name + ' - ' + researchLine.center.name;
                        }
                        return researchLine.name;
                    });

                    if (researchLineNames.length > 1) {
                        const title = 'Research lines: ';

                        basicProfile.push({
                            text: [
                                {
                                    text: title,
                                    style: 'bold'
                                }
                            ]
                        });

                        for (const name of researchLineNames) {
                            basicProfile.push({
                                text: name
                            });
                        }

                        basicProfile.push({
                            text: ' ',
                            fontSize: 5
                        });
                    } else {
                        const title = 'Research line: ';

                        basicProfile.push({
                            text: _.concat([
                                {
                                    text: title,
                                    style: 'bold'
                                }
                            ], researchLineNames)
                        });
                    }
                }

                if (!_.isEmpty(facilities)) {

                    const facilityNames = facilities.map(facility => {
                        return facility.name;
                    });

                    if (facilityNames.length > 1) {
                        const title = 'Facilities: ';

                        basicProfile.push({
                            text: [
                                {
                                    text: title,
                                    style: 'bold'
                                }
                            ]
                        });

                        for (const name of facilityNames) {
                            basicProfile.push({
                                text: name
                            });
                        }

                        basicProfile.push({
                            text: ' ',
                            fontSize: 5
                        });

                    } else {
                        const title = 'Facility: ';

                        basicProfile.push({
                            text: _.concat([
                                {
                                    text: title,
                                    style: 'bold'
                                }
                            ], facilityNames)
                        });
                    }
                }

                if (!_.isEmpty(profile.titles)) {
                    let title = 'Title: ';
                    if (profile.titles.length > 1) {
                        title = 'Titles: ';
                    }

                    basicProfile.push({
                        text: ' ',
                        fontSize: 5
                    });

                    basicProfile.push({
                        text: [
                            {
                                text: title,
                                style: 'bold'
                            },
                            concatStrings(profile.titles)
                        ]
                    });
                }

                basicProfile.push({
                    text: ' ',
                    fontSize: 5
                });

                // Contacts
                if (!_.isEmpty(profile.username)) {
                    basicProfile.push({
                        text: [
                            {
                                text: '',
                                style: 'fontAwesome'
                            },
                            ' ' + profile.username
                        ]
                    });
                }

                if (!_.isEmpty(profile.phone)) {
                    basicProfile.push({
                        text: [
                            {
                                text: '',
                                style: [
                                    'fontAwesome',
                                    'solid'
                                ]
                            },
                            ' ' + profile.phone
                        ]
                    });
                }

                if (!_.isEmpty(profile.address)) {
                    basicProfile.push({
                        text: [
                            {
                                text: '',
                                style: [
                                    'fontAwesome',
                                    'solid'
                                ]
                            },
                            ' ' + profile.address
                        ]
                    });
                }

                if (!_.isEmpty(profile.website)) {
                    basicProfile.push({
                        text: [
                            {
                                text: '',
                                style: [
                                    'fontAwesome',
                                    'solid'
                                ]
                            },
                            ' ' + profile.website
                        ]
                    });
                }
            }

            let profileImage = null;
            if (profile.image) {
                try {
                    const stat = util.promisify(fs.stat);
                    const imagePath = path.resolve(
                        sails.config.appPath,
                        'profile',
                        'images',
                        researchEntityId.toString(),
                        profile.image
                    );
                    await stat(imagePath);
                    profileImage = imagePath;
                } catch (error) {
                    profileImage = null;
                }
            }

            if (profileImage) {
                content.push({
                    columns: [{
                        width: '*',
                        stack: basicProfile,
                        margin: [0, 0, 20, 0]
                    }, {
                        image: profileImage,
                        width: 100
                    }]
                });
            } else {
                if (!_.isEmpty(basicProfile)) {
                    content.push({
                        stack: basicProfile
                    });
                }
            }
        }

        // Socials
        if (options.socials) {
            let socials = [];
            if (!_.isEmpty(profile.socials && profile.socials.linkedin)) {
                socials.push({
                    text: [
                        {
                            text: '',
                            style: [
                                'fontAwesome',
                                'brands'
                            ]
                        },
                        ' ' + profile.socials.linkedin
                    ]
                });
            }

            if (!_.isEmpty(profile.socials && profile.socials.twitter)) {
                socials.push({
                    text: [
                        {
                            text: '',
                            style: [
                                'fontAwesome',
                                'brands'
                            ]
                        },
                        ' ' + profile.socials.twitter
                    ]
                });
            }

            if (!_.isEmpty(profile.socials && profile.socials.facebook)) {
                socials.push({
                    text: [
                        {
                            text: '',
                            style: [
                                'fontAwesome',
                                'brands'
                            ]
                        },
                        ' ' + profile.socials.facebook
                    ]
                });
            }

            if (!_.isEmpty(profile.socials && profile.socials.instagram)) {
                socials.push({
                    text: [
                        {
                            text: '',
                            style: [
                                'fontAwesome',
                                'brands'
                            ]
                        },
                        ' ' + profile.socials.instagram
                    ]
                });
            }

            if (!_.isEmpty(profile.socials && profile.socials.researchgate)) {
                socials.push({
                    text: [
                        {
                            text: '',
                            style: [
                                'fontAwesome',
                                'brands'
                            ]
                        },
                        ' ' + profile.socials.researchgate
                    ]
                });
            }

            if (!_.isEmpty(profile.socials && profile.socials.github)) {
                socials.push({
                    text: [
                        {
                            text: '',
                            style: [
                                'fontAwesome',
                                'brands'
                            ]
                        },
                        ' ' + profile.socials.github
                    ]
                });
            }

            if (!_.isEmpty(profile.socials && profile.socials.bitbucket)) {
                socials.push({
                    text: [
                        {
                            text: '',
                            style: [
                                'fontAwesome',
                                'brands'
                            ]
                        },
                        ' ' + profile.socials.bitbucket
                    ]
                });
            }

            if (!_.isEmpty(profile.socials && profile.socials.youtube)) {
                socials.push({
                    text: [
                        {
                            text: '',
                            style: [
                                'fontAwesome',
                                'brands'
                            ]
                        },
                        ' ' + profile.socials.youtube
                    ]
                });
            }

            if (!_.isEmpty(profile.socials && profile.socials.flickr)) {
                socials.push({
                    text: [
                        {
                            text: '',
                            style: [
                                'fontAwesome',
                                'brands'
                            ]
                        },
                        ' ' + profile.socials.flickr
                    ]
                });
            }

            if (!_.isEmpty(socials)) {
                socials = _.chunk(socials, _.round(socials.length / 2));

                content.push({
                    text: ' ',
                    fontSize: 5
                });

                content.push({
                    columns: socials
                });
            }
        }

        if (options.basic || options.socials) {
            content.push({
                text: ' ',
                fontSize: 20
            });
        }

        // About
        if (options.about && !_.isEmpty(profile.description)) {
            content.push({
                unbreakable: true,
                stack: [
                    {
                        text: 'About me',
                        style: 'h2'
                    }, {
                        text: profile.description
                    }
                ]
            });
        }

        // Interests
        if (options.about && !_.isEmpty(profile.interests)) {
            content.push({
                text: ' ',
                fontSize: 10
            });

            content.push({
                text: 'Interests',
                style: 'h3'
            });

            content.push({
                ul: profile.interests,
                style: 'lighten'
            });
        }

        // Add some whitespace
        if (
            options.about && !_.isEmpty(profile.description) ||
            options.about && !_.isEmpty(profile.interests)
        ) {
            content.push({
                text: ' ',
                fontSize: 20
            });
        }

        // Experiences
        if (options.experiences && !_.isEmpty(profile.experiences)) {
            const experiences = _.groupBy(profile.experiences, 'company');

            content.push({
                unbreakable: true,
                text: 'Experiences',
                style: 'h2'
            });

            let count = 0;
            for (const company in experiences) {
                if (count > 0) {
                    content.push({
                        text: ' '
                    });
                }

                for (let i = 0; i < experiences[company].length; i++) {
                    const experience = experiences[company][i];

                    experience.company = company;

                    if (i > 0) {
                        content.push({
                            text: ' '
                        });
                    }

                    content.push({
                        unbreakable: true,
                        stack: getExperienceText(experience)
                    });
                }

                count++;
            }

            content.push({
                text: ' ',
                fontSize: 20
            });
        }

        // Education
        if (options.education && !_.isEmpty(profile.education)) {
            const educationItems = profile.education;

            content.push({
                unbreakable: true,
                text: 'Education',
                style: 'h2'
            });

            for (let i = 0; i < educationItems.length; i++) {
                const educationItem = educationItems[i];

                if (i > 0) {
                    content.push({
                        text: ' '
                    });
                }

                content.push({
                    unbreakable: true,
                    stack: getEducationText(educationItem)
                });
            }

            content.push({
                text: ' ',
                fontSize: 20
            });
        }

        // Certificates
        if (options.certificates && !_.isEmpty(profile.certificates)) {
            const certificates = profile.certificates;

            content.push({
                unbreakable: true,
                text: 'Certificates',
                style: 'h2'
            });

            for (let i = 0; i < certificates.length; i++) {
                const certificate = certificates[i];

                if (i > 0) {
                    content.push({
                        text: ' '
                    });
                }

                content.push({
                    unbreakable: true,
                    stack: getCertificateText(certificate)
                });
            }

            content.push({
                text: ' ',
                fontSize: 20
            });
        }

        // Skills
        if (options.skills && !_.isEmpty(profile.skillCategories)) {

            content.push({
                unbreakable: true,
                text: 'Skills',
                style: 'h2'
            });

            for (let i = 0; i < profile.skillCategories.length; i++) {
                const category = profile.skillCategories[i];

                if (i > 0) {
                    content.push({
                        text: ' '
                    });
                }

                content.push({
                    unbreakable: true,
                    stack: getSkillCategoryText(category)
                });
            }

            content.push({
                text: ' ',
                fontSize: 20
            });
        }

        // Documents
        if (options.documents && !_.isEmpty(profile.documents)) {

            const documents = _.groupBy(profile.documents, 'source.sourcetype');

            content.push({
                unbreakable: true,
                text: 'Documents',
                style: 'h2'

            });

            let i = 0;
            for (const sourceTypeId in documents) {
                const sourceType = SourceTypes.get().find(st => st.id === parseInt(sourceTypeId));

                if (i > 0) {
                    content.push({
                        text: ' '
                    });
                }

                content.push({
                    unbreakable: true,
                    stack: getDocumentCategoryText(sourceType.label, documents[sourceTypeId])
                });

                i++;
            }

            content.push({
                text: ' ',
                fontSize: 20
            });
        }

        // Accomplishments
        if (options.accomplishments && !_.isEmpty(profile.accomplishments)) {

            const accomplishments = _.groupBy(profile.accomplishments, 'type.label');

            content.push({
                unbreakable: true,
                text: 'Accomplishments',
                style: 'h2'
            });

            let i = 0;
            for (const category in accomplishments) {

                if (i > 0) {
                    content.push({
                        text: ' '
                    });
                }

                content.push({
                    unbreakable: true,
                    stack: getAccomplishmentCategoryText(category, accomplishments[category])
                });

                i++;
            }

            content.push({
                text: ' ',
                fontSize: 20
            });
        }

        // Styles
        const styles = {
            h1: {
                font: 'RobotoSlab',
                fontSize: 16,
                color: '#2C91C2',
                margin: [0,0,0,5]
            },
            h2: {
                font: 'RobotoSlab',
                fontSize: 14,
                color: '#2C91C2',
                margin: [0,0,0,5]
            },
            h3: {
                font: 'RobotoSlab',
                fontSize: 10,
                color: '#515151',
                margin: [0,0,0,5]
            },
            lighten: {
                color: '#999999'
            },
            fontAwesome: {
                font: 'FontAwesome'
            },
            bold: {
                bold: true
            },
            italics: {
                italics: true
            },
            brands: {
                italics: true
            },
            solid: {
                bold: true
            }
        };

        const defaultStyle = {
            font: 'OpenSans',
            fontSize: 10,
            color: '#515151'
        };

        const docDefinition = {
            pageSize: 'A4',
            pageOrientation: 'portrait',
            pageMargins: [ 40, 40, 40, 70],
            content: content,
            styles: styles,
            defaultStyle: defaultStyle,
            footer: function(currentPage, pageCount, pageSize) {
                return [
                    {
                        canvas: [
                            {
                                type: 'line',
                                x1: 40,
                                y1: 10,
                                x2: pageSize.width - 40,
                                y2: 10,
                                lineWidth: 1,
                                lineColor: '#cccccc'
                            }
                        ]
                    }, {
                        columns: [
                            {
                                text: 'Page ' + currentPage.toString() + ' of ' + pageCount,
                                alignment: 'right',
                                margin: [40, 10]
                            }
                        ]
                    }
                ]
            }
        };

        const pdfDoc = printer.createPdfKitDocument(docDefinition, {});
        const stream = pdfDoc.pipe(new Base64Encode());
        pdfDoc.end();

        stream.on('data', function(chunk) {
            base64String += chunk;
        });

        stream.on('end', function() {
            resolve(base64String);
        });
    });
}

async function toDoc(researchEntityId, options = {}) {
    const {
        Document,
        Paragraph,
        Packer,
        TextRun,
        HeadingLevel,
        Media,
        HorizontalPositionRelativeFrom,
        HorizontalPositionAlign,
        VerticalPositionRelativeFrom,
        TextWrappingSide,
        TextWrappingType
    } = docx;
    const doc = new Document({
        creator: 'Scientilla',
        title: 'My profile',
        styles: {
            paragraphStyles: [
                {
                    id: 'default',
                    name: 'default',
                    basedOn: 'Normal',
                    next: 'Normal',
                    quickFormat: true,
                    run: {},
                    paragraph: {
                        spacing: {
                            after: 240
                        }
                    }
                }
            ]
        }
    });

    options = initializeOptions(options);

    const profile = await getProfile(researchEntityId);

    let profileImage = null;

    await new Promise(async (resolve, reject) => {
        try{
            if (profile.image) {
                const readFile = util.promisify(fs.readFile);
                const imagePath = path.resolve(
                    sails.config.appPath,
                    'profile',
                    'images',
                    researchEntityId.toString(),
                    profile.image
                );
                const stat = util.promisify(fs.stat);

                await stat(imagePath);

                await readFile(imagePath).then(async (file) => {
                    const image = Media.addImage(doc, file, 150, 150, {
                        floating: {
                            horizontalPosition: {
                                relative: HorizontalPositionRelativeFrom.MARGIN,
                                align: HorizontalPositionAlign.RIGHT,
                            },
                            verticalPosition: {
                                relative: VerticalPositionRelativeFrom.MARGIN,
                                offset: 0
                            },
                            wrap: {
                                type: TextWrappingType.SQUARE,
                                side: TextWrappingSide.LEFT,
                            },
                            margins: {
                                left: 30,
                                bottom: 30
                            }
                        }
                    });

                    resolve(image);
                });
            } else {
                reject('No profile image!');
            }
        } catch(error) {
            reject(error);
        }
    }).then(image => {
        profileImage = image;
    }).catch(error => {
        profileImage = null;
    });

    let tmpText = '';

    let baseProfile = [];
    const jobDescription = [];

    if (!_.isEmpty(profile.jobTitle)) {
        jobDescription.push(profile.jobTitle);
    }

    if (!_.isEmpty(profile.role)) {
        jobDescription.push(profile.role);
    }

    if (!_.isEmpty(profile.role)) {
        baseProfile.push(new TextRun(concatStrings(jobDescription, {seperator: ' - '})));
    }

    baseProfile.push(new TextRun('').break());

    const directorates = profile.groups.filter(group => group.type === 'Directorate');
    const researchLines = profile.groups.filter(group => group.type === 'Research Line');
    const facilities = profile.groups.filter(group => group.type === 'Facility');

    if (!_.isEmpty(directorates)) {
        const directorateNames = directorates.map(directorate => {
            if (_.has(directorate, 'offices') && directorate.offices.length > 0) {
                return directorate.name + ' - ' + concatStrings(directorate.offices);
            }
            return directorate.name;
        });

        if (directorateNames.length > 1) {

            for (const name of directorateNames) {
                baseProfile.push(new TextRun(name).break());
            }

            baseProfile.push(new TextRun('').break());
        } else {
            baseProfile.push(
                new TextRun(concatStrings(directorateNames))
            );
        }
    }

    if (!_.isEmpty(researchLines)) {

        const researchLineNames = researchLines.map(researchLine => {
            if (_.has(researchLine, 'center.name')) {
                return researchLine.name + ' - ' + researchLine.center.name;
            }
            return researchLine.name;
        });

        if (researchLineNames.length > 1) {
            const title = 'Research lines: ';

            baseProfile.push(
                new TextRun({
                    text: title,
                    bold: true
                }).break()
            );

            for (const name of researchLineNames) {
                baseProfile.push(new TextRun(name).break());
            }

            baseProfile.push(new TextRun('').break());
        } else {
            const title = 'Research line: ';

            baseProfile.push(
                new TextRun({
                    text: title,
                    bold: true
                }).break()
            );

            baseProfile.push(
                new TextRun(concatStrings(researchLineNames))
            );
        }
    }

    if (!_.isEmpty(facilities)) {

        const facilityNames = facilities.map(facility => {
            return facility.name;
        });

        if (facilityNames.length > 1) {
            const title = 'Facilities: ';

            baseProfile.push(
                new TextRun({
                    text: title,
                    bold: true
                }).break()
            );

            for (const name of facilityNames) {
                baseProfile.push(new TextRun(name).break());
            }

            baseProfile.push(new TextRun('').break());
        } else {
            const title = 'Facility: ';

            baseProfile.push(
                new TextRun({
                    text: title,
                    bold: true
                }).break()
            );

            baseProfile.push(
                new TextRun(concatStrings(facilityNames))
            );
        }
    }

    const contacts = [];
    if (!_.isEmpty(profile.username)) {
        contacts.push(new TextRun(profile.username).break());
    }

    if (!_.isEmpty(profile.phone)) {
        contacts.push(new TextRun(profile.phone).break());
    }

    if (!_.isEmpty(profile.address)) {
        contacts.push(new TextRun(profile.address).break());
    }

    if (!_.isEmpty(profile.website)) {
        contacts.push(new TextRun(profile.website).break());
    }

    if (!_.isEmpty(contacts)) {
        contacts.unshift(new TextRun({
            text: 'Contact: ',
            bold: true
        }));
    }

    const socials = [];
    if (!_.isEmpty(profile.socials && profile.socials.linkedin)) {
        socials.push(new TextRun(profile.socials.linkedin).break());
    }

    if (!_.isEmpty(profile.socials && profile.socials.twitter)) {
        socials.push(new TextRun(profile.socials.twitter).break());
    }

    if (!_.isEmpty(profile.socials && profile.socials.facebook)) {
        socials.push(new TextRun(profile.socials.facebook).break());
    }

    if (!_.isEmpty(profile.socials && profile.socials.instagram)) {
        socials.push(new TextRun(profile.socials.instagram).break());
    }

    if (!_.isEmpty(profile.socials && profile.socials.researchgate)) {
        socials.push(new TextRun(profile.socials.researchgate).break());
    }

    if (!_.isEmpty(profile.socials && profile.socials.github)) {
        socials.push(new TextRun(profile.socials.github).break());
    }

    if (!_.isEmpty(profile.socials && profile.socials.bitbucket)) {
        socials.push(new TextRun(profile.socials.bitbucket).break());
    }

    if (!_.isEmpty(profile.socials && profile.socials.youtube)) {
        socials.push(new TextRun(profile.socials.youtube).break());
    }

    if (!_.isEmpty(profile.socials && profile.socials.flickr)) {
        socials.push(new TextRun(profile.socials.flickr).break());
    }

    if (!_.isEmpty(socials)) {
        socials.unshift(new TextRun({
            text: 'Socials: ',
            bold: true
        }))
    }

    const titles = [];
    if (!_.isEmpty(profile.titles)) {
        for (let i = 0; i < profile.titles.length; i++) {
            const title = profile.titles[i];

            if (!_.isEmpty(title)) {
                titles.push(title);
            }
        }
    }

    const interests = [];
    if (!_.isEmpty(profile.interests)) {
        for (let i = 0; i < profile.interests.length; i++) {
            const interest = profile.interests[i];

            let paragraph = new Paragraph({
                text: interest,
                bullet: {
                    level: 0
                }
            });

            if (i === profile.interests.length-1) {
                paragraph = new Paragraph({
                    text: interest,
                    bullet: {
                        level: 0
                    },
                    style: 'default'
                });
            }

            interests.push(paragraph);
        }
    }

    const experiences = [];
    const experiencesByCompany = _.groupBy(profile.experiences, 'company');
    let companyCount = 0;
    for (const company in experiencesByCompany) {
        if (!_.isEmpty(experiencesByCompany[company])) {
            for (let i = 0; i < experiencesByCompany[company].length; i++) {
                const experience = experiencesByCompany[company][i];

                experiences.push(
                    new TextRun({
                        text: company,
                        bold: true
                    })
                );

                if (!_.isEmpty(experience.jobTitle)) {
                    experiences.push(
                        new TextRun(experience.jobTitle).break()
                    );
                }

                experience.from = formatDateExperience(experience.from);

                if (!_.has(experience, 'to') || _.isEmpty(experience.to) || isFuture(experience.to)) {
                    experience.to = 'Present';
                } else {
                    experience.to = formatDateExperience(experience.to);
                }

                tmpText = concatStrings([experience.from, experience.to], {seperator: ' - '});
                if (!_.isEmpty(tmpText)) {
                    experiences.push(
                        new TextRun({
                            text: tmpText,
                            color: '999999'
                        }).break()
                    );
                }

                if (!_.isEmpty(experience.lines)) {
                    for (const line of experience.lines) {
                        if (!_.isEmpty(line.name) || !_.isEmpty(line.office)) {
                            experiences.push(
                                new TextRun({
                                    text: concatStrings([line.name, line.office], {seperator: ' - '}),
                                    color: '999999'
                                }).break()
                            );
                        }
                    }
                }

                tmpText = concatStrings([experience.location, experience.country]);
                if (!_.isEmpty(tmpText)) {
                    experiences.push(
                        new TextRun({
                            text: tmpText,
                            color: '999999'
                        }).break()
                    );
                }

                if (!_.isEmpty(experience.jobDescription)) {
                    experiences.push(
                        new TextRun(experience.jobDescription).break()
                    );
                }

                if (i < experiencesByCompany[company].length - 1) {
                    experiences.push(
                        new TextRun('').break()
                    );
                    experiences.push(
                        new TextRun('').break()
                    );
                }
            }

            if (companyCount < Object.keys(experiencesByCompany).length - 1) {
                experiences.push(
                    new TextRun('').break()
                );
                experiences.push(
                    new TextRun('').break()
                );
            }
        }

        companyCount++;
    }

    const education = [];
    if (!_.isEmpty(profile.education)) {
        for (let i = 0; i < profile.education.length; i++) {
            const educationItem = profile.education[i];

            if (!_.isEmpty(educationItem.institute)) {
                education.push(
                    new TextRun(educationItem.institute)
                );
            }

            if (!_.isEmpty(educationItem.title)) {
                education.push(
                    new TextRun({
                        text: educationItem.title,
                        bold: true
                    }).break()
                );
            }

            educationItem.from = formatDateEducation(educationItem.from);

            if (!_.has(educationItem, 'to') || _.isEmpty(educationItem.to) || isFuture(educationItem.to)) {
                educationItem.to = 'Present';
            } else {
                educationItem.to = formatDateEducation(educationItem.to);
            }

            tmpText = concatStrings([educationItem.from, educationItem.to], {seperator: ' - '});
            if (!_.isEmpty(tmpText)) {
                education.push(
                    new TextRun({
                        text: tmpText,
                        color: '999999'
                    }).break()
                );
            }

            tmpText = concatStrings([educationItem.location, educationItem.country]);
            if (!_.isEmpty(tmpText)) {
                education.push(
                    new TextRun({
                        text: tmpText,
                        color: '999999'
                    }).break()
                );
            }

            if (i < profile.education.length - 1) {
                education.push(
                    new TextRun('').break()
                );
                education.push(
                    new TextRun('').break()
                );
            }
        }
    }

    const certificates = [];
    if (!_.isEmpty(profile.certificates)) {
        for (let i = 0; i < profile.certificates.length; i++) {
            const certificate = profile.certificates[i];

            if (!_.isEmpty(certificate.title)) {
                certificates.push(
                    new TextRun({
                        text: certificate.title,
                        bold: true
                    })
                );
            }

            if (!_.isEmpty(certificate.description)) {
                certificates.push(
                    new TextRun(certificate.description).break()
                );
            }

            if (!_.isEmpty(certificate.date)) {
                certificates.push(
                    new TextRun({
                        text: formatDate(certificate.date),
                        color: '999999'
                    }).break()
                );
            }

            if (i < profile.certificates.length - 1) {
                certificates.push(
                    new TextRun('').break()
                );
                certificates.push(
                    new TextRun('').break()
                );
            }
        }
    }

    const skills = [];
    if (!_.isEmpty(profile.skillCategories)) {
        for (let i = 0; i < profile.skillCategories.length; i++) {
            const category = profile.skillCategories[i];

            if (i === 0) {
                skills.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: category.categoryName,
                                bold: true
                            })
                        ]
                    })
                );
            } else {
                skills.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: category.categoryName,
                                bold: true
                            }).break()
                        ]
                    })
                );
            }

            if (!_.isEmpty(category.skills)) {
                for (let i = 0; i < category.skills.length; i++) {
                    const skill = category.skills[i];
                    let paragraph = new Paragraph({
                        text: skill,
                        bullet: {
                            level: 0
                        }
                    });

                    if (i === category.skills.length-1) {
                        paragraph = new Paragraph({
                            text: skill,
                            bullet: {
                                level: 0
                            },
                            style: 'default'
                        });
                    }

                    skills.push(paragraph);
                }
            }
        }
    }

    const documents = [];
    const documentsBySourceType = _.groupBy(profile.documents, 'source.sourcetype');

    for (const sourceTypeId in documentsBySourceType) {

        const sourceType = SourceTypes.get().find(st => st.id === parseInt(sourceTypeId));

        if (!_.isEmpty(sourceType)) {
            documents.push(
                new Paragraph({
                    text: sourceType.label,
                    heading: HeadingLevel.HEADING_3
                })
            );
        }

        if (!_.isEmpty(documentsBySourceType[sourceTypeId])) {
            for (let i = 0; i < documentsBySourceType[sourceTypeId].length; i++) {
                const document = documentsBySourceType[sourceTypeId][i];

                if (!_.isEmpty(document) &&
                    (
                        !_.isEmpty(document.authorsStr) ||
                        !_.isEmpty(document.year) ||
                        !_.isEmpty(document.title) ||
                        !_.isEmpty(document.source) ||
                        !_.isEmpty(document.volume) ||
                        !_.isEmpty(document.pages)
                    )
                ) {
                    const documentText = [];
                    let subText = [];

                    if (i > 0) {
                        documentText.push(
                            new TextRun({}).break()
                        );
                    }

                    if (!_.isEmpty(document.authorsStr)) {
                        documentText.push(
                            new TextRun({
                                text: document.authorsStr
                            })
                        );
                    }

                    if (!_.isEmpty(document.year)) {
                        documentText.push(
                            new TextRun({
                                text: ' (' + document.year + '). '
                            })
                        );
                    }

                    if (!_.isEmpty(document.title)) {
                        subText.push(
                            new TextRun({
                                text: document.title
                            })
                        );
                    }

                    if (!_.isEmpty(document.source)) {
                        subText.push(
                            new TextRun({
                                text: document.source.title,
                                italics: true
                            })
                        );
                    }

                    if (!_.isEmpty(document.volume)) {
                        subText.push(
                            new TextRun({
                                text: document.volume
                            })
                        );
                    }

                    if (!_.isEmpty(document.pages)) {
                        subText.push(
                            new TextRun({
                                text: document.pages
                            })
                        );
                    }

                    if (subText.length > 0) {
                        subText = insertIntoArray(
                            subText,
                            new TextRun({
                                text: ', '
                            })
                        );

                        subText.push(
                            new TextRun({
                                text: '.'
                            })
                        );
                    }

                    let paragraph = new Paragraph({
                        children: _.concat(documentText, subText),
                        indent: {
                            left: 360,
                        }
                    });

                    if (i === documentsBySourceType[sourceTypeId].length-1) {
                        paragraph = new Paragraph({
                            children: _.concat(documentText, subText),
                            indent: {
                                left: 360,
                            },
                            style: 'default'
                        });
                    }

                    documents.push(paragraph);
                }
            }
        }
    }

    const accomplishments = [];
    const accomplishmentsByType = _.groupBy(profile.accomplishments, 'type.label');
    for (const type in accomplishmentsByType) {

        if (!_.isEmpty(type)) {
            accomplishments.push(
                new Paragraph({
                    text: type,
                    heading: HeadingLevel.HEADING_3
                })
            );
        }

        if (!_.isEmpty(accomplishmentsByType[type])) {
            for (let i = 0; i < accomplishmentsByType[type].length; i++) {
                const accomplishment = accomplishmentsByType[type][i];

                if (
                    !_.isEmpty(accomplishment) &&
                    (
                        !_.isEmpty(accomplishment.title) ||
                        !_.isEmpty(accomplishment.issuer) ||
                        !_.isEmpty(accomplishment.year)
                    )
                ) {
                    const children = [];

                    if (!_.isEmpty(accomplishment.title)) {
                        children.push(
                            new TextRun({
                                text: accomplishment.title,
                                bold: true
                            })
                        );

                        children.push(
                            new TextRun({}).break()
                        );
                    }

                    if (!_.isEmpty(accomplishment.issuer)) {
                        children.push(
                            new TextRun({
                                text: 'Issuer: ' + accomplishment.issuer
                            })
                        );

                        children.push(
                            new TextRun({}).break()
                        );
                    }

                    if (!_.isEmpty(accomplishment.year)) {
                        children.push(
                            new TextRun({
                                text: 'Year: ' + accomplishment.year
                            })
                        );

                        children.push(
                            new TextRun({}).break()
                        );
                    }

                    let paragraph = new Paragraph({
                        children: children,
                        indent: {
                            left: 360,
                        }
                    });

                    if (i === accomplishmentsByType[type].length-1) {
                        paragraph = new Paragraph({
                            children: children,
                            indent: {
                                left: 360,
                            },
                            style: 'default'
                        });
                    }

                    accomplishments.push(paragraph);
                }
            }
        }
    }

    let text = [];

    if (options.basic) {
        tmpText = concatStrings([profile.name, profile.surname], {seperator: ' '});

        if (!_.isEmpty(tmpText)) {
            text.push(
                new Paragraph({
                    text:  tmpText,
                    heading: HeadingLevel.HEADING_1
                })
            );
        }

        if (_.has(profile, 'export.basicInformation') && !_.isEmpty(profile.export.basicInformation)) {
            baseProfile = [];
            const lines = profile.export.basicInformation.split('\n');
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (i === 0) {
                    baseProfile.push(new TextRun(line));
                } else {
                    baseProfile.push(new TextRun(line).break());
                }
            }
        }

        if (!_.isEmpty(baseProfile) && !_.isNil(profileImage)) {
            text.push(
                new Paragraph({
                    children: _.concat(baseProfile, profileImage)
                })
            );
        } else {
            if (!_.isEmpty(baseProfile)) {
                text.push(
                    new Paragraph({
                        children: baseProfile
                    })
                );
            }

            if (!_.isNil(profileImage)) {
                text.push(
                    new Paragraph({
                        children: profileImage
                    })
                );
            }
        }

        if (!_.isEmpty(titles)) {
            text.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'Titles: ',
                            bold: true
                        }).break(),
                        new TextRun({
                            text: titles.join(', ')
                        }),

                    ]
                })
            );
        }

        if (!_.isEmpty(contacts)) {
            text.push(
                new Paragraph({
                    children: contacts,
                    style: 'default'
                })
            );
        }
    }

    if (options.socials) {
        if (!_.isEmpty(socials)) {
            text.push(
                new Paragraph({
                    children: socials,
                    style: 'default'
                })
            );
        }
    }

    // About me
    if (options.about && !_.isEmpty(profile.description)) {
        text.push(
            new Paragraph({
                text: 'About me',
                heading: HeadingLevel.HEADING_2
            })
        );
        text.push(
            new Paragraph({
                children: [
                    new TextRun(profile.description)
                ],
                style: 'default'
            })
        );
    }

    // Interests
    if (options.about && !_.isEmpty(profile.interests)) {
        text.push(
            new Paragraph({
                text: 'Interests',
                heading: HeadingLevel.HEADING_3
            })
        );

        text = _.concat(text, interests);
    }

    // Experiences
    if (options.experiences && !_.isEmpty(experiences)) {
        text.push(
            new Paragraph({
                text: 'Experiences',
                heading: HeadingLevel.HEADING_2
            })
        );

        text.push(
            new Paragraph({
                children: experiences,
                style: 'default'
            })
        );
    }

    // Education
    if (options.education && !_.isEmpty(education)) {

        text.push(
            new Paragraph({
                text: 'Education',
                heading: HeadingLevel.HEADING_2
            })
        );

        text.push(
            new Paragraph({
                children: education,
                style: 'default'
            })
        );
    }

    // Certificates
    if (options.certificates && !_.isEmpty(certificates)) {

        text.push(
            new Paragraph({
                text: 'Certificates',
                heading: HeadingLevel.HEADING_2
            })
        );

        text.push(
            new Paragraph({
                children: certificates,
                style: 'default'
            })
        );
    }

    // Skills
    if (options.skills && !_.isEmpty(skills)) {

        text.push(
            new Paragraph({
                text: 'Skills',
                heading: HeadingLevel.HEADING_2
            })
        );

        text = _.concat(text, skills);
    }

    // Documents
    if (options.documents && !_.isEmpty(documents)) {

        text.push(
            new Paragraph({
                text: 'Documents',
                heading: HeadingLevel.HEADING_2
            })
        );

        text = _.concat(text, documents);
    }

    // Accomplishments
    if (options.accomplishments && !_.isEmpty(accomplishments)) {

        text.push(
            new Paragraph({
                text: 'Accomplishments',
                heading: HeadingLevel.HEADING_2
            })
        );
        text = _.concat(text, accomplishments);
    }

    doc.addSection({
        properties: {},
        children: text
    });

    return await Packer.toBase64String(doc).then(b64string => {
        return b64string;
    });
};