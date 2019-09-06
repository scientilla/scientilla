// Profile.js - in api/services

"use strict";

const docx = require("docx");
const { Document, Paragraph, Packer, TextRun, HeadingLevel, Media, HorizontalPositionRelativeFrom, HorizontalPositionAlign, VerticalPositionRelativeFrom, VerticalPositionAlign, TextWrappingSide, TextWrappingType} = docx;
const fs = require('fs');
const path = require('path');
const util = require('util');
const PdfPrinter = require('pdfmake');
const {Base64Encode} = require('base64-stream');

const profile = {
    firstName: 'Firstname',
    lastName: 'Lastname',
    position: {
        type: 'administrative',
        center: '',
        researchLine: '',
        administrativeOrganization: 'Research Organization Directorate',
        office: 'Data Analysis Office',
        title: '',
        role: 'Research Support Administrative Senior',
        facility: ''
    },
    email: 'example@domain.com',
    phone: ' +39 123 456 789',
    titles: [
        'Title',
        'Title'
    ],
    socials: {
        linkedin: 'http://linkedin.com',
        twitter: 'http://twittter.com',
        github: 'http://github.com',
        facebook: 'http://facebook.com',
        instagram: 'http://instagram.com'
    },
    about: {
        title: 'About',
        description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.'
    },
    experiences: {
        title: 'Experiences',
        items: [
            {
                company: 'Company',
                jobTitle: 'Job title',
                from: 'From',
                to: 'To',
                location: 'Location',
                country: 'Country',
                description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries'
            }, {
                company: 'Company',
                jobTitle: 'Job title',
                from: 'From',
                to: 'To',
                location: 'Location',
                country: 'Country',
                description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries'
            }, {
                company: 'Company',
                jobTitle: 'Job title',
                from: 'From',
                to: 'To',
                location: 'Location',
                country: 'Country',
                description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries'
            }, {
                company: 'Company',
                jobTitle: 'Job title',
                from: 'From',
                to: 'To',
                location: 'Location',
                country: 'Country',
                description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries'
            }
        ]
    },
    education: {
        title: 'Education',
        items: [
            {
                institute: 'University/Institute',
                title: 'Title',
                from: 'From',
                to: 'To',
                location: 'Location',
                country: 'Country'
            }, {
                    institute: 'University/Institute',
                    title: 'Title',
                    from: 'From',
                    to: 'To',
                    location: 'Location',
                    country: 'Country'
                }
            ]
        },
    certificates: {
        title: 'Certificates',
        items:[
            {
                title: 'Title of certificate',
                text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries',
                date: '14/09/2019'
            }, {
                title: 'Title of certificate',
                text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries',
                date: '14/09/2019'
            }, {
                title: 'Title of certificate',
                text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries',
                date: '14/09/2019'
            }
        ]
    },
    skills: {
        title: 'Skills',
        categories: [
            {
                title: 'Industry knowledge',
                items: [
                    'E-commerce',
                    'Integration',
                    'Strategy',
                    'Marketing',
                    'Big Data',
                    'Virtualization',
                    'Mobile devices'
                ]
            }, {
                title: 'Tools & technologies',
                items: [
                    'Python',
                    'C#',
                    'C++',
                    'HTML',
                    'JavaScript',
                    'CSS'
                ]
            }, {
                title: 'Interpersonal Skills',
                items: [
                    'Strategic partnerships',
                    'Business alliances',
                    'Cross-functional team leadership',
                    'Leadership',
                    'Team building',
                    'Executive management'
                ]
            }, {
                title: 'Languages',
                items: [
                    'English',
                    'French',
                    'Italian',
                    'Dutch',
                    'German'
                ]
            }
        ]
    },
    publications: {
        title: 'Publications',
        categories: [
            {
                title: 'Journals',
                items: [
                    {
                        title: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
                        source: 'Investigative Ophthalmology and Visual Science',
                        bibliographicInfo: 'vol. 60, issue 2, pp. 741-747 (2019)',
                        doi: {
                            number: '10.1093',
                            link: '#'
                        }
                    }, {
                        title: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
                        source: 'Investigative Ophthalmology and Visual Science',
                        bibliographicInfo: 'vol. 60, issue 2, pp. 741-747 (2019)',
                        doi: {
                            number: '10.1093',
                            link: '#'
                        }
                    }, {
                        title: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
                        source: 'Investigative Ophthalmology and Visual Science',
                        bibliographicInfo: 'vol. 60, issue 2, pp. 741-747 (2019)',
                        doi: {
                            number: '10.1093',
                            link: '#'
                        }
                    }
                ]
            }, {
                title: 'Books',
                items: [
                    {
                        title: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
                        source: 'PhD Thesis',
                        bibliographicInfo: 'vol. 60, issue 2, pp. 741-747 (2019)',
                        doi: {
                            number: '10.1093',
                            link: '#'
                        }
                    }, {
                        title: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
                        source: 'PhD Thesis',
                        bibliographicInfo: 'vol. 60, issue 2, pp. 741-747 (2019)',
                        doi: {
                            number: '10.1093',
                            link: '#'
                        }
                    }
                ]
            }, {
                title: 'Conferences',
                items: [
                    {
                        title: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
                        source: 'International winterschool in bioelectronics',
                        bibliographicInfo: 'vol. 60, issue 2, pp. 741-747 (2019)',
                        doi: {
                            number: '10.1093',
                            link: '#'
                        }
                    }, {
                        title: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
                        source: 'International winterschool in bioelectronics',
                        bibliographicInfo: 'vol. 60, issue 2, pp. 741-747 (2019)',
                        doi: {
                            number: '10.1093',
                            link: '#'
                        }
                    }, {
                        title: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
                        source: 'International winterschool in bioelectronics',
                        bibliographicInfo: 'vol. 60, issue 2, pp. 741-747 (2019)',
                        doi: {
                            number: '10.1093',
                            link: '#'
                        }
                    }, {
                        title: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
                        source: 'International winterschool in bioelectronics',
                        bibliographicInfo: 'vol. 60, issue 2, pp. 741-747 (2019)',
                        doi: {
                            number: '10.1093',
                            link: '#'
                        }
                    }, {
                        title: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
                        source: 'International winterschool in bioelectronics',
                        bibliographicInfo: 'vol. 60, issue 2, pp. 741-747 (2019)',
                        doi: {
                            number: '10.1093',
                            link: '#'
                        }
                    }
                ]
            }
        ]
    },
    accomplishments: {
        title: 'Accomplishments',
        categories: [
            {
                title: 'Award / Achievement',
                items: [
                    {
                        title: 'Lorem Ipsum is simply dummy text',
                        issuer: 'Lorem ipsum',
                        year: '2019'
                    }, {
                        title: 'Lorem Ipsum is simply dummy text',
                        issuer: 'Lorem ipsum',
                        year: '2019'
                    }
                ]
            }, {
                title: 'Organized Event',
                items: [
                    {
                        title: 'Lorem Ipsum is simply dummy text',
                        issuer: 'Lorem ipsum',
                        year: '2019'
                    }, {
                        title: 'Lorem Ipsum is simply dummy text',
                        issuer: 'Lorem ipsum',
                        year: '2019'
                    }, {
                        title: 'Lorem Ipsum is simply dummy text',
                        issuer: 'Lorem ipsum',
                        year: '2019'
                    }
                ]
            }, {
                title: 'Editorship',
                items: [
                    {
                        title: 'Lorem Ipsum is simply dummy text',
                        issuer: 'Lorem ipsum',
                        year: '2019'
                    }, {
                        title: 'Lorem Ipsum is simply dummy text',
                        issuer: 'Lorem ipsum',
                        year: '2019'
                    }
                ]
            }
        ]
    }
};

