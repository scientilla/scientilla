// Profile.js - in api/services

"use strict";

const docx = require("docx");
const { Document, Paragraph, Packer, TextRun, HeadingLevel, Media, HorizontalPositionRelativeFrom, HorizontalPositionAlign, VerticalPositionRelativeFrom, VerticalPositionAlign, TextWrappingSide, TextWrappingType} = docx;
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

module.exports = {
    toPDF,
    toDoc
};

async function toPDF(researchEntityId, options = {}) {

    options = initializeOptions(options);

    let tmpText = '';

    const profile = await ResearchEntityData.getProfile(researchEntityId);

    //sails.log.debug(util.inspect(profile, false, null, true));

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

            experience.from = formatDate(experience.from);

            if (!_.has(experience, 'to') || _.isEmpty(experience.to)) {
                experience.to = 'Present';
            } else {
                experience.to = formatDate(experience.to);
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

            educationItem.from = formatDate(educationItem.from);

            if (!_.has(educationItem, 'to') || _.isEmpty(educationItem.to)) {
                educationItem.to = 'Present';
            } else {
                educationItem.to = formatDate(educationItem.to);
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
            if (!_.isEmpty(category.value)) {
                stack.push({
                    text: category.value,
                    style: 'bold'
                });
            }

            if (!_.isEmpty(category.skills)) {

                const skills = [];
                for (let i = 0; i < category.skills.length; i++) {
                    const skill = category.skills[i];
                    skills.push(skill.value);
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
            const stack = [];

            if (!_.isEmpty(document)) {
                if (i > 0) {
                    text.push({
                        text: ' '
                    });
                }

                if (!_.isEmpty(document.title)) {
                    stack.push({
                        text: document.title,
                        style: 'bold'
                    });
                }

                if (!_.isEmpty(document.source)) {
                    stack.push({
                        text: 'Document source: ' + document.source.title,
                    });
                }

                if (!_.isEmpty(document.doi)) {
                    stack.push({
                        text: 'Doi: ' + document.doi,
                    });
                }

                text.push({
                    unbreakable: true,
                    stack: stack,
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

    return new Promise(resolve => {
        /// Define font files
        const fonts = {
            RobotoSlab: {
                normal: 'assets/fonts/RobotoSlab-Regular.ttf',
                bold: 'assets/fonts/RobotoSlab-Bold.ttf'
            },
            OpenSans: {
                normal: 'assets/fonts/OpenSans-Regular.ttf',
                bold: 'assets/fonts/OpenSans-Bold.ttf'
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
        const basicProfile = [];

        // Basic profile
        if (options.basic) {
            tmpText = concatStrings([profile.name, profile.surname], {seperator: ' '});
            if (!_.isEmpty(tmpText)) {
                basicProfile.push(
                    {
                        text: tmpText,
                        style: 'h1'
                    }
                );
            }

            if (!_.isEmpty(profile.jobTitle)) {
                basicProfile.push({
                    text: profile.jobTitle
                });
            }

            if (!_.isEmpty(profile.centers)) {
                basicProfile.push({
                    text: ' ',
                    fontSize: 5
                });

                for (let i = 0; i < profile.centers.length; i++) {
                    const center = profile.centers[i];
                    basicProfile.push({
                        text: center
                    });
                }
            }

            if (!_.isEmpty(profile.researchLines)) {
                basicProfile.push({
                    text: ' ',
                    fontSize: 5
                });

                for (let i = 0; i < profile.researchLines.length; i++) {
                    const researchLine = profile.researchLines[i];
                    basicProfile.push({
                        text: researchLine
                    });
                }
            }

            if (!_.isEmpty(profile.administrativeOrganization)) {
                basicProfile.push({
                    text: profile.administrativeOrganization
                });
            }

            if (!_.isEmpty(profile.office)) {
                basicProfile.push({
                    text: profile.office
                });
            }

            if (!_.isEmpty(profile.position)) {
                basicProfile.push({
                    text: profile.position
                });
            }

            if (!_.isEmpty(profile.role)) {
                basicProfile.push({
                    text: profile.role
                });
            }

            if (!_.isEmpty(profile.facility)) {
                basicProfile.push({
                    text: profile.facility
                });
            }

            if (!_.isEmpty(profile.titles)) {
                basicProfile.push({
                    text: ' ',
                    fontSize: 5
                });

                for (let i = 0; i < profile.titles.length; i++) {
                    const title = profile.titles[i];
                    basicProfile.push({
                        text: title,
                        style: 'lighten'
                    });
                }
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

                basicProfile.push({
                    text: ' ',
                    fontSize: 5
                });

                basicProfile.push({
                    columns: socials
                });
            }
        }

        if (options.basic) {
            content.push({
                columns: [{
                    width: '*',
                    stack: basicProfile,
                    margin: [0,0,20,0]
                }, {
                    image: 'assets/images/150.png',
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
    return new Promise(async (resolve) => {
        const doc = new Document();

        options = initializeOptions(options);

        const image = await new Promise(async (resolve) => {

            const readFile = util.promisify(fs.readFile);
            const image = path.resolve(sails.config.appPath, 'assets/images/150.png')

            await readFile(image).then(async (file) => {
                resolve(file);
            });
        });

        const profile = await ResearchEntityData.getProfile(researchEntityId);

        let tmpText = '';

        const profileImage = Media.addImage(doc, image, 150, 150, {
            floating: {
                horizontalPosition: {
                    relative: HorizontalPositionRelativeFrom.INSIDE_MARGIN,
                    align: HorizontalPositionAlign.RIGHT,
                },
                verticalPosition: {
                    relative: VerticalPositionRelativeFrom.INSIDE_MARGIN,
                    offset: 0
                },
                wrap: {
                    type: TextWrappingType.SQUARE,
                    side: TextWrappingSide.LEFT,
                },
                margins: {
                    left: 360,
                    bottom: 360
                }
            }
        });

        const baseProfile = [];
        if (!_.isEmpty(profile.jobTitle)) {
            baseProfile.push(
                new TextRun({
                    text: 'Job title: ',
                    bold: true
                }).break()
            );

            baseProfile.push(new TextRun(profile.jobTitle));
        }

        if (!_.isEmpty(profile.centers)) {
            for (let i = 0; i < profile.centers.length; i++) {
                const center = profile.centers[i];
                baseProfile.push(
                    new TextRun(center).break()
                );
            }
        }

        if (!_.isEmpty(profile.researchLines)) {
            for (let i = 0; i < profile.researchLines.length; i++) {
                const researchLine = profile.researchLines[i];
                baseProfile.push(
                    new TextRun(researchLine).break()
                );
            }
        }

        if (!_.isEmpty(profile.administrativeOrganization)) {
            baseProfile.push(
                new TextRun({
                    text: 'Administrative organization: ',
                    bold: true
                }).break()
            );

            baseProfile.push(new TextRun(profile.administrativeOrganization));
        }

        if (!_.isEmpty(profile.office)) {
            baseProfile.push(
                new TextRun({
                    text: 'Office: ',
                    bold: true
                }).break()
            );

            baseProfile.push(new TextRun(profile.office));
        }

        if (!_.isEmpty(profile.position)) {
            baseProfile.push(
                new TextRun({
                    text: 'Position: ',
                    bold: true
                }).break()
            );

            baseProfile.push(new TextRun(profile.position));
        }

        if (!_.isEmpty(profile.role)) {
            baseProfile.push(
                new TextRun({
                    text: 'Role: ',
                    bold: true
                }).break()
            );

            baseProfile.push(new TextRun(profile.role));
        }

        if (!_.isEmpty(profile.facilities)) {
            for (let i = 0; i < profile.facilities.length; i++) {
                const facility = profile.facilities[i];
                baseProfile.push(
                    new TextRun(facility).break()
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
            }).break())
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
            }).break())
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

                const paragraph = new Paragraph({
                    text: interest,
                    bullet: {
                        level: 0
                    }
                });

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

                    experience.from = formatDate(experience.from);

                    if (!_.has(experience, 'to') || _.isEmpty(experience.to)) {
                        experience.to = 'Present';
                    } else {
                        experience.to = formatDate(experience.to);
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

                    tmpText = concatStrings([experience.location, experience.country]);
                    if (!_.isEmpty(tmpText)) {
                        experiences.push(
                            new TextRun({
                                text: tmpText,
                                color: '999999'
                            }).break()
                        );
                    }

                    if (!_.isEmpty(experience.description)) {
                        experiences.push(
                            new TextRun(experience.description).break()
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

                educationItem.from = formatDate(educationItem.from);

                if (!_.has(educationItem, 'to') || _.isEmpty(educationItem.to)) {
                    educationItem.to = 'Present';
                } else {
                    educationItem.to = formatDate(educationItem.to);
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

                if (!_.isEmpty(certificate.text)) {
                    certificates.push(
                        new TextRun(certificate.text).break()
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
                                    text: category.value,
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
                                    text: category.value,
                                    bold: true
                                }).break()
                            ]
                        })
                    );
                }

                if (!_.isEmpty(category.skills)) {
                    for (let i = 0; i < category.skills.length; i++) {
                        const skill = category.skills[i];
                        const paragraph = new Paragraph({
                            text: skill.value,
                            bullet: {
                                level: 0
                            }
                        });

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
                            !_.isEmpty(document.title) ||
                            !_.isEmpty(document.source) ||
                            !_.isEmpty(document.doi)
                        )
                    ) {
                        const children = [];

                        if (!_.isEmpty(document.title)) {
                            children.push(
                                new TextRun({
                                    text: document.title,
                                    bold: true
                                })
                            );

                            children.push(
                                new TextRun({}).break()
                            );
                        }

                        if (!_.isEmpty(document.source)) {
                            children.push(
                                new TextRun({
                                    text: 'Document source: ' + document.source.title
                                })
                            );

                            children.push(
                                new TextRun({}).break()
                            );
                        }

                        if (!_.isEmpty(document.doi)) {
                            children.push(
                                new TextRun({
                                    text: 'Doi: ' + document.doi
                                })
                            );

                            children.push(
                                new TextRun({}).break()
                            );
                        }

                        const paragraph = new Paragraph({
                            children: children,
                            indent: {
                                left: 360,
                            }
                        });

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

                        const paragraph = new Paragraph({
                            children: children,
                            indent: {
                                left: 360,
                            }
                        });

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

            if (!_.isEmpty(baseProfile) && !_.isEmpty(profileImage)) {
                text.push(
                    new Paragraph({
                        children: _.concat(baseProfile, profileImage)
                    })
                );
            } else {
                if (!_.isEmpty(baseProfile)) {
                    text.push(
                        new Paragraph({
                            children: [
                                baseProfile
                            ]
                        })
                    );
                }

                if (!_.isEmpty(profileImage)) {
                    text.push(
                        new Paragraph({
                            children: [
                                profileImage
                            ]
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
                            }),
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
                        children: contacts
                    })
                );
            }
        }

        if (options.socials) {
            if (!_.isEmpty(socials)) {
                text.push(
                    new Paragraph({
                        children: socials
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
                    ]
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
                    children: experiences
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
                    children: education
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
                    children: certificates
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

        Packer.toBase64String(doc).then(b64string => {
            resolve(b64string);
        });
    });
};