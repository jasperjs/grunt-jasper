/*
 * jasper-build
 * https://github.com/jasperjs/jasper-build
 *
 * Copyright (c) 2015 bukharin
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    grunt.registerTask('jasper', 'Build jasper application', function (release) {
        grunt.config('package', false);

        grunt.config.requires('jasper');

        grunt.task.run([
            // find all areas in project
            'jasper-collect-areas',
            // find all areas difinitions in project
            'jasper-collect-defs',
            // create areas .init.js files
            'jasper-areas-initfile',
            // create .areas.js config file for all areas
            'jasper-areas-config',
            // create .routes.js config file
            'jasper-routes-config',
            // modify single page of application
            'jasper-patch-page']);
    });

    grunt.registerTask('jasper-package', 'Build and package jasper application', function (release) {
        grunt.config('package', true);

        grunt.task.run([
            // find all areas in project
            'jasper-collect-areas',
            // find all areas difinitions in project
            'jasper-collect-defs',
            // find all *.html templates (release build)
            'jasper-collect-templates',
            // create areas .init.js files
            'jasper-areas-initfile',
            // create .areas.js config file for all areas
            'jasper-areas-config',
            // create .routes.js config file
            'jasper-routes-config',
            // concat and uglify all areas and bootstrap files
            'jasper-combine',
            // modify single page of application
            'jasper-patch-page']);
    });

};
