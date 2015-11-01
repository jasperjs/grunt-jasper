import utils = require('../Utils');

export interface IProjectDefinition {
  name: string;
  jDebug?: IJDebugInfo;

  ctrl?: string;
  ctor?: string;

  area?: string;

  attributes?: string;
  properties?: string|string[];
  events?: string|string[];

  template?: string;
  templateUrl?: string;
  templateFile?: string;

  route: string;

  eval?: boolean;

  content?: string;
  url?: string;

  __type: string;

}


/**
 * Definition of area in the project
 */
export interface IAreaDefinition{
  /**
   * Name of the area
   */
  name: string;

  /**
   * Name of dependent areas
   */
  dependencies: string[];

  /**
   * External scripts required for area
   */
  scripts: string[];

  /* private fields (do not passes to the client) */

  /**
   * Definitions of the area
   */
  __definitions?: IProjectDefinition[];

  __path: string;

  /**
   * Array of area styles
   */
  __styles: string[];
}

/**
 *  Structure of the project
 */
export interface IProjectStructure {
  /**
   * Areas list
   */
  areas: IAreaDefinition[];

  routes: RoutesConfig;

  values: ValuesConfig;

  cssTargets: ICssTarget[];
}

export interface ICssTarget{
  files: string[];
  filename: string;
}

export interface IJDebugInfo{
  /**
   * Path to the folder
   */
  folder: string;
  /**
   * All scripts files in definition folder
   */
  scripts: string[];
  /**
   * All styles files in definition folder
   */
  styles: string[];
}


export class AreasClientOptions {
  [name: string]: any;

  toClientConfigScript():string {
    var clientConfig = JSON.stringify(this);

    return `angular.module("jasperAreasConfig", ["jasperAreas"])
  .value("$jasperAreasConfig", ${clientConfig})
  .run(['jasperAreasService', '$jasperAreasConfig', function (jasperAreasService, $jasperAreasConfig) {
    jasperAreasService.configure($jasperAreasConfig);
}]);`;
  }

  addArea(name: string, dependencies: string[], scripts: string[]){
    var def = new AreaClientDefinition();
    def.dependencies = dependencies;
    def.scripts = scripts;
    this[name]  = def;
  }

  static createFromProject(structure:IProjectStructure):AreasClientOptions {
    var options = new AreasClientOptions();

    structure.areas.forEach(area => {
      var clientDef = new AreaClientDefinition();
      clientDef.dependencies = area.dependencies;
      clientDef.scripts = area.scripts;
      options[area.name] = clientDef;
    });

    return options;
  }

}

export class AreaClientDefinition {
  dependencies:string[];
  scripts:string[];
}

// ROUTES

export class RoutesConfig {
  defaultRoutePath: string;

  pages: IProjectDefinition[];

  toClientConfigScript(): string{
    var config = {};
    this.pages.forEach(page=>{
      config[page.route] = page;
      delete page.__type;
    });
    return `angular.module('jasperRouteConfig',['jasper'])
      .config(['jasperRouteProvider', function(jasperRouteTable) {
        jasperRouteTable.setup({"defaultRoutePath":"${this.defaultRoutePath}","routes": ${JSON.stringify(config)}});
      }]);`
  }
}

//VALUES
export class ValuesConfig {
  defaultRoutePath: string;

  values: KeyValuePair[] = [];

  toClientConfigScript(): string{
    var registrationScript = '';

    this.values.forEach(pair => {
      registrationScript += `v.register("${pair.key}", ${JSON.stringify(pair.value)});`
    });

    return `angular.module("jasperValuesConfig",["jasper"])
      .config(["jasperConstantProvider", function(v){${registrationScript}}]);`;
  }
}

export class KeyValuePair{
  constructor(public key: string, public value: any){

  }

}
