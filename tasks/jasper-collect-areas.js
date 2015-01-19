'use strict';

module.exports = function (grunt) {

    var utils = require('./jasper-utils.js');

    grunt.registerTask('jasper-collect-areas', 'Task search all areas in project', function () {
        var areas = [];
        var jasperConfig = utils.getJasperConfig(grunt);
        // determine the root app folder
        var appPath = jasperConfig.appPath || 'app';
        // find all _area.json config files in app folder
        var areaConfigPaths = grunt.file.expand(appPath + '/**/_area.json');

        areaConfigPaths.forEach(function (areaConfigPath) {
            var area = grunt.file.readJSON(areaConfigPath);
            if (!area.dependencies)
                area.dependencies = [];
            if (!area.name) {
                area.name = utils.getParentFolderName(areaConfigPath);
            }
            area.__path = utils.getPath(areaConfigPath);

            areas.push(area);
        });
        grunt.config('areas', areas);
    });

};
