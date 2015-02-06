'use strict';
var grunt = require('grunt');

var TestUtils = function () {

  this.parseAreasConfig = function (filepath) {
    var areasContent = grunt.file.read(filepath);
    var findConfigRegex = /value\("\$jasperAreasConfig",(.+)\)\s*\.run/g;
    var match = findConfigRegex.exec(areasContent);
    return JSON.parse(match[1]);
  };

  this.parseRoutesConfig = function(filepath){
    var routeContent = grunt.file.read(filepath);
    var findConfigRegex = /jasperRouteTable\.setup\((.+)\);[^$]/g;

    var match = findConfigRegex.exec(routeContent);
    return JSON.parse(match[1]);
  }

};

module.exports = new TestUtils();
