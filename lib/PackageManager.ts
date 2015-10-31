import project = require('./project/Structure');
import finder  =require('./IFinder');
import cssmin =require('./Tools/ICssMinifier');
import min  =require('./Tools/IScriptMinifier');
import config = require('./IJasperBuildConfig');
import files = require('./IFileUtils');

import path = require('path');
import crypto = require('crypto');

export interface IPackageManager {

  packageApp(structure:project.IProjectStructure);

}

export class PackageManager implements IPackageManager {

  constructor(private cssMinifier:cssmin.ICssMinifier,
              private scriptsMinifier:min.IScriptMinifier,
              private jasperConfig:config.IJasperBuildConfig,
              private fileUtils:files.IFileUtils) {

  }

  packageApp(structure:project.IProjectStructure) {
    this.packageStyles(structure);
    this.packageAreasScripts(structure);


  }

  /**
   *  Search all app files
   */
  private packageStyles(structure:project.IProjectStructure) {
    // build CSS styles:
    var stylesMinDest = path.join(this.jasperConfig.packageOutput, 'styles');

    //Determine application css targets
    var cssTargets = this.getCssTargets();

    var lastTarget = cssTargets[cssTargets.length - 1];

    structure.areas.forEach((area) => {
      lastTarget.files = lastTarget.files.concat(area.__styles);
    });

    cssTargets.forEach(target => {
      this.cssMinifier.minifyCss(target.files, path.join(stylesMinDest, target.filename));
    });
  }

  /**
   * Concat and minify all areas scripts
   */
  private packageAreasScripts(structure:project.IProjectStructure):project.AreasClientOptions {
    var options = new project.AreasClientOptions();
    structure.areas.forEach((area) => {
      // fetch external scripts that we can't concat
      var externalScripts = this.excludeAbsScripts(area.scripts);
      // concat all project scripts
      var content = this.fileUtils.concat(area.scripts);

      var filename = area.name + '.' + (this.jasperConfig.fileVersion ? this.getFileVersion(content) + '.' : '') + 'min.js';
      var destMin = path.join(this.jasperConfig.packageOutput, 'scripts', filename);

      this.scriptsMinifier.minify(content, destMin);

      options.addArea(area.name, area.dependencies, externalScripts.concat(destMin));
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
