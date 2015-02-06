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
     '%areas_config%': config.appPath + '/_areas.release.js',
     '%values_config%': config.appPath + '/_values.release.js',
     '%routes_config%': config.appPath + '/_routes.release.js'
  };
  if(wildcards[path])
  {
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

var ensureFilesExistence = function (test, files) {
  files.forEach(function (file) {
    var filePath = path.join(appPath, file);
    test.ok(grunt.file.exists(filePath), 'File not found at \"' + filePath + '\"');
  });
};

exports.jasper = {
  setUp: function (done) {
    this.config = getConfig();
    done();
  },

  testPackageFilesExistance: function (test) {
    var packageFiles = [
      'dist/index.html',
      'dist/styles/all.min.css',
      'dist/scripts/_base.min.js',
      'dist/scripts/core.min.js',
      'dist/scripts/feature.min.js',
      'app/_areas.release.js',
      'app/_routes.release.js'
    ]
    ensureFilesExistence(test, packageFiles);
    test.done();
  },

  testAreasConfig: function (test) {
    var areaConfigPath = path.join(appPath, 'app/_areas.release.js');

    test.ok(grunt.file.exists(areaConfigPath));
    var configObject = testUtils.parseAreasConfig(areaConfigPath);

    test.ok(configObject.core);
    test.ok(configObject.feature);
    test.ok(configObject.boot);

    test.strictEqual(configObject.boot.scripts, undefined, 'Scripts of bootstraped aread must be undefined')

    ensurePartsExistence(test, configObject.feature.dependencies, ['core']);
    ensurePartsExistence(test, configObject.core.scripts, ['scripts/core.min.js']);
    ensurePartsExistence(test, configObject.feature.scripts, ['scripts/feature.min.js']);

    test.done();
  }

};
