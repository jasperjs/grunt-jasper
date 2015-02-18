'use strict';

var grunt = require('grunt');
var path = require('path');
var testUtils = require('../utils');

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

var appPath = 'test/testApp';

var getConfig = function () {
  return grunt.config('jasper').options;
};

var processSystemPaths = function (path) {
  var config = getConfig();
  var wildcards = {
    '%areas_config%': config.appPath + '/_areas.debug.js',
    '%values_config%': config.appPath + '/_values.debug.js',
    '%routes_config%': config.appPath + '/_routes.debug.js'
  };
  if (wildcards[path]) {
    return wildcards[path];
  }
  return path;
};

var ensurePartsExistence = function (test, content, parts) {
  parts.forEach(function (part) {
    var contentStr = typeof content === 'string' ? content.substring(0, 100) : JSON.stringify(content);
    test.ok(content.indexOf(part) >= 0, 'Part \"' + part + '\" not found in \"' + contentStr + '...\"');
  });
};

exports.jasper = {
  setUp: function (done) {
    this.config = getConfig();
    done();
  },

  testIndexPageScripts: function (test) {
    var scripts = this.config.bootstrapScripts;
    var indexPageContent = grunt.file.read(path.join(appPath, 'index.html'));

    scripts.forEach(function (path) {
      var scriptReferenceText = '<script src="' + processSystemPaths(path) + '"></script>';
      test.ok(indexPageContent.indexOf(scriptReferenceText) >= 0, 'Page content must contain ' + processSystemPaths(path) + ' reference');
    });

    test.done();
  },

  testIndexPageStyles: function (test) {
    var indexPageContent = grunt.file.read(path.join(appPath, 'index.html'));
    var styles = grunt.file.expand(path.join(appPath, '/app/**/*.css'));
    var parts = ['test/testApp/base.css'];
    styles.forEach(function (path) {
      parts.push('<link rel="stylesheet" href="' + path + '"/>');
    });
    ensurePartsExistence(test, indexPageContent, parts);

    test.done();
  },

  testAreasConfig: function (test) {
    var areaConfigPath = path.join(appPath, 'app/_areas.debug.js');

    test.ok(grunt.file.exists(areaConfigPath));
    var configObject = testUtils.parseAreasConfig(areaConfigPath);

    test.ok(configObject.core);
    test.ok(configObject.feature);
    test.ok(configObject.boot);

    var scripts = configObject.core.scripts;

    var parts = [
      'test/testApp/scripts/custom.js',
      '//path/to/external/script.js',
      'http://another.path/to/external/script.js',

      appPath + '/app/core/pages/home-page/HomePage.js',
      appPath + '/app/core/components/site-footer/SiteFooter.js',
      appPath + '/app/core/components/site-footer/SiteFooter2.js',
      appPath + '/app/core/components/site-header/SiteHeader.js',
      appPath + '/app/core/decorators/focus-on-default/FocusOnDefault.js',
      appPath + '/app/core/_init.js'
    ];

    ensurePartsExistence(test, scripts, parts);

    scripts = configObject.feature.scripts;

    parts = [
      appPath + '/app/feature/components/feature-tag/FeatureTag.js',
      appPath + '/app/feature/filters/Currency/Currency.js',
      appPath + '/app/feature/decorators/red-color/RedColor.js',
      appPath + '/app/feature/_init.js'
    ];
    ensurePartsExistence(test, scripts, parts);

    scripts = configObject.boot.scripts;

    parts = [
      appPath + '/app/boot/components/feature-tag/BootTag.js',
      appPath + '/app/boot/_init.js'
    ];

    ensurePartsExistence(test, scripts, parts);

    test.done();
  },

  testAreasInitFiles: function (test) {

    /* core area */

    var areaInitPath = path.join(appPath, 'app/core/_init.js');
    test.ok(grunt.file.exists(areaInitPath));
    var areaInitContent = grunt.file.read(areaInitPath);

    var contentParts = [
      'jsp.component({"ctrl":"spa.core.components.SiteFooter","name":"siteFooter","templateUrl":"test/testApp/app/core/components/site-footer/site-footer.html"})',
      'jsp.template(\'#_page_homePage\',\'<home-page></home-page>\')',
      'jsp.component({"ctrl":"spa.core.components.SiteHeader","attributes":[{"name":"my-attr"},{"name":"on-click","type":"exp"}],"name":"siteHeader","templateUrl":"test/testApp/app/core/components/site-header/site-header.html"})',
      'jsp.component({"route":"/","ctrl":"spa.core.pages.HomePage"',
      'jsp.decorator({"ctrl":"spa.core.decorators.FocusOnDefault","name":"focusOnDefault"})',
      'jsp.template(\'template\',\'<p>custom template</p>\');'
    ];

    ensurePartsExistence(test, areaInitContent, contentParts);

    /* feature area */

    areaInitPath = path.join(appPath, 'app/feature/_init.js');
    test.ok(grunt.file.exists(areaInitPath));
    areaInitContent = grunt.file.read(areaInitPath);

    contentParts = [
      'jsp.component({"ctrl":"spa.feature.components.FeatureTag","name":"featureTag","templateUrl":"test/testApp/app/feature/components/feature-tag/feature-tag.html"})',
      'jsp.decorator({"ctrl":"spa.feature.components.RedColor","name":"redColor"})',
      'jsp.filter({"name":"currency","ctrl":"spa.feature.filters.Currency"})'
    ];

    ensurePartsExistence(test, areaInitContent, contentParts);

    contentParts.forEach(function (part) {
      test.ok(areaInitContent.indexOf(part) >= 0);
    });

    test.done();
  },


  testRoutesConfig: function (test) {
    var routePath = path.join(appPath, 'app/_routes.debug.js');
    test.ok(grunt.file.exists(routePath));
    var configObject = testUtils.parseRoutesConfig(routePath);
    ;

    test.equals(configObject.defaultRoutePath, '/');
    test.ok(configObject.routes);

    test.equals(configObject.routes['/'].templateUrl, '#_page_homePage');
    test.equals(configObject.routes['/'].area, 'core');

    test.done();
  },

  testValuesConfig: function (test) {

    var valuesConfigPath = path.join(appPath, 'app/_values.debug.js');
    test.ok(grunt.file.exists(valuesConfigPath));
    var valuesModuleContent = grunt.file.read(valuesConfigPath);

    var contentParts = [
      'angular.module("jasperValuesConfig"',
      'v.register("arrayValue", [{"prop1":"test"},{"prop2":"test 2"}]);',
      'v.register("objectValue", {"title":"test"});',
      'v.register("numberValue", 200);',
      'v.register("stringValue", "test string");'
    ];

    ensurePartsExistence(test, valuesModuleContent, contentParts);


    test.done();
  }

};
