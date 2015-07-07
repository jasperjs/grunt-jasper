'use strict';
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');

var JasperUtils = function () {

  this.getPath = function (filepath) {
    return filepath.substring(0, filepath.lastIndexOf('/'));
  };

  this.getParentFolderName = function (filepath) {
    var path = this.getPath(filepath);
    return path.match(/([^\/]*)\/*$/)[1];
  };

  this.camelCase = function (name) {
    var regex = /[A-Z]/g;
    return name.replace(regex, function (letter, pos) {
      return pos ? letter : letter.toLowerCase();
    });
  };

  this.camelCaseTagName = function (tagName) {
    if (tagName.indexOf('-') < 0) {
      return this.camelCase(tagName);
    }

    return tagName.replace(/\-(\w)/g, function (match, letter) {
      return letter.toUpperCase();
    });
  };

  this.shakeCase = function (name) {
    var SNAKE_CASE_REGEXP = /[A-Z]/g;
    var separator = '-';
    return name.replace(SNAKE_CASE_REGEXP, function (letter, pos) {
      return (pos ? separator : '') + letter.toLowerCase();
    });
  };

  this.escapeContent = function (content) {
    var quotRegexp = /\'/g;
    var breaklineRegexp = /(?:\r\n|\r|\n)/g;
    var first = content.replace(/\\/g, '\\\\').replace(quotRegexp, '\\\'').replace(breaklineRegexp, ' ');
    return first;
  };

  this.minifyHtml = function (source) {

    // remove unnecessary spaces:
    var result = source.replace(/(^\s*)/gm, '');

    // remove html comments:
    result = result.replace(/<!--([\s,\S]+?)-->/g, '').trim();

    return this.escapeContent(result);
  };

  this.getPageTemplateUrl = function (page) {
    return '#_page_' + page.name;
  };

  this.getCssTargets = function (cssConfig) {
    if (!Array.isArray(cssConfig)) {
      var result = [];
      for (var prop in cssConfig) {
        result.push({
          filename: prop,
          files: cssConfig[prop]
        })
      }
      return result;
    }
    return [{
      filename: 'all.min.css',
      files: cssConfig
    }];
  };

  this.getAppStyles = function (grunt, cssConfig, appPath) {
    var targets = this.getCssTargets(cssConfig);
    var result = [];
    for (var i = 0; i < targets.length; i++) {
      var target = targets[i];
      result = result.concat(target.files);
    }
    return result.concat(grunt.file.expand(appPath + '/**/*.css'));
  };

  this.writeContent = function (grunt, path, content) {
    grunt.file.write(path, '\ufeff' + content, {encoding: 'utf8'});
  }

  this.getAreaScripts = function (grunt, areaPath, initPath) {
    var tsScripts = grunt.file.expand(areaPath + '/**/*.ts');
    var jsScripts = [];

    for (var i = tsScripts.length - 1; i >= 0; i--) {
      var jsScript = tsScripts[i].replace(/\.ts$/, '.js');
      if (grunt.file.exists(jsScript)) {
        jsScripts.push(jsScript);
      }
    }
    // place _init.js at the end of file set
    jsScripts.push(initPath);
    return jsScripts;
  };

  this.getBootstrapScripts = function (bootstrapScripts, areasConfigPath, routesConfigPath, valuesConfigPath) {

    var wildcards = {
      '%areas_config%': areasConfigPath,
      '%routes_config%': routesConfigPath,
      '%values_config%': valuesConfigPath
    }

    for (var i = 0; i < bootstrapScripts.length; i++) {
      var scriptPath = bootstrapScripts[i];
      if (wildcards[scriptPath]) {
        bootstrapScripts[i] = wildcards[scriptPath]
      }
    }
    return bootstrapScripts;
  };

  /**
   * Split attributes definition string by object for jasper client library usage
   * @param attrs                     string that represents attributes
   * @returns {name: '', type: ''}    collection of attributes
   */
  this.getJasperAttributes = function (attrs) {
    if (typeof (attrs) === 'string') {
      var resultAttrs = [];

      var attrsParts = attrs.split(' ');
      attrsParts.forEach(function (part) {
        var indx = part.indexOf(':');
        if (indx > -1) {
          // attr type specified
          var attrName = part.substring(0, indx);
          var attrType = part.substring(indx + 1, part.length);
          resultAttrs.push({name: attrName, type: attrType});
        } else {
          resultAttrs.push({name: part});
        }
      });

      return resultAttrs;
    }
    return attrs;
  };

  this.splitStringBySpace = function (props) {
    if (typeof (props) === 'string') {
      return props.split(' ').map(function (item) {
        var i = item.trim();
        return i ? i : null;
      }).filter(function (i) {
        return i;
      });
    }
    return props;
  };

  this.isAbsUrl = function (url) {
    var r = new RegExp('^(?:[a-z]+:)?//', 'i');
    return r.test(url);
  };

  /**
   * Excludes from @scripts absolutes script paths and returns array of excluded paths
   * @param scripts   Array of scripts
   */
  this.excludeAbsScripts = function (scripts) {
    var result = [];
    for (var i = scripts.length - 1; i >= 0; i--) {
      if (this.isAbsUrl(scripts[i])) {
        result.push(scripts.splice(i, 1)[0]);
      }
    }
    return result;
  };

  this.computeMd5 = function (content) {
    return crypto.createHash('md5').update(content).digest('hex');
  };

  this.appendFileVersion = function (filepath, appendTo) {
    var md5 = this.computeMd5(fs.readFileSync(filepath, 'utf8'));
    return appendTo + '?v=' + md5;
  };
};

module.exports = new JasperUtils();
