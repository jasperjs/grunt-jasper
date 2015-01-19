'use strict';

module.exports = function (grunt) {
    grunt.registerTask('jasper-build-release', 'Build jasper application', function (release) {
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
