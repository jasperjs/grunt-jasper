'use strict';

module.exports = function (grunt) {

    var utils = require('./jasper-utils.js');
    
    grunt.registerTask('jasper-collect-defs', 'Find all component definitions for all areas', function () {
        var areas = grunt.config('areas');
            
        areas.forEach(function (area) {
            var allDefs = [];
            var defsConfigs = grunt.file.expand(area.__path + '/**/_definition.json');

            defsConfigs.forEach(function (defConfig) {
                var def = grunt.file.readJSON(defConfig);
                if (!def.name) {
                    var tagName = utils.getParentFolderName(defConfig);
                    def.name = utils.camelCaseTagName(tagName);
                }
                if (!def.type)
                    def.type = 'component';

                def.__path = utils.getPath(defConfig);
                if (def.templateFile) {
                    def.templateUrl = def.__path + '/' + def.templateFile;
                }
                allDefs.push(def);
            });
            area.__defs = allDefs;
        });
        grunt.config('areas', areas);
    });


};
