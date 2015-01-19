'use strict';

var grunt = require('grunt');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

var getConfig = function () {
    return grunt.config('jasper_build');
}

var processSystemPaths = function (path) {
    if (path === '%areas_config%') {
        var config = getConfig();
        return config.appPath + '/.areas.js';
    }
    return path;
}

exports.jasper_build = {
    setUp: function (done) {
        // setup here if necessary

        this.config = getConfig();

        done();
    },

    testIndexPageScripts: function (test) {
        var scripts = this.config.bootstrapScripts;
        var indexPageContent = grunt.file.read('test/index.html');

        scripts.forEach(function (path) {
            var scriptReferenceText = '<script src="' + processSystemPaths(path) + '"></script>';
            test.ok(indexPageContent.indexOf(scriptReferenceText) >= 0, 'Page content must contain ' + path + ' reference');
        });

        test.done();
    },

    testIndexPageStyles: function (test) {
        var indexPageContent = grunt.file.read('test/index.html');
        var styles = grunt.file.expand('test/app/**/*.css');

        styles.forEach(function (path) {
            var styleReferenceText = '<link rel="stylesheet" href="' + path + '"/>';
            test.ok(indexPageContent.indexOf(styleReferenceText) >= 0, 'Page content must contain ' + path + ' style reference');
        });

        test.done();
    },

    testAreasConfig: function (test) {
        var areaConfigPath = 'test/app/.areas.js';

        test.ok(grunt.file.exists(areaConfigPath));

        var areasContent = grunt.file.read(areaConfigPath);
        var findConfigRegex = /value\("\$jasperAreasConfig",(.+)\)\s+\.run/g;

        var match = findConfigRegex.exec(areasContent);
        test.ok(match);

        var configObject = JSON.parse(match[1]);

        test.ok(configObject.core);
        test.ok(configObject.feature);

        var scripts = configObject.core.scripts;

        test.ok(scripts.indexOf('test/app/core/pages/home-page/HomePage.js') >= 0);
        test.ok(scripts.indexOf('test/app/core/components/site-footer/SiteFooter.js') >= 0);
        test.ok(scripts.indexOf('test/app/core/components/site-header/SiteHeader.js') >= 0);
        test.ok(scripts.indexOf('test/app/core/decorators/focus-on-default/FocusOnDefault.js') >= 0);
        test.ok(scripts.indexOf('test/app/core/.init.js') >= 0);

        scripts = configObject.feature.scripts;

        test.ok(scripts.indexOf('test/app/feature/components/feature-tag/FeatureTag.js') >= 0);
        test.ok(scripts.indexOf('test/app/feature/filters/Currency/Currency.js') >= 0);
        test.ok(scripts.indexOf('test/app/feature/decorators/red-color/RedColor.js') >= 0);
        test.ok(scripts.indexOf('test/app/feature/.init.js') >= 0);

        test.done();
    },

    testAreasInitFiles: function (test) {

        /* core area */

        var areaInitPath = 'test/app/core/.init.js';
        test.ok(grunt.file.exists(areaInitPath));
        var areaInitContent = grunt.file.read(areaInitPath);

        var contentParts = [
            'jsp.component({"component":"spa.core.components.SiteFooter","name":"siteFooter","templateUrl":"test/app/core/components/site-footer/site-footer.html"})',
            'jsp.template("#_page_homePage","<home-page></home-page>")',
            'jsp.component({"component":"spa.core.components.SiteHeader","name":"siteHeader","templateUrl":"test/app/core/components/site-header/site-header.html"})',
            'jsp.component({"route":"/","component":"spa.core.pages.HomePage","name":"homePage","templateUrl":"test/app/core/pages/home-page/home-page.html"})',
            'jsp.decorator({"component":"spa.core.decorators.FocusOnDefault","name":"focusOnDefault"})'
        ];

        contentParts.forEach(function (part) {
            test.ok(areaInitContent.indexOf(part) >= 0);
        });

        /* feature area */

        areaInitPath = 'test/app/feature/.init.js';
        test.ok(grunt.file.exists(areaInitPath));
        areaInitContent = grunt.file.read(areaInitPath);

        contentParts = [
           'jsp.component({"component":"spa.feature.components.FeatureTag","name":"featureTag","templateUrl":"test/app/feature/components/feature-tag/feature-tag.html"})',
           'jsp.decorator({"component":"spa.feature.components.RedColor","name":"redColor"})',
           'jsp.filter({"name":"currency","component":"spa.feature.filters.Currency"})'
        ];

        contentParts.forEach(function (part) {
            test.ok(areaInitContent.indexOf(part) >= 0);
        });

        test.done();
    },


    testRoutesConfig: function (test) {

        var routePath = 'test/app/.routes.js';
        test.ok(grunt.file.exists(routePath));
        var routeContent = grunt.file.read(routePath);

        var findConfigRegex = /jasperRouteTable\.setup\((.+)\);[^$]/g;

        var match = findConfigRegex.exec(routeContent);
        test.ok(match);

        var configObject = JSON.parse(match[1]);
        test.equals(configObject.defaultRoutePath, '/');
        test.ok(configObject.routes);

        test.equals(configObject.routes['/'].templateUrl, '#_page_homePage');
        test.equals(configObject.routes['/'].area, 'core');

        test.done();
    }
};
