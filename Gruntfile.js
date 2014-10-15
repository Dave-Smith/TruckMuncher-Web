/*
 This Gruntfile was generated by IBM DevOps Services.

 Grunt dependencies are required in the package.json
 file in order to build. Add the following devDependencies entries
 to your package.json file:

 "devDependencies": {
 "grunt": "~0.4.x",
 "grunt-contrib-jshint": "~0.7.2",
 "grunt-contrib-uglify": "^0.4.0",
 "grunt-contrib-concat": "^0.4.0",
 "grunt-contrib-qunit": "^0.5.0",
 "grunt-contrib-watch": "^0.6.1"
 }

 */
module.exports = function (grunt) {

    var globalConfig = {
        smartAdmin: 'SmartAdmin',

        cssDest: 'public/stylesheets'
    };

    grunt.initConfig({
        globalConfig: globalConfig,
        pkg: grunt.file.readJSON('package.json'),

        'concat': {
            options: {
                separator: ';'
            },
            dist: {
                src: ['src/**/*.js'],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },

        'bower': {
            install: {
                options: {
                    cleanBowerDir: true
                }
                //just run 'grunt bower:install' and you'll see files from your Bower packages in lib directory
            }
        },

        'uglify': {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
                }
            }
        },

        'qunit': {
            files: ['test/**/*.html']
        },


        'jshint': {
            files: ['Gruntfile.js', 'public/**/*.js', 'test/**/*.js'],
            options: {
                // options here to override JSHint defaults
                globals: {
                    jQuery: true,
                    console: true,
                    module: true,
                    document: true
                }
            }
        },

        'less': {
            development: {
                options: {
                    banner: '<%= banner %>'
                },
                files: {
                    "<%= globalConfig.smartAdmin %>/UNMINIFIED_CSS/bootstrap.css": "<%= globalConfig.smartAdmin %>/LESS_FILES/bootstrap.less",
                    "<%= globalConfig.smartAdmin %>/UNMINIFIED_CSS/smartadmin-production.css": "<%= globalConfig.smartAdmin %>/LESS_FILES/smartadmin-production.less",
                    "<%= globalConfig.smartAdmin %>/UNMINIFIED_CSS/smartadmin-skins.css": "<%= globalConfig.smartAdmin %>/LESS_FILES/smartadmin-skin/smartadmin-skins.less"
                }
            }
        },

        // MINIFY CSS
        'cssmin': {
            minify: {
                expand: true,
                src: ['*.css', '!*.min.css'],
                dest: '<%= globalConfig.cssDest %>',
                cwd: '<%= globalConfig.smartAdmin %>/UNMINIFIED_CSS/',
                extDot: 'last',
                ext: '.min.css'
            }
        },

        'watch': {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint', 'qunit'],
            less: {
                files: ['<%= globalConfig.smartAdmin %>/LESS_FILES/custom.less', '<%= globalConfig.smartAdmin %>/LESS_FILES/overrides.less'],
                tasks: ['less', 'cssmin']
            }
        },

        'karma': {
            //shared config
            options: {
                logLevel: 'INFO',
                colors: true,
                port: 9876,
                files: [
                    'lib/angular/angular.js',
                    'lib/jquery/jquery.js',
                    'lib/angular-chosen-localytics/chosen.js',
                    'lib/angular-bootstrap/ui-bootstrap-tpls.js',
                    'lib/chosen/*.js',
                    'lib/angular-ui-router/angular-ui-router.js',
                    'lib/angular-mocks/angular-mocks.js',
                    'lib/base-64/base64.js',
                    'public/js/app/app.js',
                    'public/js/app/**/*.js',
                    'test/jasmine/**/*.js'
                ],
                frameworks: ['jasmine'],
                browsers: ['PhantomJS'],
                basePath: ''
            },
            //run this one in dev
            unit: {
                autowatch: true,
                reporters: ['dots', 'growl']
            },
            //run on CI
            continuous: {
                singleRun: true,
                reporters: ['junit']
            }

        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-karma');

    // A test task.  Uncomment to use if you have tests
    // grunt.registerTask('test', ['jshint', 'qunit']);

//    grunt.registerTask('default', ['bower:install']);
    grunt.registerTask('default', ['jshint', 'concat', 'uglify']);

};
