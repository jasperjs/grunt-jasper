import f = require("./IFileUtils");
import structure = require("./project/Structure");
import builder = require("./project/ProjectStructureBuilder");
import path = require('path');
import utils = require('./Utils');


export interface IAreaService {

  /**
   * Builds _init.js file in area folder
   * @param areaName
   */
  buildArea(areaName:string, structure:structure.IProjectStructure);

  /**
   * Build _init.js for all areas found in projet
   */
  buildAllAreas(structure:structure.IProjectStructure);

  /**
   *  Build _areas.js client configuration
   */
  buildAreasConfig(): string;

}

export class AreaService implements IAreaService {

  constructor(private fileUtils:f.IFileUtils) {

  }

  buildArea(areaName:string, structure:structure.IProjectStructure) {
    var area = this.getAreaByName(areaName, structure);
    if (!area) {
      throw 'Area with name "' + area + '" not found';
    }

    this.buildInitJsArea(area);

  }

  buildAllAreas(structure:structure.IProjectStructure) {
    structure.areas.forEach(area=> {
      this.buildInitJsArea(area);
    });
  }

  buildAreasConfig():string {
    return '';
  }

  private buildInitJsArea(area:structure.IAreaDefinition) {
    var defScript = '';
    area.__definitions.forEach((def) => {
      defScript += this.getRegistrationScript(def);
    });

    var areaScript = `jsp.ready(function(){ jsp.areas.initArea("${area.name}", function() { ${defScript} });});`;

    var initFilePath = path.join(area.__path, '_init.js');

    this.fileUtils.writeFile(initFilePath, areaScript);

    area.scripts.push(utils.convertPathClient(initFilePath));

  }

  private getRegistrationScript(def:structure.IProjectDefinition) {
    var result = '';

    switch (def.__type.toUpperCase()) {
      case "COMPONENT":
        result = this.componentRegistration(def);
        break;
      case "DECORATOR":
        result = this.decoratorRegistration(def);
        break;
      case "FILTER":
        result = this.filterRegistration(def);
        break;
      case "SERVICE":
        result = this.serviceRegistration(def);
        break;
      case "TEMPLATE":
        result = this.templateRegistration(def.url, def.content);
        break;
      case "PAGE":
        var pageTemplateUrl = def.templateUrl = `#_page_${def.name}`;
        var tagName = utils.shakeCase(def.name);
        var pageTemplate = `<${tagName}></${tagName}>`;
        // register page template and the page component
        result = this.templateRegistration(pageTemplateUrl, pageTemplate);
        result += this.componentRegistration(def);
        break;
      default:
        return '';
    }

    return result;
  }

  private getAreaByName(name:string, structure:structure.IProjectStructure):structure.IAreaDefinition {
    return structure.areas['find'](a => a.name === name);
  }

  private componentRegistration(component:structure.IProjectDefinition) {
    return this.registerByMethod('component', utils.stringifyClientJson(component));
  }

  private decoratorRegistration(component:structure.IProjectDefinition) {
    return this.registerByMethod('decorator', utils.stringifyClientJson(component));
  }

  private filterRegistration(component:structure.IProjectDefinition) {
    return this.registerByMethod('filter', utils.stringifyClientJson(component));
  }

  private serviceRegistration(component:structure.IProjectDefinition) {
    return this.registerByMethod('service', utils.stringifyClientJson(component));
  }

  private registerByMethod(methodName, componentJsonDef) {
    return 'jsp.' + methodName + '(' + componentJsonDef + ');';
  }

  private templateRegistration(url, content) {
    return 'jsp.template(\'' + url + '\',\'' + content + '\');\n';
  }
}
