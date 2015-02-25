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

var getRegistrationScript = function (def) {
  var result = '';
  var type = def.type.toUpperCase();

  delete def.type;
  delete def.__path;

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

var options, // jasper task options
  processedBootstrapScripts = [], // scripts defined in the task options
  baseScripts = [], //scripts which must included in _base.js
  routesConfigPath, // path to the routes configuration
  areasConfigPath, // path to areas config file
  valuesConfigPath, // path to values config
  pages = [], // found app pages
  areas = [], // set of found areas
  target; // current target of the task

module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-typescript');

  grunt.registerMultiTask('jasper', 'Build jasper application', function () {
    // Merge task-specific and/or target-specific options with these defaults.
    options = this.options({
      singlePage: 'index.html',
      appPath: 'app',
      package: false,
      packageOutput: 'dist',

      defaultRoutePath: '/',
      bootstrapScripts: [],

      baseCss: [],
      /**
       * Include MD5 hash of file content after package
       */
      fileVersion: false
    });

    // pipeline for building jasper application:
    var pipeline = [
    /**
     *  At first we need to find all areas definitions (_area.json) in the project
     */
      'jasperCollectAreas',
    /**
     * Then on each found area, collect all component definitions (_definition.json)
     */
      'jasperCollectDefs',
    /**
     * Then we find all area scripts and build area client-side initialization (_init.js),
     * which tells client what kind of components places in each area
     */
      'jasperAreaInit',
    /**
     * Now we need to concatenate and minify all areas scripts, templates
     * Executes only for package process (options.package == true)
     */
      'jasperPackageAreas',
    /**
     * Now create a client-side areas configuration script (_areas.js) that tell client which areas exists in application,
     * dependencies between areas, and their script files
     */
      'jasperAreasConfig',
    /**
     * Now create a client-side values configuration script (_values.js) that tell client which config values exists in application
     * Executes only if options.values set to true
     */
      'jasperValuesConfig',
    /**
     * Now create a client-side routes configuration script (_routes.js) that tell client which routes exists in application
     */
      'jasperRoutesConfig',
    /**
     * After areas, routes and values config was built we need to create bootstrap script (_base.js) that will loaded at
     * first time and bootstrap the application.
     * Bootstrap script includes:
     * - Scripts that marks as bootstrap in jasper.json file: angular.js, jasper.js, any custom user's scripts.
     * - Areas, routes and values configuration scripts that was built in previous steps
     * - Areas scripts, which marked as 'bootstrap' (in _area.json)
     */
      'jasperPackageBase',
    /**
     * Modify single page, include reference to bootstrap scripts and styles.
     */
      'jasperPatchIndex'
    ];

    target = this.target;

    grunt.task.run(pipeline);

  });

  /**
   * Find all area's definitions (_area.json) files in the app folder
   */
  grunt.registerTask('jasperCollectAreas', 'Find all areas definitions (_area.json) files in the app folder', function () {
    var areasDefinitionFiles = grunt.file.expand(options.appPath + '/**/_area.json');
    areas = [];
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
  });

  /**
   * Find all application component's definitions (_definition.json) files
   */
  grunt.registerTask('jasperCollectDefs', 'Find all application components definitions (_definition.json) files', function () {


    areas.forEach(function (area) {
      var areaDefinitions = [];
      var configurations = grunt.file.expand(area.__path + '/**/_definition.json');

      var registerDefinition = function(config, def){
        if (!def.name) {
          var tagName = utils.getParentFolderName(config);
          def.name = utils.camelCaseTagName(tagName);
        }
        if (!def.type) {
          def.type = 'component';
        }

        if (def.attributes) {
          def.attributes = utils.getJasperAttributes(def.attributes);
        }

        if (def.type.toUpperCase() === 'PAGE') {
          if(!def.area)
            def.area = area.name;
          pages.push(def);
        }

        def.__path = utils.getPath(config);

        if (def.templateFile) {
          def.templateUrl = def.__path + '/' + def.templateFile;
          delete def.templateFile;
        }

        if(def.type.toUpperCase() === 'TEMPLATE'){
          if(!def.templateUrl){
            grunt.log.error('TemplateFile not defined in ' + def.__path);
            return;
          }
          var htmlContent = grunt.file.read(def.templateUrl);
          def.content = utils.minifyHtml(htmlContent, {
            removeComments: true,
            preserveLineBreaks: true
          });
          delete def.templateUrl;
          delete def.templateFile;
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
          };
          areaDefinitions.push(templateDefinition);
        }

        areaDefinitions.push(def);
      };

      configurations.forEach(function (config) {
        var def = grunt.file.readJSON(config);
        if(Array.isArray(def)){
          def.forEach(function(d){
            registerDefinition(config, d);
          });
        }else {
          registerDefinition(config, def);
        }
      });

      area.__defs = areaDefinitions;
    });
  });

  /**
   * Building areas initialization files (_.js)
   * This scripts are lazy-loaded on the page and setup area contents (components, decorators etc)
   */
  grunt.registerTask('jasperAreaInit', 'Building areas initialization files (_init.js)', function () {
    areas.forEach(function (area) {
      var areaScript = 'jsp.ready(function(){ jsp.areas.initArea("' + area.name + '").then(function() { \n\n';
      area.__defs.forEach(function (def) {
        areaScript += getRegistrationScript(def, area.name);
      });
      areaScript += '\n});});';
      var initFilePath = area.__path + '/_init.js';
      area.__initPath = initFilePath;

      // retrieve all area scripts in area folder:
      area.__scripts = utils.getAreaScripts(grunt, area.__path, area.__initPath);
      // concat with custom user scripts for this area:
      area.__scripts = (area.scripts || []).concat(area.__scripts);

      utils.writeContent(grunt, initFilePath, areaScript);

      grunt.log.writeln('Area "' + area.name + '" init file was built at: "' + initFilePath + '"');
    });
  });

  /**
   * Task concatenate and uglify areas scripts
   */
  grunt.registerTask('jasperPackageAreas', 'Concatenate and uglify areas scripts', function () {

    if (!options.package)
      return; // execute on package process only

    var runConcatMinify = false;
    var concatConf = grunt.config('concat') || {};
    var uglifyConf = grunt.config('uglify') || {};
    var cssMinConf = grunt.config('cssmin') || {};

    var appendedAreas = {};

    var findAreaByName = function (areaName) {
      for (var i = 0; i < areas.length; i++) {
        if (areas[i].name === areaName)
          return areas[i];
      }
      return undefined;
    };

    var appendAreasScriptsToBootstrap = function (area, allScripts, hops) {
      if (appendedAreas[area.name]) {
        return; // allready appended
      }
      if (hops > 10) {
        grunt.log.error('Cyclic references found at area ' + area.name);
        return;
      }
      if (area.dependencies && area.dependencies.length) {
        // if area has dependencies, ensure to append it at first
        area.dependencies.forEach(function (areaName) {
          var depArea = findAreaByName(areaName);
          if (!depArea) {
            grunt.log.error('Area "' + areaName + '" not found');
            return;
          }
          appendAreasScriptsToBootstrap(depArea, allScripts, hops++);
        });
      }
      allScripts.push.apply(allScripts, area.__scripts);
      appendedAreas[area.name] = true;
    };

    // Build bootstrap scripts first
    var uglifyFiles = {};
    areas.forEach(function (area) {
      if (!area.bootstrap) {
        var dest = options.packageOutput + '/scripts/' + area.name + '.js';
        var destMin = options.packageOutput + '/scripts/' + area.name + '.min.js';
        concatConf['jasper_' + area.name] = {
          src: area.__scripts,
          dest: dest
        };
        uglifyFiles[destMin] = dest;
        runConcatMinify = true;
      } else {
        // append bootstrap area scripts to the _base.js
        appendAreasScriptsToBootstrap(area, baseScripts, 0);
      }
    });

    uglifyConf.dest = {
      files: uglifyFiles
    };
    var stylesMinDest = options.packageOutput + '/styles/';
    //determine application css targets
    var cssTargets = utils.getCssTargets(options.baseCss);
    var files = [];
    //build cssmin task configuration
    for (var i = 0; i < cssTargets.length; i++) {
      var target = cssTargets[i];
      var fileConfig = {
        src: target.files || [],
        dest: stylesMinDest+ target.filename,
        ext: '.min.css'
      };
      if(i === cssTargets.length - 1){
        fileConfig.src = fileConfig.src.concat(grunt.file.expand(options.appPath + '/**/*.css'));
      }
      files.push(fileConfig);
    }

    cssMinConf['release'] = {
      files: files
    };

    var minifyPipeline = ['cssmin'];
    grunt.config('cssmin', cssMinConf);

    if(runConcatMinify) {
      //run concat minify, only if any area to minify
      grunt.config('uglify', uglifyConf);
      grunt.config('concat', concatConf);
      minifyPipeline = minifyPipeline.concat(['concat', 'uglify']);
    }

    grunt.task.run(minifyPipeline);
  });

  /**
   * Building all areas configuration script (_areas.js)
   * This script attaches to the @options.singlePage and setup
   * client-side areas configuration
   */
  grunt.registerTask('jasperAreasConfig', 'Building all areas configuration script (_areas.js)', function () {
    var fileName = '_areas.' + target + '.js';
    areasConfigPath = options.appPath + '/' + fileName;

    var areaConfig = {};

    areas.forEach(function (area) {
      var config = {};
      config.dependencies = area.dependencies;
      if (options.package) {
        if (area.bootstrap && area.scripts && area.scripts.length) {
          grunt.log.error('Configuration error: bootstrap area \"' + area.name + '\" must not contains "scripts". Use "bootstrapScripts" instead')
          return;
        }
        // if it's a package process and area mark as 'bootstrap' do nothing. This area scripts will included in _base.js
        if (!area.bootstrap) {
          // get all area external scripts
          var areaScrtips = utils.excludeAbsScripts(area.__scripts);
          // during package build each area represents by one .js file
          var areaMinScriptReferencePath = 'scripts/' + area.name + '.min.js';
          if(options.fileVersion) {
            // append version param for area script filename
            areaMinScriptReferencePath = utils.appendFileVersion(options.packageOutput + '/' + areaMinScriptReferencePath, areaMinScriptReferencePath);
          }
          areaScrtips.push(areaMinScriptReferencePath);
          config.scripts = areaScrtips;
        }
      } else {
        config.scripts = area.__scripts;
      }
      areaConfig[area.name] = config;
    });

    var areaConfigScript = templates.areasConfigScript(areaConfig);
    utils.writeContent(grunt, areasConfigPath, areaConfigScript);
    grunt.log.writeln('Areas configuration was built at: "' + areasConfigPath + '"');
  });

  /**
   * Building client-side routes configuration script (_routes.js)
   */
  grunt.registerTask('jasperRoutesConfig', 'Building client-side routes configuration script (_routes.js)', function () {

    var routesConfig = {
      defaultRoutePath: options.defaultRoutePath,
      routes: {}
    };

    pages.forEach(function (page) {
      page.templateUrl = utils.getPageTemplateUrl(page);
      routesConfig.routes[page.route] = page;
    });

    var routesConfigScript = templates.routesConfigScript(routesConfig);
    var fileName = '_routes.' + target + '.js';
    routesConfigPath = options.appPath + '/' + fileName;

    utils.writeContent(grunt, routesConfigPath, routesConfigScript);

    processedBootstrapScripts = utils.getBootstrapScripts(options.bootstrapScripts, areasConfigPath, routesConfigPath, valuesConfigPath);

    grunt.log.writeln('Routes configuration was built at: "' + routesConfigPath + '"');
  });

  /**
   * Building client-side values configuration script (_values.js)
   */
  grunt.registerTask('jasperValuesConfig', 'Building client-side values configuration script (_values.js)', function () {
    if(!options.values)
      return;

    if (!grunt.file.exists(options.values)) {
      grunt.log.error('Values configuration file does not found at: ' + options.values);
      return;
    }
    var valuesConfig = grunt.file.readJSON(options.values);
    if (Object.keys(valuesConfig).length) {
      var valuesConfigScript = templates.valuesConfigScript(valuesConfig);
      var fileName = '_values.' + target + '.js';
      valuesConfigPath = options.appPath + '/' + fileName;

      utils.writeContent(grunt, valuesConfigPath, valuesConfigScript);
      grunt.log.writeln('Values configuration was built at: "' + valuesConfigPath + '"');
    }

  });


  /**
   *  Creates _base.js and _base.min.js files
   */
  grunt.registerTask('jasperPackageBase', 'Modify single page', function () {
    if(!options.package)
      return;
    // concat base
    var concatConf = grunt.config('concat') || {};
    var uglifyConf = grunt.config('uglify') || {};
    var baseDest = options.packageOutput + '/scripts/_base.js';

    baseScripts = processedBootstrapScripts.concat(baseScripts);

    concatConf.jasperbase = {
      src: baseScripts,
      dest: baseDest
    };

    var files = {};
    files[options.packageOutput + '/scripts/_base.min.js'] = baseDest;
    uglifyConf.jasperbase = {
      files: files
    };

    grunt.config('concat', concatConf);
    grunt.config('uglify', uglifyConf);

    grunt.task.run(['concat:jasperbase', 'uglify:jasperbase']);

  });

  /**
   * Patching index page. Insert all scripts and styles
   */
  grunt.registerTask('jasperPatchIndex', 'Modify single page', function () {
    var pageContent = grunt.file.read(options.singlePage);

    /* patch scripts */
    var scripts = [];
    if (options.package) {
      var baseReferencePath = 'scripts/_base.min.js';
      if (options.fileVersion) {
        baseReferencePath = utils.appendFileVersion(options.packageOutput + '/' + baseReferencePath, baseReferencePath);
      }
      scripts.push(baseReferencePath);
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
      var cssTargets = utils.getCssTargets(options.baseCss);
      var styleReferencePath = 'styles/';
      for (var i = 0; i < cssTargets.length; i++) {
        var target = cssTargets[i];
        var cssPath = styleReferencePath + target.filename;
        if (options.fileVersion) {
          cssPath = utils.appendFileVersion(options.packageOutput + '/' + cssPath, cssPath);
        }
        styles.push(cssPath);
      }

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
