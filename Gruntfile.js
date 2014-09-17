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

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: ['src/**/*.js'],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        bower: {
            install: {
                options:{
                    cleanBowerDir: true
                }
                //just run 'grunt bower:install' and you'll see files from your Bower packages in lib directory
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
                }
            }
        },
        qunit: {
            files: ['test/**/*.html']
        },
        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
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
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint', 'qunit']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-bower-task');

    // A test task.  Uncomment to use if you have tests
    // grunt.registerTask('test', ['jshint', 'qunit']);

//    grunt.registerTask('default', ['bower:install']);
    grunt.registerTask('default', ['jshint', 'concat', 'uglify']);

};
