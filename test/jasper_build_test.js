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
    return grunt.config('jasper').options;
}

var processSystemPaths = function (path) {
    if (path === '%areas_config%') {
        var config = getConfig();
        return config.appPath + '/_areas.js';
    }
    return path;
}

exports.jasper = {
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
        var areaConfigPath = 'test/app/_areas.js';

        test.ok(grunt.file.exists(areaConfigPath));

        var areasContent = grunt.file.read(areaConfigPath);
        var findConfigRegex = /value\("\$jasperAreasConfig",(.+)\)\s*\.run/g;

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
        test.ok(scripts.indexOf('test/app/core/_init.js') >= 0);

        scripts = configObject.feature.scripts;

        test.ok(scripts.indexOf('test/app/feature/components/feature-tag/FeatureTag.js') >= 0);
        test.ok(scripts.indexOf('test/app/feature/filters/Currency/Currency.js') >= 0);
        test.ok(scripts.indexOf('test/app/feature/decorators/red-color/RedColor.js') >= 0);
        test.ok(scripts.indexOf('test/app/feature/_init.js') >= 0);

        test.done();
    },

    testAreasInitFiles: function (test) {

        /* core area */

        var areaInitPath = 'test/app/core/_init.js';
        test.ok(grunt.file.exists(areaInitPath));
        var areaInitContent = grunt.file.read(areaInitPath);

        var contentParts = [
            'jsp.component({"ctor":"spa.core.components.SiteFooter","name":"siteFooter","templateUrl":"test/app/core/components/site-footer/site-footer.html"})',
            'jsp.template(\'#_page_homePage\',\'<home-page></home-page>\')',
            'jsp.component({"ctor":"spa.core.components.SiteHeader","attributes":[{"name":"my-attr"},{"name":"on-click","type":"exp"}],"name":"siteHeader","templateUrl":"test/app/core/components/site-header/site-header.html"})',
            'jsp.component({"route":"/","ctor":"spa.core.pages.HomePage"',
            'jsp.decorator({"ctor":"spa.core.decorators.FocusOnDefault","name":"focusOnDefault"})'
        ];

        contentParts.forEach(function (part) {
            test.ok(areaInitContent.indexOf(part) >= 0, '\"'+  part + '\" not found in the ' + areaInitPath);
        });

        /* feature area */

        areaInitPath = 'test/app/feature/_init.js';
        test.ok(grunt.file.exists(areaInitPath));
        areaInitContent = grunt.file.read(areaInitPath);

        contentParts = [
           'jsp.component({"ctor":"spa.feature.components.FeatureTag","name":"featureTag","templateUrl":"test/app/feature/components/feature-tag/feature-tag.html"})',
           'jsp.decorator({"ctor":"spa.feature.components.RedColor","name":"redColor"})',
           'jsp.filter({"name":"currency","ctor":"spa.feature.filters.Currency"})'
        ];

        contentParts.forEach(function (part) {
            test.ok(areaInitContent.indexOf(part) >= 0);
        });

        test.done();
    },


    testRoutesConfig: function (test) {

        var routePath = 'test/app/_routes.js';
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
