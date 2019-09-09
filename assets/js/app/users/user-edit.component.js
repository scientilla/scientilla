(function () {
    'use strict';

    angular.module('users')
        .component('userEdit', {
            templateUrl: 'partials/user-edit.html',
            controller: controller,
            controllerAs: 'vm',
            bindings: {}
        });

    controller.$inject = [
    ];

    function controller() {
        const vm = this;

        vm.administrativePositions = [
            'Administrative/Support',
            'Director General',
            'Scientific Director',
            'Technician'
        ];

        vm.scientificPositions = [
            'Affiliated Researcher',
            'PhD Student',
            'PI',
            'Post Doc',
            'Researcher',
            'Technologist',
            'Visiting Scientist'
        ];

        vm.centers = [
            'CSFT@PoliTo Torino',
            'CNST@PoliMi Milano',
            'CGS@SEMM Milano',
            'IIT Central Research Labs Genova',
            'CNCS@UniTn Trento',
            'CLNS@SAPIENZA Roma',
            'CNI@NEST Pisa',
            'CMBR@SSSA Pisa',
            'CABHC@CRIB Napoli',
            'CBN@UniLe Lecce',
            'LCSL@MIT USA',
            'IIT@HARVARD USA',
            'CTNSC@UniFe Ferrara',
            'NSYN@Unige Genova',
            'CCHT@Ca\'Foscari Venezia'
        ];

        vm.researchLines = [
            '2D Materials Engineering',
            'Advanced Materials for Optoelectronics',
            'Advanced Materials for Sustainable Future Technologies',
            'Advanced Robotics',
            'Artificial Touch in Soft Biorobotics',
            'Asymmetric Catalysis and Photochemistry',
            'Atomistic Simulations',
            'Bio-Logic Materials',
            'Bioinspired Soft Robotics',
            'Brain Development and Disease',
            'Cognition, Motion and Neuroscience',
            'COgNiTive Architecture for Collaborative Technologies',
            'Computational and Chemical Biology',
            'Computational mOdelling of NanosCalE and bioPhysical sysTems',
            'Computational Nanoplasmonics',
            'Computational Statistics and Machine Learning',
            'Cultural Heritage Technologies',
            'D3 PharmaChemistry',
            'D3 Validation',
            'Dynamic Interaction Control',
            'Dynamic Legged Systems',
            'Electron Crystallography',
            'Enhanced Regenerative Medicine',
            'Event-Driven Perception for Robotics',
            'Functional Neuroimaging',
            'Genetics and Epigenetics of Behavior',
            'Genetics of Cognition',
            'Genomic Science',
            'Graphene Labs',
            'Human-Robot Interfaces and Physical Interaction',
            'Humanoid Sensing and Perception',
            'Humanoids &amp; Human Centered Mechatronics',
            'iCub',
            'IIT@Harvard',
            'IIT@MIT',
            'Mesoscale Simulations',
            'Microtechnology for Neuroelectronics',
            'Molecular Medicine',
            'Molecular Microscopy and Spectroscopy',
            'Molecular Modeling and Drug Discovery',
            'MRI - Magnetic Resonance Imaging',
            'Multifunctional Neural Interfaces with deep-brain regions',
            'Multiscale Brain Communication',
            'Nanobiointeractions &amp; Nanodiagnostics',
            'NanoChemistry',
            'Nanomaterials for Biomedical Applications',
            'Nanomaterials for Energy and Lifescience',
            'Nanoscopy &amp; NIC@IIT',
            'Nanotechnologies for Humans and Biosystems',
            'Nanotechnologies for Neurosciences',
            'Nanotechnology for Precision Medicine',
            'Neural Coding',
            'Neural Computation',
            'Neurobiology of miRNA',
            'Neurodevelopmental Disorders',
            'Neuromodulation of Cortical and Subcortical Circuits',
            'Neuroscience and Behaviour',
            'Neuroscience and Smart Materials',
            'Non coding RNAs in Physiology and Pathology',
            'Non-coding RNAs and RNA-based therapeutics',
            'Optical Approaches to Brain Function',
            'Optoelectronics',
            'Pattern Analysis and Computer Vision',
            'Plasmon Nanotechnologies',
            'Polymers and Biomaterials',
            'Printed and Molecular Electronics',
            'Quantum Materials Theory',
            'Rehab Technologies - INAIL-IIT lab',
            'Robotics Brain and Cognitive Sciences',
            'Smart Bio-Interfaces',
            'Smart Materials',
            'Social cognition in human-robot interaction',
            'Soft Robotics for Human Cooperation and Rehabilitation',
            'Synaptic Plasticity of Inhibitory Networks',
            'Synthetic and Systems Biology for Biomedicine',
            'Systems and Synthetic Biology',
            'Systems Neurobiology',
            'Theory and Technology of 2D Materials',
            'Tissue Electronics',
            'Unit for Visually Impaired People',
            'Visual and Multimodal Applied Learning',
            'Visual Geometry and Modelling'
        ];

        vm.facilities = [
            'Mechanical Workshop',
            'Electronic Design Laboratory',
            'Electron Microscopy',
            'Materials Characterization',
            'Animal Facility',
            'Clean Room',
            'Neurofacility',
            'Analytical Chemistry and in vivo Pharmacology'
        ];

        vm.administrativeOrganizations = [
            'Administrative Directorate',
            'Communication and External Relations Directorate',
            'Director General',
            'Health &amp; Safety Office',
            'Human Resources and Organization Directorate',
            'Information and Communication Technology Directorate',
            'Internal Control and Risk Management Directorate',
            'Legal Affairs Directorate',
            'Management Control Directorate',
            'Procurement Directorate',
            'Research Organization Directorate',
            'Scientific Director’s Office',
            'Technical Services and Facilities Directorate',
            'Technology Transfer Directorate'
        ];

        vm.offices = [
            'Projects Office',
            'Outreach and Digital Production Office',
            'Tenure Track Office',
            'Data Analysis Office'
        ];

        vm.titles = [];
        vm.experiences = [];
        vm.education = [];
        vm.certificates = [];
        vm.skillCategories = [];

        vm.datePickerOptions = {};
        vm.dateExperienceFromPopups = [];
        vm.dateExperienceToPopups = [];
        vm.dateEducationFromPopups = [];
        vm.dateEducationToPopups = [];
        vm.dateCertificateDatePopups = [];

        vm.$onInit = function () {
            vm.type = 'type-scientific';
        };

        vm.addTitle = () => {
            vm.titles.push({});
        };

        vm.removeTitle = (title) => {
            const index = vm.titles.indexOf(title);
            vm.titles.splice(index, 1);
        };

        vm.addExperience = () => {
            vm.experiences.push({from: '', to: ''});
        };

        vm.removeExperience = (experience) => {
            const index = vm.experiences.indexOf(experience);
            vm.experiences.splice(index, 1);
        };

        vm.addEducation = () => {
            vm.education.push({});
        };

        vm.removeEducation = (education) => {
            const index = vm.education.indexOf(education);
            vm.education.splice(index, 1);
        };

        vm.addCertificate = () => {
            vm.certificates.push({});
        };

        vm.removeCertificate = (certificate) => {
            const index = vm.certificates.indexOf(certificate);
            vm.certificates.splice(index, 1);
        };

        vm.addSkillCategory = () => {
            vm.skillCategories.push({skills: []});
        };

        vm.removeSkillCategory = (category) => {
            const index = vm.skillCategories.indexOf(category);
            vm.skillCategories.splice(index, 1);
        };

        vm.addSkill = (category) => {
            const index = vm.skillCategories.indexOf(category);
            vm.skillCategories[index].skills.push({});
        };

        vm.removeSkill = (category, skill) => {
            const categoryIndex = vm.skillCategories.indexOf(category);
            const skillIndex = vm.skillCategories[categoryIndex].indexOf(skill);
            vm.skillCategories[categoryIndex].splice(skillIndex, 1);
        };

        vm.uncheckAllBasicInformation = (evt) => {
            if (!evt.target.checked) {
                document.getElementById('username-public').checked = false;
                document.getElementById('name-public').checked = false;
                document.getElementById('surname-public').checked = false;
                document.getElementById('display-name-public').checked = false;
                document.getElementById('display-surname-public').checked = false;
                document.getElementById('phone-public').checked = false;
                document.getElementById('type-public').checked = false;
                document.getElementById('center-public').checked = false;
                document.getElementById('research-line-public').checked = false;
                document.getElementById('position-public').checked = false;
                document.getElementById('facility-public').checked = false;
                document.getElementById('titles-public').checked = false;

                for (let i = 0; i < vm.titles.length; i++) {
                    document.getElementById('titles[' + i + ']-public').checked = false;
                }
            }
        };

        vm.uncheckAllSocials = (evt) => {
            if (!evt.target.checked) {
                document.getElementById('linkedin-public').checked = false;
                document.getElementById('twitter-public').checked = false;
                document.getElementById('github-public').checked = false;
                document.getElementById('facebook-public').checked = false;
                document.getElementById('instagram-public').checked = false;
            }
        };

        vm.uncheckAllExperiences = (evt) => {
            if (!evt.target.checked) {
                for (let i = 0; i < vm.experiences.length; i++) {
                    document.getElementById('experiences[' + i + ']-public').checked = false;
                }
            }
        };

        vm.uncheckAllEducation = (evt) => {
            if (!evt.target.checked) {
                for (let i = 0; i < vm.education.length; i++) {
                    document.getElementById('education[' + i + ']-public').checked = false;
                }
            }
        };

        vm.uncheckAllCertificates = (evt) => {
            if (!evt.target.checked) {
                for (let i = 0; i < vm.certificates.length; i++) {
                    document.getElementById('certificate[' + i + ']-public').checked = false;
                }
            }
        };

        vm.uncheckAllSkills = (evt) => {
            if (!evt.target.checked) {
                for (let i = 0; i < vm.skillCategories.length; i++) {
                    document.getElementById('skill-category[' + i + ']-public').checked = false;

                    for (let j= 0; j < vm.skillCategories[i].skills.length; j++) {
                        document.getElementById('skill[' + i + '][' + j + ']-public').checked = false;
                    }
                }
            }
        };
    }

})();