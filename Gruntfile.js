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

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // Project configuration.
  grunt.initConfig({

    typescript: {
      lib: {
        options: {
          module: 'commonjs', //or commonjs
          target: 'es5', //or es3
          sourceMap: false,
          declaration: false,
          references: [
            'typed/**/*.d.ts',
            'node_modules/jasper-build/jasper-build.d.ts'
          ],
          generateTsConfig: true
        },
        src: ['tasks/**/*.ts']
      }
    },

    jasper: {
      options: grunt.file.readJSON('jasper.json'),
      debug: {
        options: {
          package: false
        }
      }
    }

  });


  grunt.registerTask('default', ['typescript:lib', 'jasper']);

};
