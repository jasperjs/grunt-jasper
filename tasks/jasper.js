/*
 * grunt-jasper
 * https://github.com/jasperjs/grunt-jasper
 *
 * Copyright (c) 2015 bukharin
 * Licensed under the MIT license.
 */

'use strict';
var utils = require('./jasper-utils.js');
var templates = require('./jasper-templates.js');
var path = require('path');

var getRegistrationScript = function (def) {
  var result = '';
  var type = def.type.toUpperCase();

  delete def.type;
  delete def.__path;
  delete def.templateFile;

  switch (type.toUpperCase()) {
    case 'COMPONENT':
      result = templates.componentRegistration(def);
      break;
    case 'DECORATOR':
      result = templates.decoratorRegistration(def);
      break;
    case 'SERVICE':
      result = templates.serviceRegistration(def);
      break;
    case 'FILTER':
      result = templates.filterRegistration(def);
      break;
    case 'DIRECTIVE':
      result = templates.directiveRegistration(def);
      break;
    case 'TEMPLATE':
      result = templates.templateRegistration(def.url, def.content);
      break;
    case 'PAGE':
      var pageTemplateUrl = utils.getPageTemplateUrl(def);
      var tagName = utils.shakeCase(def.name);
      var pageTemplate = '<' + tagName + '></' + tagName + '>';
      // register page template and the page component
      result = templates.templateRegistration(pageTemplateUrl, pageTemplate);
      result += templates.componentRegistration(def);
      break;
    default:
      grunt.util.error('Unknown definition type "' + def + '" in "' + JSON.stringify(def) + '"');
      break;
  }
  return result;
};

