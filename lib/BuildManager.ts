import config  = require('./IJasperBuildConfig');
import composition = require('./ICompositionRoot');
import p = require('./PackageBuilder');
import structure = require('./project/ProjectStructureBuilder');
import areas = require('./IAreaService');

export class BuildManager {

  private projectStructureBuilder:structure.ProjectStructureBuilder;
  private packageBuilder:p.PackageBuilder;
  private areasSvc:areas.AreaService;

  constructor(private buildConfig:config.IJasperBuildConfig,
              private root:composition.ICompositionRoot = new composition.JasperCompositionRoot()) {

    this.projectStructureBuilder = new structure.ProjectStructureBuilder(
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

  }

  packageProject() {
    this.buildConfig.package = true;
    var structure = this.projectStructureBuilder.buildStructure();

    this.areasSvc.buildAllAreas(structure);

    this.packageBuilder.packageApp(structure);
  }

  private buildProjectStructure() {

  }

}
