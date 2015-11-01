import config  = require('./IJasperBuildConfig');
import composition = require('./ICompositionRoot');
import p = require('./PackageBuilder');
import builder = require('./project/ProjectStructureBuilder');
import struct = require('./project/Structure');
import areas = require('./IAreaService');

import path = require('path');

export class BuildManager {

  private projectStructureBuilder:builder.ProjectStructureBuilder;
  private packageBuilder:p.PackageBuilder;
  private areasSvc:areas.AreaService;

  constructor(private buildConfig:config.IJasperBuildConfig,
              private root:composition.ICompositionRoot = new composition.JasperCompositionRoot()) {

    this.projectStructureBuilder = new builder.ProjectStructureBuilder(
      this.root.fileUtils,
      this.buildConfig,
      this.root.scriptsFinder,
      this.root.stylesFinder);

    this.packageBuilder = new p.PackageBuilder(this.root.cssMinifier,
      this.root.scriptsMinifier,
      this.buildConfig,
      this.root.fileUtils,
      this.root.logger);

    this.areasSvc = new areas.AreaService(this.root.fileUtils);

  }

  buildProject() {
    this.buildConfig.package = false;
    var structure = this.projectStructureBuilder.buildStructure();
    // build _init.js file of all areas
    this.areasSvc.buildAllAreas(structure);

    //_areas.js
    var areaConfigPath = this.buildAreasConfig(structure);
    //_routes.js
    var routesConfigPath = this.buildRoutesConfig(structure);
    //_values.js
    var routesConfigPath : string = null;
    if(structure.values){
      routesConfigPath = this.buildValuesConfig(structure);
    }



  }

  packageProject() {
    this.buildConfig.package = true;
    var structure = this.projectStructureBuilder.buildStructure();

    this.areasSvc.buildAllAreas(structure);

    this.packageBuilder.packageApp(structure);
  }

  private buildRoutesConfig(structure:struct.IProjectStructure):string {
    var routeScript = structure.routes.toClientConfigScript()
    var routeConfigPath = path.join(this.buildConfig.appPath, '_routes.js');
    this.root.fileUtils.writeFile(routeConfigPath, routeScript);
    return routeConfigPath;
  }

  private buildValuesConfig(structure:struct.IProjectStructure):string {
    var valuesScript = structure.values.toClientConfigScript()
    var valuesConfigPath = path.join(this.buildConfig.appPath, '_values.js');
    this.root.fileUtils.writeFile(valuesConfigPath, valuesScript);
    return valuesConfigPath;
  }

  private buildAreasConfig(structure:struct.IProjectStructure):string {
    var areasConfig = struct.AreasClientOptions.createFromProject(structure);
    var areasScript = areasConfig.toClientConfigScript();
    var areasConfigPath = path.join(this.buildConfig.appPath, '_areas.js');
    this.root.fileUtils.writeFile(areasConfigPath, areasScript);
    return areasConfigPath;
  }


}