module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-typescript');

  grunt.registerMultiTask('jasper', 'Build jasper application', function (release) {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      singlePage: 'index.html',
      appPath: 'app',
      package: false,
      packageOutput: 'dist',

      defaultRoutePath: '/',
      bootstrapScripts: [],
      baseCss: []
    });

    var areas = [], pages = [], areasConfigPath, routesConfigPath;

    /* Find all area's definitions (_area.json) files in the app folder */

    var areasDefinitionFiles = grunt.file.expand(options.appPath + '/**/_area.json');

    areasDefinitionFiles.forEach(function (configFile) {
      var area = grunt.file.readJSON(configFile);
      if (!area.dependencies) {
        area.dependencies = [];
      }
      if (!area.name) {
        area.name = utils.getParentFolderName(configFile);
      }
      area.__path = utils.getPath(configFile);
      areas.push(area);
    });

    /* Find all application component's definitions (_definition.json) files */

    areas.forEach(function (area) {
      var areaDefinitions = [];
      var configurations = grunt.file.expand(area.__path + '/**/_definition.json');

      configurations.forEach(function (config) {
        var def = grunt.file.readJSON(config);
        if (!def.name) {
          var tagName = utils.getParentFolderName(config);
          def.name = utils.camelCaseTagName(tagName);
        }
        if (!def.type) {
          def.type = 'component';
        }

        if(def.attributes){
          def.attributes = utils.getJasperAttributes(def.attributes);
        }

        if (def.type.toUpperCase() === 'PAGE') {
          def.area = area.name;
          pages.push(def);
        }

        def.__path = utils.getPath(config);

        if (def.templateFile) {
          def.templateUrl = def.__path + '/' + def.templateFile;
        }
        // if we package our application, we need to collect all html templates
        if (options.package && def.templateUrl) {
          var htmlContent = grunt.file.read(def.templateUrl);
          var templateDefinition = {
            type: 'template',
            url: def.templateUrl,
            content: utils.minifyHtml(htmlContent, {
              removeComments: true,
              preserveLineBreaks: true
            })
          }
          areaDefinitions.push(templateDefinition);
        }

        areaDefinitions.push(def);
      });
      area.__defs = areaDefinitions;
    });

    /*
     * Building areas initialization files (_.js)
     * This scripts are lazy-loaded on the page and setup area contents (components, decorators etc)
     */

    areas.forEach(function (area) {
      var areaScript = 'jsp.ready(function(){ jsp.areas.initArea("' + area.name + '").then(function() { \n\n';
      area.__defs.forEach(function (def) {
        areaScript += getRegistrationScript(def, area.name);
      });
      areaScript += '\n});});';
      var initFilePath = area.__path + '/_init.js';
      area.__initPath = initFilePath;

      utils.writeContent(grunt, initFilePath, areaScript);

      grunt.log.writeln('Area "' + area.name + '" init file was built at: "' + initFilePath + '"');
    });

    /*
     * Building all areas configuration script (_areas.js)
     * This script attaches to the @options.singlePage and setup
     * client-side areas configuration
     */

    var fileName = '_areas.' + this.target + '.js';
    areasConfigPath = options.appPath + '/' + fileName;

    var areaConfig = {};

    var findAreaByName = function (areaName) {
      for (var i = 0; i < areas.length; i++) {
        if (areas[i].name === areaName)
          return areas[i];
      }
      return undefined;
    }

    areas.forEach(function (area) {
      var config = {};
      config.dependencies = area.dependencies;
      area.__scripts = utils.getAreaScripts(grunt, area.__path, area.__initPath);

      if (options.package) {
        if (area.bootstrap) {
          config.dependencies = [];
        } else {
          // during package build each area represents by one .js file
          config.scripts = ['scripts/' + area.name + '.min.js'];
          for (var i = area.dependencies.length - 1; i >= 0; i--) {
            var dependencyArea = findAreaByName(area.dependencies[i]);
            if (dependencyArea && dependencyArea.bootstrap) {
              area.dependencies.splice(i, 1);
            }
          }
        }
      } else {
        config.scripts = area.__scripts;
      }
      areaConfig[area.name] = config;
    });

    var areaConfigScript = templates.areasConfigScript(areaConfig);
    utils.writeContent(grunt, areasConfigPath, areaConfigScript);
    grunt.log.writeln('Areas configuration was built at: "' + areasConfigPath + '"');

    /*
     * Building client-side routes configuration script (_routes.js)
     */

    var routesConfig = {
      defaultRoutePath: options.defaultRoutePath,
      routes: {}
    };

    pages.forEach(function (page) {
      page.templateUrl = utils.getPageTemplateUrl(page);
      routesConfig.routes[page.route] = page;
    });

    var routesConfigScript = templates.routesConfigScript(routesConfig);
    var fileName = '_routes.' + this.target + '.js';
    var routesConfigPath = options.appPath + '/' + fileName;

    utils.writeContent(grunt, routesConfigPath, routesConfigScript);
    grunt.log.writeln('Routes configuration was built at: "' + routesConfigPath + '"');

    /*
     * Building client-side values configuration script (_values.js)
     */

    if(options.values) {
      if(!grunt.file.exists(options.values)){
        grunt.log.error('Values configuration file does not found at: ' + options.values);
        return;
      }
      var valuesConfig  = grunt.file.readJSON(options.values);
      if(Object.keys(valuesConfig).length){
        var valuesConfigScript = templates.valuesConfigScript(valuesConfig);
        var fileName = '_values.' + this.target + '.js';
        var valuesConfigPath = options.appPath + '/' + fileName;

        utils.writeContent(grunt, valuesConfigPath, valuesConfigScript);
        grunt.log.writeln('Values configuration was built at: "' + valuesConfigPath + '"');
      }
    }

    /*
     * Combine all script and styles (only when package application)
     */

    var processedBootstrapScripts = utils.getBootstrapScripts(options.bootstrapScripts, areasConfigPath, routesConfigPath, valuesConfigPath);

    if (options.package) {

      var concatConf = grunt.config('concat') || {};
      var uglifyConf = grunt.config('uglify') || {};
      var cssMinConf = grunt.config('cssmin') || {};

      // Build bootstrap scripts first
      var bootstrapScripts = processedBootstrapScripts;
      var uglifyFiles = {};
      areas.forEach(function (area) {
        if (!area.bootstrap) {
          var dest = options.packageOutput + '/scripts/' + area.name + '.js';
          var destMin = options.packageOutput + '/scripts/' + area.name + '.min.js';
          concatConf[area.name] = {
            src: area.__scripts,
            dest: dest
          };

          uglifyFiles[destMin] = dest;

        } else {
          bootstrapScripts = options.bootstrapScripts.concat(area.__scripts);
        }
      });

      // concat base
      var baseDest = options.packageOutput + '/scripts/_base.js';
      var baseMinDest = options.packageOutput + '/scripts/_base.min.js';
      var stylesMinDest = options.packageOutput + '/styles/all.min.css';
      concatConf['jasperbase'] = {
        src: bootstrapScripts,
        dest: baseDest
      }

      uglifyFiles[baseMinDest] = baseDest;

      uglifyConf.dest = {
        files: uglifyFiles
      }

      cssMinConf['release'] = {
        files: [{
          src: utils.getAppStyles(grunt, options.baseCss, options.appPath),
          dest: stylesMinDest,
          ext: '.min.css'
        }]
      }

      grunt.config('uglify', uglifyConf);
      grunt.config('concat', concatConf);
      grunt.config('areas', areas);
      grunt.config('cssmin', cssMinConf);

      grunt.task.run(['concat', 'uglify', 'cssmin']);

    }

    /*
     * Patching index page. Insert all scripts and styles
     */

    var pageContent = grunt.file.read(options.singlePage);

    /* patch scripts */
    var scripts = [];
    if (options.package) {
      scripts.push('scripts/_base.min.js');
    } else {
      scripts = processedBootstrapScripts;
    }

    var scriptsHtml = '';
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i]) {
        scriptsHtml += '\t<script src="' + scripts[i] + '"></script>\r\n';
      }
    }
    var scriptsRegex = /<!-- SCRIPTS -->([\s\S]*)<!-- \/SCRIPTS -->/gim;
    pageContent = pageContent.replace(scriptsRegex, '<!-- SCRIPTS -->\r\n\r\n' + scriptsHtml + '\r\n\t<!-- /SCRIPTS -->');

    /* patch css */
    var styles = [];
    if (options.package) {
      styles.push('styles/all.min.css');
    } else {
      styles = utils.getAppStyles(grunt, options.baseCss, options.appPath);
    }

    var stylesHtml = '';
    for (var i = 0; i < styles.length; i++) {
      stylesHtml += '\t<link rel="stylesheet" href="' + styles[i] + '"/>\r\n';
    }
    var stylesRegex = /<!-- STYLES -->([\s\S]*)<!-- \/STYLES -->/gim;
    pageContent = pageContent.replace(stylesRegex, '<!-- STYLES -->\r\n\r\n' + stylesHtml + '\r\n\t<!-- /STYLES -->');

    var pageToSave = options.package ? grunt.template.process(options.packageOutput + '/index.html') : options.singlePage;

    utils.writeContent(grunt, pageToSave, pageContent);

  });

};
