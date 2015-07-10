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

var coreAreaFilename = 'core.6d99417548e9ee8ad629849335ab6d54.min.js',
  startupFilename = '_startup.efe1b8c56e8f729825118ed6fdb2f519.min.js',
  baseFilename = '_base.b66528ef443c1441a9fd1d61f08ddbd5.min.js',
  featureAreaFilename ='feature.bc3c06ff49df45baa958a09340773fe0.min.js';

var getConfig = function () {
  return grunt.config('jasper').options;
};

var ensurePartsExistence = function (test, content, parts) {
  parts.forEach(function (part) {
    var contentStr = typeof content === 'string' ? content : JSON.stringify(content);
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
      'dist/styles/bootstrap.min.css',
      'dist/scripts/' + baseFilename,
      'dist/scripts/' + coreAreaFilename,
      'dist/scripts/' + startupFilename,
      'dist/scripts/' + featureAreaFilename,
      'app/_areas.release.js',
      'app/_routes.release.js'
    ];
    ensureFilesExistence(test, packageFiles);
    test.done();
  },

  testIndexPage: function (test) {
    var indexPageContent = grunt.file.read(path.join(appPath, 'dist/index.html'));

    var parts = [
      'styles/all.min.css?v=674b5de99c64a2217612d5847542cba0',
      'styles/bootstrap.min.css?v=ade0bdc8a027fad0fc096f35204e25da'
    ];

    ensurePartsExistence(test, indexPageContent, parts);

    test.done();
  },

  testAreasConfig: function (test) {
    var areaConfigPath = path.join(appPath, 'app/_areas.release.js');

    test.ok(grunt.file.exists(areaConfigPath));
    var configObject = testUtils.parseAreasConfig(areaConfigPath);

    test.ok(configObject.core);
    test.ok(configObject.feature);
    test.ok(configObject.boot);

    // test external scripts:
    test.ok(configObject.core.scripts.length === 3, 'Core area must contains 3 scripts after package: 1 area script and 2 external scripts');
    test.ok(configObject.core.scripts[0] === 'http://another.path/to/external/script.js', 'Core area must contains external script');
    test.ok(configObject.core.scripts[1] === '//path/to/external/script.js', 'Core area must contains external script');
    test.ok(configObject.core.scripts[2] === 'scripts/' + coreAreaFilename,'Core area must contains area script');

    test.strictEqual(configObject.boot.scripts, undefined, 'Scripts of bootstrapped area must be undefined')

    ensurePartsExistence(test, configObject.feature.dependencies, ['core']);
    ensurePartsExistence(test, configObject.core.scripts, ['scripts/' + coreAreaFilename]);
    ensurePartsExistence(test, configObject.feature.scripts, ['scripts/' + featureAreaFilename]);

    test.done();
  },

  testHtmlCommentRemoving: function(test){
    var coreFileContent = grunt.file.read(path.join(appPath, 'dist/scripts/' + coreAreaFilename));
    test.ok(coreFileContent.indexOf('<!-- $$test comment$$ -->') < 0);
    test.done();
  },

  testEscapingSlash: function(test){
    var coreFileContent = grunt.file.read(path.join(appPath, 'dist/scripts/' + coreAreaFilename));

    test.ok(coreFileContent.indexOf('\\\\testattrvalue\\\\') > 0, 'core.min.js must escape slash');

    test.done();
  }

};
