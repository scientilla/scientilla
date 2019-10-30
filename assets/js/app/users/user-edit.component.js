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
        'UsersService',
        'AuthService'
    ];

    function controller(UsersService, AuthService) {
        const vm = this;

        vm.positions = {};

        vm.positions.administrative = [
            'None',
            'Administrative/Support',
            'Director General',
            'Scientific Director',
            'Technician'
        ];

        vm.positions.scientific = [
            'None',
            'Affiliated Researcher',
            'PhD Student',
            'PI',
            'Post Doc',
            'Researcher',
            'Technologist',
            'Visiting Scientist'
        ];

        vm.centers = [
            'None',
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
            'None',
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
            'None',
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
            'None',
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
            'None',
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

        const defaultProfile = {
            basic: {
                username: {
                    public: false
                },
                name: {
                    public: false
                },
                surname: {
                    public: false
                },
                useDisplayNames: false,
                displayName: {
                    public: false
                },
                displaySurname: {
                    public: false
                },
                phone: {
                    public: false
                },
                positionType: {
                    value: 'scientific',
                    public: false
                },
                center: {
                    public: false
                },
                researchLine: {
                    public: false
                },
                administrativeOrganization: {
                    public: false
                },
                office: {
                    public: false
                },
                position: {
                    public: false
                },
                facility: {
                    public: false
                },
                titles: [],
            },
            socials: {
                linkedin: {
                    public: false
                },
                twitter: {
                    public: false
                },
                github: {
                    public: false
                },
                facebook: {
                    public: false
                },
                instagram: {
                    public: false
                }
            },
            about: {
                public: false
            },
            experiences: [],
            education: [],
            certificates: [],
            skills: {
                categories: []
            },
            publications: {
                public: false
            },
            accomplishments: {
                public: false
            },
        };

        function getProfile() {
            UsersService.getProfile(AuthService.user.id).then(response => {
                vm.profile = _.merge(defaultProfile, response.profile);

                vm.reloadPositions();
            });
        }

        /* jshint ignore:start */
        vm.$onInit = async function () {
            vm.type = 'type-scientific';

            getProfile();
        };
        /* jshint ignore:end */

        vm.addItem = (options = {}) => {
            if (!options.item) {
                options.item = {
                    public: false
                };
            }

            if (options.property) {
                options.property.push(options.item);
            }

            console.log(vm.profile);
        };

        vm.removeItem = (options = {}) => {
            if (typeof(options.property) !== 'undefined' && typeof(options.index) !== 'undefined') {
                options.property.splice(options.index, 1);
            }
        };

        /*vm.changePrivacy = (type, makePublic) => {
            Object.keys(defaultProfile[type]).forEach((key, index) => {
                console.log(Object.keys(defaultProfile[type][key]).length);
                //vm.profile[type][key].public = makePublic;
            });
        };

        vm.uncheckAll = (evt, type) => {
            if (!evt.target.checked) {
                console.log(defaultProfile);
                Object.keys(defaultProfile[type]).forEach(function(key, index) {
                    console.log(key);
                    //console.log(Object.keys(vm.profile[type]).length);
                    //vm.profile[type][key].public = false;
                });


                //const checkboxes = document.querySelectorAll('[data-checkbox="' + type + '"]');
                //for (let i = 0; i < checkboxes.length; i++) {
                //    checkboxes[i].checked = false;
                //}
            }
        };*/

        vm.save = () => {
            console.log(vm.profile);
            const profile = JSON.stringify(vm.profile);
            const result = UsersService.saveProfile(AuthService.user.id, profile);
        };

        vm.reloadPositions = () => {
            if (vm.profile.basic.positionType.value === 'scientific') {
                if (!vm.profile.basic.center.value) {
                    vm.profile.basic.center.value = vm.centers[0];
                }

                if (!vm.profile.basic.researchLine.value) {
                    vm.profile.basic.researchLine.value = vm.researchLines[0];
                }
            } else {
                if (!vm.profile.basic.administrativeOrganization.value) {
                    vm.profile.basic.administrativeOrganization.value = vm.administrativeOrganizations[0];
                }

                if (!vm.profile.basic.office.value) {
                    vm.profile.basic.office.value = vm.offices[0];
                }
            }

            if (!vm.profile.basic.position.value) {
                vm.profile.basic.position.value = vm.positions[vm.profile.basic.positionType.value][0];
            }

            if (!vm.profile.basic.facility.value) {
                vm.profile.basic.facility.value = vm.facilities[0];
            }
        };
    }

})();