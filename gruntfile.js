module.exports = function (grunt) {

    "use strict";
    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        watch: {
            html: {
                files: ['index.html'],
                tasks: ['htmlhint']
            },
            js: {
                files: ['assets/js/base.js'],
                tasks: ['uglify']
            }
        },

        htmlhint: {
            build: {
                options: {
                    'tag-pair': true,
                    'tagname-lowercase': true,
                    'attr-lowercase': true,
                    'attr-value-double-quotes': true,
                    'doctype-first': true,
                    'spec-char-escape': true,
                    'id-unique': true,
                    'head-script-disabled': true,
                    'style-disabled': true
                },
                src: ['index.html']
            }
        },

        concat: {
            options: {
                separator: ';',
                stripBanners: true,
                nonull: true
            },
            basic_and_extras: {
                files: {
                    'assets/js/js-header.js': [
                        'assets/js/rb/vendor/modernizr',
                        'assets/js/rb/modernizr-tests'
                    ],
                    'assets/js/js-body-first.js': [
                        'assets/js/external/mootools-core-1.4.5-full-nocompat.js',
                        'assets/js/external/mootools-more-1.4.0.1.js',
                        'assets/js/lib/Namespace.js',
                        'assets/js/lib/Base.js'
                    ],
                    'assets/js/js-body-second.js': [
                        'assets/js/lib/Request.js',
                        'assets/js/lib/Form.js',
                        'assets/js/lib/Video.js',
                        'assets/js/lib/CookieManager.js',
                        'assets/js/lib/PortalSwitch.js'
                    ],
                    'assets/js/js-body-third.js': [
                        'assets/js/rb/vendor/jquery-2.1.0.js',
                        'assets/js/rb/vendor/fastclick.js',
                        'assets/js/rb/vendor/jquery.transit.js',
                        'assets/js/rb/vendor/jquery.hammer.js',
                        'assets/js/rb/plugins/jquery.offclick.js',
                        'assets/js/rb/vendor/magnific.js',
                        'assets/js/rb/rb-widgets/rb.utils.js',
                        'assets/js/rb/rb-widgets/rb.breakpoint.js',
                        'assets/js/rb/rb-widgets/rb.template.js',
                        'assets/js/rb/rb-widgets/rb.widget.js'
                    ]
                }
                // extras: {
                //src: ['src/main.js', 'src/extras.js'],
                //dest: 'dist/with_extras.js'
                // }
            }
        },

        uglify: {
            build: {
                files: {
                    'build/js/js-header.min.js': ['assets/js/js-header.js'],
                    'build/js/js-body-first.min.js': ['assets/js/js-body-first.js'],
                    'build/js/js-body-second.min.js': ['assets/js/js-body-second.js'],
                    'build/js/js-body-third.min.js': ['assets/js/js-body-third.js']
                }
            }
        }
    });

    grunt.registerTask('default', []);

};
