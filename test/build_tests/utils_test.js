'use strict';

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

var utils = require('../../tasks/jasper-utils');
exports.utils = {
  setUp: function (done) {
    // setup here if necessary
    done();
  },

  testAttributesParse: function (test) {
    var attributes = "my-attr:text on-click:exp some-attr";

    var result = utils.getJasperAttributes(attributes);

    test.equals(result.length, 3, 'Result of parsing attributes must contain all attributes');

    test.equals(result[0].name, 'my-attr');
    test.equals(result[0].type, 'text');

    test.equals(result[1].name, 'on-click');
    test.equals(result[1].type, 'exp');

    test.equals(result[2].name, 'some-attr');
    test.ok(!result[2].type);

    test.done();
  },

  testAttributesParseNoString: function (test) {
    var attributes = [{
      name: 'my-attr',
      type: 'exp'
    }];

    var result = utils.getJasperAttributes(attributes);
    test.strictEqual(result, attributes);
    test.done();
  },

  testAbsUrlDetection: function (test) {

    var params = {
      '/path/to/script.js': false,
      'path/to/script.js': false,
      'http://path.to/script.js': true,
      'https://path.to/script.js?v=2': true,
      '//maps.googleapis.com/maps/api/js?key=qwe8&amp;callback=onMapReady': true
    };

    for(var addr in params){
      test.ok(utils.isAbsUrl(addr) === params[addr], addr + ' not excepted as abs url');
    }
    test.done();
  },

  testAbsUrlExclution: function (test) {

    var scripts = [
      'path/to/script.js',
      '/path/to/script.js',
      'https://google.com/script.js',
      'scripts/temp.js'
    ];

    var absScripts = utils.excludeAbsScripts(scripts);
    test.ok(absScripts.length === 1, 'Result of exclusion must contains excluded scripts');
    test.ok(absScripts[0] === 'https://google.com/script.js', 'Result of exclusion must contains excluded scripts');

    test.ok(scripts.length === 3);
    test.ok(scripts[0] === 'path/to/script.js');
    test.ok(scripts[1] === '/path/to/script.js');
    test.ok(scripts[2] === 'scripts/temp.js');

    test.done();
  }

};
