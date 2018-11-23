/**
 * Autoinsert script tags (or other filebased tags) in an html file.
 *
 * ---------------------------------------------------------------
 *
 * Automatically inject <script> tags for javascript files and <link> tags
 * for css files.  Also automatically links an output file containing precompiled
 * templates using a <script> tag.
 *
 * For usage docs see:
 * 		https://github.com/Zolmeister/grunt-sails-linker
 *
 */
module.exports = function(grunt) {

	grunt.config.set('sails-linker', {
		devJs: {
			options: {
				startTag: '<!--SCRIPTS-->',
				endTag: '<!--SCRIPTS END-->',
				fileTmpl: '<script src="%s"></script>',
				appRoot: '.tmp/public'
			},
			files: {
				'.tmp/public/**/*.html': require('../pipeline').jsFilesToInject,
				'views/**/*.html': require('../pipeline').jsFilesToInject,
				'views/**/*.ejs': require('../pipeline').jsFilesToInject
			}
		},

		devJsRelative: {
			options: {
				startTag: '<!--SCRIPTS-->',
				endTag: '<!--SCRIPTS END-->',
				fileTmpl: '<script src="%s"></script>',
				appRoot: '.tmp/public',
				relative: true
			},
			files: {
				'.tmp/public/**/*.html': require('../pipeline').jsFilesToInject,
				'views/**/*.html': require('../pipeline').jsFilesToInject,
				'views/**/*.ejs': require('../pipeline').jsFilesToInject
			}
		},

		prodJs: {
			options: {
				startTag: '<!--SCRIPTS-->',
				endTag: '<!--SCRIPTS END-->',
				fileTmpl: '<script src="%s"></script>',
				appRoot: '.tmp/public'
			},
			files: {
				'.tmp/public/**/*.html': ['.tmp/public/min/production.min.js'],
				'views/**/*.html': ['.tmp/public/min/production.min.js'],
				'views/**/*.ejs': ['.tmp/public/min/production.min.js']
			}
		},

		prodJsRelative: {
			options: {
				startTag: '<!--SCRIPTS-->',
				endTag: '<!--SCRIPTS END-->',
				fileTmpl: '<script src="%s"></script>',
				appRoot: '.tmp/public',
				relative: true
			},
			files: {
				'.tmp/public/**/*.html': ['.tmp/public/min/production.min.js'],
				'views/**/*.html': ['.tmp/public/min/production.min.js'],
				'views/**/*.ejs': ['.tmp/public/min/production.min.js']
			}
		},

		devStyles: {
			options: {
				startTag: '<!--STYLES-->',
				endTag: '<!--STYLES END-->',
				fileTmpl: '<link rel="stylesheet" media="screen" href="%s">',
				appRoot: '.tmp/public'
			},

			files: {
				'.tmp/public/**/*.html': require('../pipeline').cssFilesToInject,
				'views/**/*.html': require('../pipeline').cssFilesToInject,
				'views/**/*.ejs': require('../pipeline').cssFilesToInject
			}
		},

        devPrint: {
            options: {
                startTag: '<!--PRINT-->',
                endTag: '<!--PRINT END-->',
                fileTmpl: '<link rel="stylesheet" media="print" href="%s">',
                appRoot: '.tmp/public'
            },

            files: {
                '.tmp/public/**/*.html': require('../pipeline').printCssFilesToInject,
                'views/**/*.html': require('../pipeline').printCssFilesToInject,
                'views/**/*.ejs': require('../pipeline').printCssFilesToInject
            }
        },

		devStylesRelative: {
			options: {
				startTag: '<!--STYLES-->',
				endTag: '<!--STYLES END-->',
				fileTmpl: '<link rel="stylesheet" media="screen" href="%s">',
				appRoot: '.tmp/public',
				relative: true
			},

			files: {
				'.tmp/public/**/*.html': require('../pipeline').cssFilesToInject,
				'views/**/*.html': require('../pipeline').cssFilesToInject,
				'views/**/*.ejs': require('../pipeline').cssFilesToInject
			}
		},

        devPrintRelative: {
            options: {
                startTag: '<!--PRINT-->',
                endTag: '<!--PRINT END-->',
                fileTmpl: '<link rel="stylesheet" media="print" href="%s">',
                appRoot: '.tmp/public',
                relative: true
            },

            files: {
                '.tmp/public/**/*.html': require('../pipeline').printCssFilesToInject,
                'views/**/*.html': require('../pipeline').printCssFilesToInject,
                'views/**/*.ejs': require('../pipeline').printCssFilesToInject
            }
        },

		prodStyles: {
			options: {
				startTag: '<!--STYLES-->',
				endTag: '<!--STYLES END-->',
				fileTmpl: '<link rel="stylesheet" media="screen" href="%s">',
				appRoot: '.tmp/public'
			},
			files: {
				'.tmp/public/index.html': ['.tmp/public/min/production.min.css'],
				'views/**/*.html': ['.tmp/public/min/production.min.css'],
				'views/**/*.ejs': ['.tmp/public/min/production.min.css']
			}
		},

        prodPrint: {
            options: {
                startTag: '<!--PRINT-->',
                endTag: '<!--PRINT END-->',
                fileTmpl: '<link rel="stylesheet" media="print" href="%s">',
                appRoot: '.tmp/public'
            },
            files: {
                '.tmp/public/index.html': ['.tmp/public/min/print.min.css'],
                'views/**/*.html': ['.tmp/public/min/print.min.css'],
                'views/**/*.ejs': ['.tmp/public/min/print.min.css']
            }
        },

		prodStylesRelative: {
			options: {
				startTag: '<!--STYLES-->',
				endTag: '<!--STYLES END-->',
				fileTmpl: '<link rel="stylesheet" media="screen" href="%s">',
				appRoot: '.tmp/public',
				relative: true
			},
			files: {
				'.tmp/public/index.html': ['.tmp/public/min/production.min.css'],
				'views/**/*.html': ['.tmp/public/min/production.min.css'],
				'views/**/*.ejs': ['.tmp/public/min/production.min.css']
			}
		},

        prodPrintRelative: {
            options: {
                startTag: '<!--PRINT-->',
                endTag: '<!--PRINT END-->',
                fileTmpl: '<link rel="stylesheet" media="print" href="%s">',
                appRoot: '.tmp/public',
                relative: true
            },
            files: {
                '.tmp/public/index.html': ['.tmp/public/min/print.min.css'],
                'views/**/*.html': ['.tmp/public/min/print.min.css'],
                'views/**/*.ejs': ['.tmp/public/min/print.min.css']
            }
        }
	});

	grunt.loadNpmTasks('grunt-sails-linker');
};
