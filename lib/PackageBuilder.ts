import project = require('./project/Structure');
import finder  =require('./IFinder');
import cssmin =require('./Tools/ICssMinifier');
import min  =require('./Tools/IScriptMinifier');
import config = require('./IJasperBuildConfig');
import files = require('./IFileUtils');
import utils = require('./Utils');

import path = require('path');
import crypto = require('crypto');

import log = require('./ILogger');

export interface IPackageBuilder {

  packageApp(structure:project.IProjectStructure);

}

export class PackageBuilder implements IPackageBuilder {

  private scriptsFolder = 'scripts';

  constructor(private cssMinifier:cssmin.ICssMinifier,
              private scriptsMinifier:min.IScriptMinifier,
              private jasperConfig:config.IJasperBuildConfig,
              private fileUtils:files.IFileUtils,
              private logger:log.ILogger) {

  }

  packageApp(structure:project.IProjectStructure) {

    this.packageStyles(structure);

    var areasConfig = this.packageAreasScripts(structure);

    var baseMinPath = this.packageBaseScripts();
    var startupMinPath = this.buildStartupScript(structure, areasConfig);

    this.logger.info(`Base script created at '${baseMinPath}'`);
    this.logger.info(`Startup script created at '${startupMinPath}'`);
  }

  private packageBaseScripts():string {
    var baseScripts = this.jasperConfig.baseScripts || [];

    var baseScriptContent = this.fileUtils.concat(baseScripts);
    var filename = '_base.' + (this.jasperConfig.fileVersion ? this.getFileVersion(baseScriptContent) + '.' : '') + 'min.js';
    var destMin = path.join(this.jasperConfig.packageOutput, this.scriptsFolder, filename);
    this.scriptsMinifier.minify(baseScriptContent, destMin);

    return destMin;
  }

  private buildStartupScript(structure:project.IProjectStructure, areasConfig:project.AreasClientOptions):string {
    var startupScriptContent = '';
    //append areas client config:
    startupScriptContent += areasConfig.toClientConfigScript();
    //append routes config
    startupScriptContent += structure.routes.toClientConfigScript();
    //append values config
    if (structure.values) {
      startupScriptContent += structure.values.toClientConfigScript();
    }

    if (this.jasperConfig.startup) {
      startupScriptContent += this.fileUtils.readFile(this.jasperConfig.startup);
    }

    var filename = '_startup.' + (this.jasperConfig.fileVersion ? this.getFileVersion(startupScriptContent) + '.' : '') + 'min.js';
    var destMin = path.join(this.jasperConfig.packageOutput, this.scriptsFolder, filename);
    this.scriptsMinifier.minify(startupScriptContent, destMin);
    return destMin;
  }

  /**
   *  Search all app files
   */
  private packageStyles(structure:project.IProjectStructure) {
    this.logger.info('Packaging styles...');

    // build CSS styles:
    var stylesMinDest = path.join(this.jasperConfig.packageOutput, 'styles');

    //Determine application css targets
    var cssTargets = this.getCssTargets();

    var lastTarget = cssTargets[cssTargets.length - 1];

    structure.areas.forEach((area) => {
      lastTarget.files = lastTarget.files.concat(area.__styles);
    });

    cssTargets.forEach(target => {
      var cssPath = path.join(stylesMinDest, target.filename);
      this.cssMinifier.minifyCss(target.files, cssPath);
      this.logger.info(`Styles created at '${cssPath}'`);
    });
  }

  /**
   * Concat and minify all areas scripts
   */
  private packageAreasScripts(structure:project.IProjectStructure):project.AreasClientOptions {
    this.logger.info('Packaging areas scripts...');
    var options = new project.AreasClientOptions();
    structure.areas.forEach((area) => {
      // fetch external scripts that we can't concat
      var externalScripts = this.excludeAbsScripts(area.scripts);
      // concat all project scripts
      var content = this.fileUtils.concat(area.scripts);

      var filename = area.name + '.' + (this.jasperConfig.fileVersion ? this.getFileVersion(content) + '.' : '') + 'min.js';
      var destMin = path.join(this.jasperConfig.packageOutput, this.scriptsFolder, filename);
      var clientDestMin = utils.convertPathClient(path.join(this.jasperConfig.baseHref, this.scriptsFolder, filename));

      this.scriptsMinifier.minify(content, destMin);

      this.logger.info(`Area script created at '${destMin}'`);

      options.addArea(area.name, area.dependencies, externalScripts.concat(clientDestMin));
    });
    return options;
  }

  private getCssTargets():{files: string[], filename: string}[] {
    var cssConfig = this.jasperConfig.baseCss;
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
      files: <string[]>cssConfig
    }];
  }

  private getFileVersion(content:string) {
    return crypto.createHash('md5').update(content).digest('hex');
  }

  private isAbsUrl(url:string):boolean {
    var r = new RegExp('^(?:[a-z]+:)?//', 'i');
    return r.test(url);
  }

  /**
   * Excludes from @scripts absolutes script paths and returns array of excluded paths
   * @param scripts   Array of scripts
   */
  private excludeAbsScripts(scripts:string[]):string[] {
    var result = [];
    for (var i = scripts.length - 1; i >= 0; i--) {
      if (this.isAbsUrl(scripts[i])) {
        result.push(scripts.splice(i, 1)[0]);
      }
    }
    return result;
  }

}
