'use strict';

module.exports = function (grunt) {

    var utils = require('./jasper-utils.js');

    grunt.registerTask('jasper-areas-config', 'Create .areas.js config file for all areas', function () {
        var appPath = utils.getJasperConfig(grunt).appPath || 'app';
        var areas = grunt.config('areas');

        var isPackage = grunt.config('package');

        var fileName = isPackage ? '.areas_release.js' : '.areas.js';
        var areasConfigPath = appPath + '/' + fileName;

        var getConfigScript = function (areasConfig) {
            return 'angular.module("jasperAreasConfig",["jasperAreas"]).value("$jasperAreasConfig",' + JSON.stringify(areasConfig) + ")\
                                   .run(['jasperAreasService', '$jasperAreasConfig', function(jasperAreasService, $jasperAreasConfig) { jasperAreasService.configure($jasperAreasConfig); }]);";

        }

        var config = {};

        var findAreaByName = function (areaName) {
            for (var i = 0; i < areas.length; i++) {
                if (areas[i].name === areaName)
                    return areas[i];
            }
            return undefined;
        }

        areas.forEach(function (area) {
            var areaConfig = {};

            areaConfig.scripts = [];

            area.__scripts = utils.getAreaScripts(grunt, area.__path, area.__initPath);

            areaConfig.dependencies = area.dependencies;

            if (isPackage) {
                if (area.bootstrap) {
                    return; // next area
                }
                areaConfig.scripts = ['scripts/' + area.name + '.min.js'];
                for (var i = area.dependencies.length - 1; i >= 0; i--) {
                    var depArea = findAreaByName(area.dependencies[i]);
                    if (depArea && depArea.bootstrap) {
                        area.dependencies.splice(i, 1);
                    }
                }
            } else {
                areaConfig.scripts = area.__scripts;
            }
            config[area.name] = areaConfig;

        });

        var configScript = getConfigScript(config);

        utils.writeContent(grunt, areasConfigPath, configScript);
        console.log('Areas configuration was built at: "' + areasConfigPath + '"');

        grunt.config('areas', areas);
        grunt.config('areas_config', areasConfigPath);
    });

};
