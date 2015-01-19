'use strict';

module.exports = function (grunt) {

    var utils = require('./jasper-utils.js');
    
    grunt.registerTask('jasper-collect-templates', 'Find all templates for all areas', function () {
        var areas = grunt.config('areas');

        areas.forEach(function (area) {
            var templateFiles = [];
            area.__defs.forEach(function (def) {
                if (def.templateUrl) {
                    templateFiles.push(def.templateUrl);
                }
            });

            var allTemplates = [];

            templateFiles.forEach(function (templateUrl) {
                var htmlContent = grunt.file.read(templateUrl);

                var component = {
                    type: 'template',
                    url: templateUrl,
                    content: utils.minifyHtml(htmlContent, {
                        removeComments: true,
                        preserveLineBreaks: true
                    })
                }
                allTemplates.push(component);
            });
            area.__defs = area.__defs.concat(allTemplates);
        });
        grunt.config('areas', areas);
    });


};
