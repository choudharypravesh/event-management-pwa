/**
 * Created by parth on 18/1/17.
 */
module.exports = function (grunt) {

    var appPath = "public/"
    var outputPath = "dist/"
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks('grunt-develop');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-mkdir');


    grunt.initConfig({
        clean: ["./dist"],
        mkdir: {
            dist: {
                options: {
                    create: ['./dist']
                }
            }
        },
        exec: {
            makeDist: {
                cmd: 'rm -rf dist && mkdir dist && mkdir -p dist/stylesheets'
            },
            bower: {
                cmd: 'bower install'
            }
        },
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: appPath + 'images',
                    src: ['**/*.{png,jpg,gif,ico,svg,GIF}'],
                    dest: 'dist/images'
                }]
            }
        },
        cssmin: {
            options: {
                keepSpecialComments: 0
            },
            combine: {
                files: [{
                    './dist/stylesheets/main.css': [appPath + "stylesheets/0_599.css",
                        appPath + "stylesheets/components.css",
                        appPath + "stylesheets/inline.css",
                        appPath + "stylesheets/min_900.css",
                        appPath + "stylesheets/style.css"]
                }, {
                    './dist/stylesheets/vendors.css': [
                        appPath + "stylesheets/vendors/angular-material.css",
                        appPath + "bower_components/angular-carousel/dist/angular-carousel.css",
                        appPath + "bower_components/angular-md-pull-to-refresh/angular-md-pull-to-refresh.css",
                        appPath + "bower_components/ng-img-crop/compile/minified/ng-img-crop.css",
                        appPath + "vendors/font-awesome-4.5.0/css/font-awesome.css",
                        appPath + "stylesheets/vendors/jTinder.css"]
                }]

            },
            target: {
                files: [{
                    expand: false,
                    src: [outputPath + 'stylesheets/vendors.css', outputPath + 'stylesheets/main.css'],
                    dest: "./dist/stylesheets/common.min.css",
                    ext: '.min.css'
                }]
            }

        },
        concat: {
            options: {
                separator: ';',
            },
            basic: {
                src: [appPath + 'scripts/app.js',
                    appPath + 'scripts/controllers/*.js',
                    appPath + 'scripts/directives/*.js',
                    appPath + 'scripts/filters/*.js',
                    appPath + 'scripts/services/*.js'],
                dest: 'dist/scripts/main.js'
            },
            extras: {
                src: [
                    appPath + 'bower_components/jquery/dist/jquery.min.js',
                    appPath + 'scripts/vendors/angular.js',
                    appPath + 'scripts/vendors/angular-animate.min.js',
                    appPath + 'scripts/vendors/angular-aria.min.js',
                    appPath + 'scripts/vendors/angular-material.js',
                    appPath + 'scripts/vendors/angular-messages.min.js',
                    appPath + 'bower_components/angular-ui-router/release/angular-ui-router.min.js',
                    appPath + 'bower_components/angular-md-pull-to-refresh/angular-md-pull-to-refresh.js',
                    appPath + 'bower_components/ng-img-crop/compile/minified/ng-img-crop.js',
                    appPath + 'bower_components/hammerjs/hammer.min.js',
                    appPath + 'bower_components/ng-dialog/js/ngDialog.min.js',
                    //appPath + 'bower_components/angular-touch/angular-touch.min.js',
                    appPath + 'bower_components/angular-carousel/dist/angular-carousel.min.js',
                    appPath + 'scripts/vendors/jquery.transform2d.js',
                    appPath + 'scripts/vendors/jquery.jTinder.js',
                    appPath + 'scripts/vendors/angular-swing.js',
		                appPath + 'bower_components/jquery-touchswipe/jquery.touchSwipe.min.js'
                ],
                dest: 'dist/scripts/vendors.js'
            },
        },
        uglify: {
            options: {
                mangle: false
            },
            my_target: {
                files: {
                    'dist/scripts/vendors.min.js': ['dist/scripts/vendors.js'],
                    'dist/scripts/main.min.js': ['dist/scripts/main.js']
                }
            }
        },
        copy: {
            dist: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: appPath + "vendors",
                        dest: 'dist/vendors',
                        src: [
                            './**'
                        ]
                    },
                    {
                        expand: true,
                        dot: true,
                        cwd: appPath + "vendors/font-awesome-4.5.0/fonts/",
                        dest: 'dist/fonts',
                        src: [
                            './**'
                        ]
                    },
                    {
                        expand: true,
                        dot: true,
                        cwd: appPath + "jsons",
                        dest: 'dist/jsons',
                        src: [
                            './**'
                        ]
                    },
                    {
                        expand: true,
                        dot: true,
                        cwd: appPath + "vendors",
                        dest: 'dist/vendors',
                        src: [
                            './**'
                        ]
                    },
                    {
                        expand: false,
                        cwd: appPath + "/scripts/vendors/sw-toolbox.js",
                        dest: 'dist/scripts/vendors/sw-toolbox.js',
                        src: [
                            './dist/scripts/vendors/sw-toolbox.js'
                        ]
                    },
                    {
                        expand: false,
                        cwd: appPath + "/scripts/toolbox-script.js",
                        dest: 'dist/scripts/toolbox-script.js',
                        src: [
                            './dist/scripts/toolbox-script.js'
                        ]
                    },
                    {
                        expand: true,
                        dot: true,
                        cwd: appPath + "views",
                        dest: outputPath + 'views',
                        src: [
                            './**'
                        ]
                    },
                    {
                        dest: 'dist/views/index.ejs',
                        src: [
                            './dist/views/live.ejs'
                        ]
                    },
                    {
                        dest: 'dist/robots.txt',
                        src: [
                            './robots.txt'
                        ]
                    }
                ]
            }
        }

    });

    /**
     * Install and run tests
     */
    grunt.registerTask('default', [
        'install',
        'dist'
    ]);

    /**
     * Run end to end tests for static compilation
     */
    grunt.registerTask('dist', [
        'clean',
        'mkdir:dist',
        'cssmin',
        'concat',
        'uglify',
        'copy:dist',
        'imagemin'
    ]);

    grunt.registerTask('images', [
        'clean',
        'mkdir:dist',
        'copy:dist',
        'imagemin'
    ]);


    /**
     * Run nodemon dev to execute website.js development mode and auto-reload node app on file changes
     */
    grunt.registerTask('watch', [
        'nodemon:dev'
    ]);

    /**
     * Run end to end tests
     */
    grunt.registerTask('e2e', [
        'develop:distServer'
    ]);

    /**
     * Prepare the environment for usage, this gets called after npm install
     */
    grunt.registerTask('install', [
        'exec:bower'
    ]);

};
