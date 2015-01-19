'use strict';

module.exports = function (grunt) {

    var utils = require('./jasper-utils.js');

    grunt.registerTask('jasper-areas-initfile', 'Build area definitions into one executable file', function () {
        var areas = grunt.config('areas');
        var pages = grunt.config('pages') || [];

        var getDefScript = function (def, areaName) {
            var method = '';
            var content = '';
            switch (def.type.toUpperCase()) {
                case 'COMPONENT':
                    method = 'component';
                    break;
                case 'DECORATOR':
                    method = 'decorator';
                    break;
                case 'SERVICE':
                    method = 'service';
                    break;
                case 'FILTER':
                    method = 'filter';
                    break;
                case 'DIRECTIVE':
                    method = 'directive';
                    break;
                case 'TEMPLATE':
                    // *html template
                    return '\tjsp.template(\'' + def.url + '\',\'' + def.content + '\');\n';
                case 'PAGE':
                    method = 'component';
                    if (!def.route) {
                        grunt.util.error('route for page not specified ' + def);
                    }

                    var newPage = {
                        route: def.route,
                        area: areaName,
                        name: def.name || getParentFolderName(def.__path),
                        reloadOnSearch: !!def.reloadOnSearch,
                        redirectTo: def.redirectTo,
                        prerender: !!def.prerender
                    }
                    var pageTemplateUrl = utils.getPageTemplateUrl(newPage);
                    var tagName = utils.shakeCase(newPage.name);
                    var pageTemplate = '<' + tagName + '></' + tagName + '>';
                    content += '\tjsp.template("' + pageTemplateUrl + '","' + pageTemplate + '");\n';
                    pages.push(newPage);

                    break;
                default:
                    grunt.util.error('Unknown definition type "' + def + '" in "' + JSON.stringify(def) + '"');
                    break;
            }

            delete def.type;
            delete def.__path;
            delete def.templateFile;

            return content + '\tjsp.' + method + '(' + JSON.stringify(def) + ');\n';
        };

        areas.forEach(function (area) {
            var areaScript = 'jsp.areas.initArea(\'' + area.name + '\').then(function() { \n\n';
            area.__defs.forEach(function (def) {
                areaScript += getDefScript(def, area.name);
            });
            areaScript += '\n});';
            var initFilePath = area.__path + '/.init.js';
            area.__initPath = initFilePath;

            utils.writeContent(grunt, initFilePath, areaScript);

            console.log('Area init file was built at: "' + initFilePath + '"');
        });

        grunt.config('areas', areas);
        grunt.config('pages', pages);
    });



};
