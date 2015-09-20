/*
 * grunt-jasper
 * https://github.com/jasperjs/grunt-jasper
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

    typescript: {
      base: {
        src: ['test/testApp/app/**/*.ts'],
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
      tests: [
        'test/testApp/app/_routes.debug.js',
        'test/testApp/app/_areas.debug.js',
        'test/testApp/app/_values.debug.js',
        'test/testApp/app/_values.release.js',
        'test/testApp/app/_areas.release.js',
        'test/testApp/app/_routes.release.js',
        'test/testApp/dist/**/*.*'
      ]
    },

    // Configuration to be run (and then tested).
    jasper: {
      options: {
        singlePage: 'test/testApp/index.html',
        appPath: 'test/testApp/app',

        baseScripts: [
          'vendor/angularjs/angular.js',
          'vendor/angularjs/angular-route.js',
          'vendor/scriptjs/script.js',

          'vendor/jasper/jasper.js'
        ],

        startup: 'test/testApp/app/bootstrap.js',

        baseCss: {
          'bootstrap.min.css':[
            'test/testApp/bootstrap.css'
          ],
          'all.min.css': [
            'test/testApp/base.css'
          ]
        },
        fileVersion: true,
        defaultRoutePath: '/',
        jDebugEnabled: true,
        jDebugStylePath: 'path/to/jdebug.css'
      },

      debug: {
        options:{
          package: false,
          values: 'test/testApp/config/debug.json'
        }
      },

      release: {
        options: {
          package: true,
          packageOutput: 'test/testApp/dist'
        }
      }
    },

    // Unit tests.
    nodeunit: {
      build: ['test/build_tests/*_test.js'],
      package: ['test/package_tests/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test-build', ['clean', 'typescript', 'jasper:debug', 'nodeunit:build']);

  grunt.registerTask('test-package', ['clean', 'typescript', 'jasper:release', 'nodeunit:package']);

  grunt.registerTask('test', ['test-build', 'test-package']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jasper']);

};
