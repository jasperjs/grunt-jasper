'use strict';

module.exports = function (grunt) {

    var utils = require('./jasper-utils.js');

    grunt.registerTask('jasper-routes-config', 'Create .routes.js file with route configuration of application', function () {
        var pages = grunt.config('pages') || [];

        var jasperConfig = utils.getJasperConfig(grunt);
        var config = {
            defaultRoutePath: jasperConfig.defaultRoutePath,
            routes: {}
        };

        pages.forEach(function (page) {
            var routeConfig = {};
            routeConfig.templateUrl = utils.getPageTemplateUrl(page);
            if (page.redirectTo)
                routeConfig.redirectTo = page.redirectTo;

            if (page.area)
                routeConfig.area = page.area;

            if (page.reloadOnSearch)
                routeConfig.reloadOnSearch = true;

            if (page.prerender)
                routeConfig.prerender = true;
            config.routes[page.route] = routeConfig;
        });
        var moduleScript = 'angular.module("jasperRouteConfig",[ "jasper" ])\
                                .config(["jasperRouteProvider", function(jasperRouteTable){ jasperRouteTable.setup( ' + JSON.stringify(config) + ' ); }]);';

        var appPath = jasperConfig.appPath || 'app';

        var fileName = '.routes.js';
        var routesConfigPath = appPath + '/' + fileName;
        utils.writeContent(grunt, routesConfigPath, moduleScript);
        console.log('Routes configuration was built at: "' + routesConfigPath + '"');

        grunt.config('routes_config', routesConfigPath);
    });

};
