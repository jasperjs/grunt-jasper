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
      testapp: {
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
      },
      lib: {
        options: {
          module: 'commonjs', //or commonjs
          target: 'es5', //or es3
          sourceMap: false,
          declaration: false,
          references: [
            'typed/**/*.d.ts'
          ],
          generateTsConfig: true
        },
        src: ['lib/**/*.ts', 'test/unit/**/*.ts', 'test/build/**/*.ts', 'test/package/**/*.ts']
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: [
        'test/testApp/app/_values.js',
        'test/testApp/app/_areas.js',
        'test/testApp/app/_routes.js',
        'test/testApp/dist/**/*.*',
        'test/testApp/**/_init.js'
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

        },
        fileVersion: true,
        defaultRoutePath: '/',
        jDebugEnabled: true,
        jDebugStylePath: 'path/to/jdebug.css'
      },

      debug: {
        options: {
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
      build: ['test/build/*.tests.js'],
      package: ['test/package/*.tests.js'],
      unit: ['test/unit/*.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test-build', ['clean', 'typescript', 'nodeunit:build']);

  grunt.registerTask('test-package', ['clean', 'typescript', 'nodeunit:package']);

  grunt.registerTask('test', ['test-build', 'test-package']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jasper']);

  // Build lib and run unit tests
  grunt.registerTask('unit', ['typescript:lib', 'nodeunit:unit']);

};