module.exports = {
    toPDF,
    toDoc
};

async function toPDF() {

    function getExperienceText(experience) {
        const stack = [];

        if (!_.isEmpty(experience) && !_.isEmpty(experience.company)) {
            stack.push({
                text: experience.company,
                style: 'bold'
            });
        }

        if (!_.isEmpty(experience) && !_.isEmpty(experience.jobTitle)) {
            stack.push({
                text: experience.jobTitle,
            });
        }

        if (!_.isEmpty(experience)) {
            const dates = [];

            if (!_.isEmpty(experience.from)) {
                dates.push(experience.from);
            }

            if (!_.isEmpty(experience.to)) {
                dates.push(experience.to);
            }

            if (!_.isEmpty(dates)) {
                stack.push({
                    text: dates.join(' - '),
                    style: 'lighten'
                });
            }
        }

        if (!_.isEmpty(experience)) {
            const locationData = [];

            if (!_.isEmpty(experience.location)) {
                locationData.push(experience.location);
            }

            if (!_.isEmpty(experience.country)) {
                locationData.push(experience.country);
            }

            if (!_.isEmpty(locationData)) {
                stack.push({
                    text: locationData.join(', '),
                    style: 'lighten'
                });
            }
        }

        if (!_.isEmpty(experience) && !_.isEmpty(experience.description)) {
            stack.push({
                text: experience.description
            });
        }

        return stack;
    }

    function getEducationText(educationItem) {
        const stack = [];

        if (!_.isEmpty(educationItem) && !_.isEmpty(educationItem.institute)) {
            stack.push(educationItem.institute);
        }

        if (!_.isEmpty(educationItem) && !_.isEmpty(educationItem.title)) {
            stack.push({
                text: educationItem.title,
                style: 'bold'
            });
        }

        if (!_.isEmpty(educationItem)) {
            const dates = [];

            if (!_.isEmpty(educationItem.from)) {
                dates.push(educationItem.from);
            }

            if (!_.isEmpty(educationItem.to)) {
                dates.push(educationItem.to);
            }

            if (!_.isEmpty(dates)) {
                stack.push({
                    text: dates.join(' - '),
                    style: 'lighten'
                });
            }
        }

        if (!_.isEmpty(educationItem)) {
            const locationData = [];

            if (!_.isEmpty(educationItem.location)) {
                locationData.push(educationItem.location);
            }

            if (!_.isEmpty(educationItem.country)) {
                locationData.push(educationItem.country);
            }

            if (!_.isEmpty(locationData)) {
                stack.push({
                    text: locationData.join(', '),
                    style: 'lighten'
                });
            }
        }

        return stack;
    }

    function getCertificateText(certificate) {
        const stack = [];

        if (!_.isEmpty(certificate) && !_.isEmpty(certificate.title)) {
            stack.push({
                text: certificate.title,
                style: 'bold'
            });
        }

        if (!_.isEmpty(certificate) && !_.isEmpty(certificate.text)) {
            stack.push({
                text: certificate.text
            });
        }

        if (!_.isEmpty(certificate) && !_.isEmpty(certificate.date)) {
            stack.push({
                text: certificate.date,
                style: 'lighten'
            });
        }

        return stack;
    }

    function getSkillCategoryText(category) {
        const stack = [];

        if (!_.isEmpty(category) && !_.isEmpty(category.title)) {
            stack.push({
                text: category.title,
                style: 'bold'
            });
        }

        if (!_.isEmpty(category) && !_.isEmpty(category.items)) {
            stack.push({
                ul: category.items
            });
        }

        return stack;
    }

    function getPublicationCategoryText(category) {
        const text = [];

        if (!_.isEmpty(category.title)) {
            text.push({
                text: category.title,
                style: 'h3'
            });
        }

        for (let j = 0; j < category.items.length; j++) {
            const publication = category.items[j];
            const stack = [];

            if (!_.isEmpty(publication)) {
                if (j > 0) {
                    text.push({
                        text: ' '
                    });
                }

                if (!_.isEmpty(publication.title)) {
                    stack.push({
                        text: publication.title,
                        style: 'bold'
                    });
                }

                if (!_.isEmpty(publication.source)) {
                    stack.push({
                        text: 'Document source: ' + publication.source,
                    });
                }

                if (!_.isEmpty(publication.bibliographicInfo)) {
                    stack.push({
                        text: 'Bibliographic info: ' + publication.bibliographicInfo
                    });
                }

                if (!_.isEmpty(publication.doi.number)) {
                    stack.push({
                        text: 'Doi: ' + publication.doi.number,
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

    function getAccomplishmentCategoryText(category) {
        const text = [];

        if (!_.isEmpty(category.title)) {
            text.push({
                text: category.title,
                style: 'h3'
            });
        }

        for (let j = 0; j < category.items.length; j++) {
            const accomplishment = category.items[j];
            const stack = [];

            if (!_.isEmpty(accomplishment)) {
                if (j > 0) {
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
        basicProfile.push(
            {
                text: profile.firstName + ' ' + profile.lastName,
                style: 'h1'
            }
        );

        switch(profile.position.type) {
            case 'administrative':
                basicProfile.push({
                    text: sails.config.scientilla.institute.name + ' - ' + profile.position.role
                });
                basicProfile.push({
                    text: profile.position.administrativeOrganization + ' - ' + profile.position.office
                });
                break;
            case 'scientific':
                basicProfile.push({
                    text: sails.config.scientilla.institute.name + ' - ' + profile.position.title
                });
                basicProfile.push({
                    text: profile.position.researchLine
                });
                if (!_.isEmpty(profile.position.center)) {
                    basicProfile.push({
                        text: profile.position.center
                    });
                }
                break;
            default:
                break;
        }

        if (!_.isEmpty(profile.position.facility)) {
            basicProfile.push({
                text: profile.position.facility
            });
        }

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

        basicProfile.push({
            text: ' ',
            fontSize: 5
        });

        // Contacts
        let contacts = [];
        if (!_.isEmpty(profile.email)) {
            contacts.push({
                text: [
                    {
                        text: '',
                        style: 'fontAwesome'
                    },
                    ' ' + profile.email
                ]
            });
        }

        if (!_.isEmpty(profile.phone)) {
            contacts.push({
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

        if (!_.isEmpty(profile.socials && profile.socials.linkedin)) {
            contacts.push({
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
            contacts.push({
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

        if (!_.isEmpty(profile.socials && profile.socials.github)) {
            contacts.push({
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

        if (!_.isEmpty(profile.socials && profile.socials.facebook)) {
            contacts.push({
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
            contacts.push({
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

        contacts = _.chunk(contacts, _.round(contacts.length / 2));

        basicProfile.push({
            columns: contacts
        });

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

        content.push({
            text: ' ',
            fontSize: 20
        });

        // About
        if (!_.isEmpty(profile.about) && !_.isEmpty(profile.about.title) && !_.isEmpty(profile.about.description)) {
            content.push({
                unbreakable: true,
                stack: [
                    {
                        text: profile.about.title,
                        style: 'h2'
                    }, {
                        text: profile.about.description
                    }
                ]
            });

            content.push({
                text: ' ',
                fontSize: 20
            });
        }

        // Experiences
        if (!_.isEmpty(profile.experiences) && !_.isEmpty(profile.experiences.items)) {
            const experiences = profile.experiences.items;
            const firstExperience = experiences.shift();

            content.push({
                unbreakable: true,
                stack: [
                    {
                        text: profile.experiences.title,
                        style: 'h2'
                    }
                ].concat(getExperienceText(firstExperience))
            });

            for (let i = 0; i < experiences.length; i++) {
                const experience = experiences[i];

                content.push({
                    text: ' '
                });

                content.push({
                    unbreakable: true,
                    stack: getExperienceText(experience)
                });
            }

            content.push({
                text: ' ',
                fontSize: 20
            });
        }

        // Education
        if (!_.isEmpty(profile.education) && !_.isEmpty(profile.education.items)) {
            const educationItems = profile.education.items;
            const firstEducationItem = educationItems.shift();

            content.push({
                unbreakable: true,
                stack: [
                    {
                        text: profile.education.title,
                        style: 'h2'
                    }
                ].concat(getEducationText(firstEducationItem))
            });

            for (let i = 0; i < educationItems.length; i++) {
                const educationItem = educationItems[i];

                content.push({
                    text: ' ',
                });

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
        if (!_.isEmpty(profile.certificates) && !_.isEmpty(profile.certificates.items)) {
            const certificates = profile.certificates.items;
            const firstCertificate = certificates.shift();

            content.push({
                unbreakable: true,
                stack: [
                    {
                        text: profile.certificates.title,
                        style: 'h2'
                    }
                ].concat(getCertificateText(firstCertificate))
            });

            for (let i = 0; i < certificates.length; i++) {
                const certificate = certificates[i];

                content.push({
                    text: ' '
                });

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
        if (!_.isEmpty(profile.skills) && !_.isEmpty(profile.skills.categories)) {
            const skillCategories = profile.skills.categories;
            const firstSkillCategory = skillCategories.shift();

            content.push({
                unbreakable: true,
                stack: [
                    {
                        text: profile.skills.title,
                        style: 'h2'
                    }
                ].concat(getSkillCategoryText(firstSkillCategory))
            });

            for (let i = 0; i < skillCategories.length; i++) {
                const category = skillCategories[i];

                content.push({
                    text: ' '
                });

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

        // Publications
        if (!_.isEmpty(profile.publications) && !_.isEmpty(profile.publications.categories)) {
            const publicationCategories = profile.publications.categories;
            const firstPublicationCategory = publicationCategories.shift();

            content.push({
                unbreakable: true,
                stack: [
                    {
                        text: profile.publications.title,
                        style: 'h2'
                    }
                ].concat(getPublicationCategoryText(firstPublicationCategory))
            });

            for (let i = 0; i < publicationCategories.length; i++) {
                const category = publicationCategories[i];

                content.push({
                    text: ' '
                });

                content.push({
                    unbreakable: true,
                    stack: getPublicationCategoryText(category)
                });
            }

            content.push({
                text: ' ',
                fontSize: 20
            });
        }

        // Accomplishments
        if (!_.isEmpty(profile.accomplishments) && !_.isEmpty(profile.accomplishments.categories)) {
            const accomplishmentsCategories = profile.accomplishments.categories;
            const firstAccomplishmentCategory = accomplishmentsCategories.shift();

            content.push({
                unbreakable: true,
                stack: [
                    {
                        text: profile.accomplishments.title,
                        style: 'h2'
                    }
                ].concat(getAccomplishmentCategoryText(firstAccomplishmentCategory))
            });

            for (let i = 0; i < accomplishmentsCategories.length; i++) {
                const category = accomplishmentsCategories[i];

                content.push({
                    text: ' '
                });

                content.push({
                    unbreakable: true,
                    stack: getAccomplishmentCategoryText(category)
                });
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
                                image: 'assets/images/IIT-v4-logo-t2.png',
                                width: 50,
                                alignment: 'left',
                                margin: [38, 10, 40, 10]
                            }, {
                                text: 'Page ' + currentPage.toString() + ' of ' + pageCount,
                                alignment: 'right',
                                margin: [40, 10]
                            }
                        ]
                    }
                ]
            }
        };

        const options = {
            // ...
        }

        const pdfDoc = printer.createPdfKitDocument(docDefinition, options);
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

async function toDoc() {
    return new Promise(async (resolve) => {
        const doc = new Document();

        const image = await new Promise(async (resolve) => {

            const readFile = util.promisify(fs.readFile);
            const image = path.resolve(sails.config.appPath, 'assets/images/150.png')

            await readFile(image).then(async(file) => {
                resolve(file);
            });
        });

        const titles = [];
        for (let i = 0; i < profile.titles.length; i++) {
            const title = profile.titles[i];
            titles.push(
                new TextRun({
                    text: title,
                    color: '999999'
                }).break()
            );
        }

        const experiences = [];
        for (let i = 0; i < profile.experiences.items.length; i++) {
            const experience = profile.experiences.items[i];
            experiences.push(
                new TextRun({
                    text: experience.company,
                    bold: true
                })
            );
            experiences.push(
                new TextRun(experience.jobTitle).break()
            );
            experiences.push(
                new TextRun({
                    text: experience.from + ' - ' + experience.to,
                    color: '999999'
                }).break()
            );
            experiences.push(
                new TextRun({
                    text: experience.location + ', ' + experience.country,
                    color: '999999'
                }).break()
            );
            experiences.push(
                new TextRun(experience.description).break()
            );

            if (i < profile.experiences.items.length - 1) {
                experiences.push(
                    new TextRun('').break()
                );

                experiences.push(
                    new TextRun('').break()
                );
            }
        }

        const education = [];
        for (let i = 0; i < profile.education.items.length; i++) {
            const educationItem = profile.education.items[i];
            education.push(
                new TextRun(educationItem.institute)
            );
            education.push(
                new TextRun({
                    text: educationItem.title,
                    bold: true
                }).break()
            );
            education.push(
                new TextRun({
                    text: educationItem.from + ' - ' + educationItem.to,
                    color: '999999'
                }).break()
            );
            education.push(
                new TextRun({
                    text: educationItem.location + ', ' + educationItem.country,
                    color: '999999'
                }).break()
            );
            if (i < profile.education.items.length - 1) {
                education.push(
                    new TextRun('').break()
                );
                education.push(
                    new TextRun('').break()
                );
            }
        }

        const certificates = [];
        for (let i = 0; i < profile.certificates.items.length; i++) {
            const certificate = profile.certificates.items[i];
            certificates.push(
                new TextRun({
                    text: certificate.title,
                    bold: true
                })
            );
            certificates.push(
                new TextRun(certificate.text).break()
            );
            certificates.push(
                new TextRun({
                    text: certificate.date,
                    color: '999999'
                }).break()
            );
            if (i < profile.certificates.items.length - 1) {
                certificates.push(
                    new TextRun('').break()
                );
                certificates.push(
                    new TextRun('').break()
                );
            }
        }

        const skills = [];
        for (let i = 0; i < profile.skills.categories.length; i++) {
            const category = profile.skills.categories[i];

            if (i === 0) {
                skills.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: category.title,
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
                                text: category.title,
                                bold: true
                            }).break()
                        ]
                    })
                );
            }

            for (let j = 0; j < category.items.length; j++) {
                const skill = category.items[j];

                const paragraph = new Paragraph({
                    text: skill,
                    bullet: {
                        level: 0
                    }
                });

                skills.push(paragraph);
            }
        }

        const publications = [];
        for (let i = 0; i < profile.publications.categories.length; i++) {
            const category = profile.publications.categories[i];

            publications.push(
                new Paragraph({
                    text: category.title,
                    heading: HeadingLevel.HEADING_3
                })
            );

            for (let j = 0; j < category.items.length; j++) {
                const publication = category.items[j];

                const paragraph = new Paragraph({
                    children: [
                        new TextRun({
                            text: publication.title,
                            bold: true
                        }).break(),
                        new TextRun({
                            text: 'Document source: ' + publication.source
                        }).break(),
                        new TextRun({
                            text: 'Bibliographic info: ' + publication.bibliographicInfo
                        }).break(),
                        new TextRun({
                            text: 'Doi: ' + publication.doi.number
                        }).break(),
                    ]
                });

                publications.push(paragraph);
            }
        }

        const accomplishments = [];
        for (let i = 0; i < profile.accomplishments.categories.length; i++) {
            const category = profile.accomplishments.categories[i];

            accomplishments.push(
                new Paragraph({
                    text: category.title,
                    heading: HeadingLevel.HEADING_3
                })
            );

            for (let j = 0; j < category.items.length; j++) {
                const accomplishment = category.items[j];

                const paragraph = new Paragraph({
                    children: [
                        new TextRun({
                            text: accomplishment.title,
                            bold: true
                        }).break(),
                        new TextRun({
                            text: 'Issuer: ' + accomplishment.issuer
                        }).break(),
                        new TextRun({
                            text: 'Year: ' + accomplishment.year
                        }).break()
                    ]
                });

                accomplishments.push(paragraph);
            }
        }

        let text = [];
        text.push(
            new Paragraph({
                children: [
                    Media.addImage(doc, image, 150, 150, {
                        floating: {
                            horizontalPosition: {
                                relative: HorizontalPositionRelativeFrom.INSIDE_MARGIN,
                                align: HorizontalPositionAlign.RIGHT,
                            },
                            verticalPosition: {
                                relative: VerticalPositionRelativeFrom.INSIDE_MARGIN,
                                align: VerticalPositionAlign.TOP,
                            },
                            wrap: {
                                type: TextWrappingType.SQUARE,
                                side: TextWrappingSide.BOTH_SIDES,
                            }
                        }
                    })
                ]
            })
        );
        text.push(
            new Paragraph({
                text: profile.firstName + ' ' + profile.lastName,
                heading: HeadingLevel.HEADING_1
            })
        );
        const baseProfile = [];
        switch(profile.position.type) {
            case 'administrative':
                baseProfile.push(
                    new TextRun(sails.config.scientilla.institute.name + ' - ' + profile.position.role)
                );
                baseProfile.push(
                    new TextRun(profile.position.administrativeOrganization + ' - ' + profile.position.office).break()
                );
                break;
            case 'scientific':
                baseProfile.push(
                    new TextRun(sails.config.scientilla.institute.name + ' - ' + profile.position.title)
                );
                baseProfile.push(
                    new TextRun(profile.position.researchLine).break()
                );
                if (!_.isEmpty(profile.position.center)) {
                    baseProfile.push(
                        new TextRun(profile.position.center).break()
                    );
                }
                break;
            default:
                break;
        }
        if (!_.isEmpty(profile.position.facility)) {
            baseProfile.push(
                new TextRun(profile.position.facility).break()
            );
        }
        text.push(
            new Paragraph({
                children: _.concat(baseProfile, titles)
            })
        );
        text.push(
            new Paragraph({
                text: profile.about.title,
                heading: HeadingLevel.HEADING_2
            })
        );
        text.push(
            new Paragraph({
                children: [
                    new TextRun(profile.about.description)
                ]
            })
        );
        text.push(
            new Paragraph({
                text: profile.experiences.title,
                heading: HeadingLevel.HEADING_2
            })
        );
        text.push(
            new Paragraph({
                children: experiences
            })
        );
        text.push(
            new Paragraph({
                text: profile.education.title,
                heading: HeadingLevel.HEADING_2
            })
        );
        text.push(
            new Paragraph({
                children: education
            })
        );
        text.push(
            new Paragraph({
                text: profile.certificates.title,
                heading: HeadingLevel.HEADING_2
            })
        );
        text.push(
            new Paragraph({
                children: certificates
            })
        );
        text.push(
            new Paragraph({
                text: profile.skills.title,
                heading: HeadingLevel.HEADING_2
            })
        );
        text = _.concat(text, skills);
        text.push(
            new Paragraph({
                text: profile.publications.title,
                heading: HeadingLevel.HEADING_2
            })
        );
        text = _.concat(text, publications);
        text.push(
            new Paragraph({
                text: profile.accomplishments.title,
                heading: HeadingLevel.HEADING_2
            })
        );
        text = _.concat(text, accomplishments);

        doc.addSection({
            properties: {},
            children: text
        });

        Packer.toBase64String(doc).then(b64string => {
            resolve(b64string);
        });
    });
};