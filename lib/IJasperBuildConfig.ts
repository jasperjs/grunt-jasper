
declare var process: any;

export interface IJasperBuildConfig {
  cwd: string;
  /**
   * Is package build?
   */
  package: boolean;

  packageOutput: string;

  singlePage: string;

  /**
   * Name of the build process
   */
  buildName: string;

  appPath: string;

  defaultRoutePath: string;

  baseScripts: string[];
  baseCss: string[]|Object;

  baseHref: string;

  /**
   * path to bootstrap file
   */
  startup: string;

  /**
   * Include MD5 hash of file content after package
   */
  fileVersion: boolean;

  /**
   * Path to client values JSON config file
   */
  values: string;

  jDebugEnabled: boolean; //false,
  jDebugSrc: string; // 'node_modules/jdebug/lib/jdebug.js',
  jDebugStylePath: string; // 'node_modules/jdebug/lib/jdebug.css'
}

/**
 * Default build options
 */
export class DefaultBuildConfig implements IJasperBuildConfig {

  cwd: string = process.cwd();

  /**
   * Is package build?
   */
  package: boolean = false;

  packageOutput: string = 'dist';

  singlePage: string = 'index.html';

  baseHref: string = '';

  values: string = null;

  /**
   * Name of the build process
   */
  buildName: string;

  appPath: string = 'app';

  defaultRoutePath: string = '/';

  baseScripts: string[] = [];
  baseCss: string[]|Object = [];

  /**
   * path to bootstrap file
   */
  startup: string = 'app/bootstrap.js';
  fileVersion: boolean = true;

  jDebugEnabled: boolean = false; //false,
  jDebugSrc: string = 'node_modules/jdebug/lib/jdebug.js';
  jDebugStylePath: string = 'node_modules/jdebug/lib/jdebug.css';

  static extend(config: IJasperBuildConfig): IJasperBuildConfig{
    var source = new DefaultBuildConfig();
    for (var prop in config) {
      if(config.hasOwnProperty(prop)){
        source[prop] = config[prop];
      }
    }
    return source;
  }

}
