'use strict';

var minify = require('html-minifier').minify;

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

    this.minifyHtml = function (source) {
        var escapeContent = function (content) {
            var quotRegexp = /\'/g;
            var breaklineRegexp = /(?:\r\n|\r|\n)/g;
            var first = content.replace(quotRegexp, '\\\'').replace(breaklineRegexp, ' ');
            console.log(first);
            return first;
        };

        var result = minify(source);
        result = result.replace(/(^\s*)/gm, '');
        console.log(result);
        return escapeContent(result);
    }

    this.getPageTemplateUrl = function (page) {
        return '#_page_' + page.name;
    };

    this.writeContent = function (grunt, path, content) {
        grunt.file.write(path, '\ufeff' + content, { encoding: 'utf8' });
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

    this.getBootstrapScripts = function (bootstrapScripts, areasConfigPath, routesConfigPath) {
        for (var i = 0; i < bootstrapScripts.length; i++) {
            bootstrapScripts[i] = bootstrapScripts[i]
              .replace('%areas_config%', areasConfigPath)
              .replace('%routes_config%', routesConfigPath);
        }
        return bootstrapScripts;
    };

    this.getAppStyles = function (grunt, baseCss, appPath) {
        return baseCss.concat(grunt.file.expand(appPath + '/**/*.css'));
    };

    /**
     * Split attributes definition string by object for jasper client library usage
     * @param attrs                     string that represents attributes
     * @returns {name: '', type: ''}    collection of attributes
     */
    this.getJasperAttributes = function(attrs) {
        if(typeof (attrs) ==='string'){
            var resultAttrs = [];

            var attrsParts = attrs.split(' ');
            attrsParts.forEach(function(part){
              var indx =  part.indexOf(':');
              if(indx > -1){
                // attr type specified
                var attrName = part.substring(0, indx);
                var attrType = part.substring(indx + 1, part.length);
                resultAttrs.push({name: attrName, type: attrType});
              }else{
                resultAttrs.push({name: part});
              }
            });

            return resultAttrs;
        }
        return attrs;
    };
};

module.exports = new JasperUtils();
