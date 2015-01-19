/*
 * jasper-build
 * https://github.com/jasperjs/jasper-build
 *
 * Copyright (c) 2015 bukharin
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
    // load all npm grunt tasks
    require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({
        //jshint: {
        //  all: [
        //    'Gruntfile.js',
        //    'tasks/*.js',
        //    '<%= nodeunit.tests %>'
        //  ],
        //  options: {
        //    jshintrc: '.jshintrc',
        //    reporter: require('jshint-stylish')
        //  }
        //},

        typescript: {
            base: {
                src: ['test/app/**/*.ts'],
                options: {
                    module: 'amd', //or commonjs
                    target: 'es5', //or es3
                    sourceMap: false,
                    declaration: false,
                    references: [
                        'typed/*.d.ts'
                    ]
                }
            }
        },

        // Before generating any new files, remove any previously-created files.
        clean: {
            tests: ['test/app/.routes.js', 'test/app/.areas.js']
        },

        // Configuration to be run (and then tested).
        jasper_build: {
            singlePage: 'test/index.html',
            appModule: 'spa',
            appPath: 'test/app',

            packageOutput: 'test/dist',

            defaultRoutePath: '/',

            bootstrapScripts: [
                'vendor/angularjs/angular.js',
                'vendor/angularjs/angular-route.js',
                'vendor/scriptjs/script.js',

                'vendor/jasper/jasper.js',

                '%areas_config%',

                'app/.routes.js',
                'app/bootstrap.js'
            ]
        },

        // Unit tests.
        nodeunit: {
            tests: ['test/*_test.js']
        }

    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    grunt.registerTask('test', ['clean', 'typescript', 'jasper_build', 'nodeunit']);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['jasper_build']);

};
