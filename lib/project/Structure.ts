export interface IProjectDefinition {
  name: string;
  jDebug?: IJDebugInfo;

  ctrl?: string;
  ctor?: string;

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
