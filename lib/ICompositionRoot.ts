import finder = require('./IFinder');
import cssmin = require('./tools/ICssMinifier');
import min = require('./tools/IScriptMinifier');
import file = require('./IFileUtils');

import log = require('./ILogger');

export interface ICompositionRoot{

  scriptsMinifier: min.IScriptMinifier;
  cssMinifier: cssmin.ICssMinifier;

  stylesFinder: finder.IFinder;
  scriptsFinder: finder.IFinder;

  fileUtils: file.IFileUtils;

  logger: log.ILogger;
}

export class JasperCompositionRoot implements ICompositionRoot {

  fileUtils: file.IFileUtils = new file.DefaultFileUtils();

  scriptsMinifier: min.IScriptMinifier = new min.UglifyJsMinifier(this.fileUtils);
  cssMinifier: cssmin.ICssMinifier = new cssmin.CleanCssMinifier(this.fileUtils);

  stylesFinder: finder.IFinder = new finder.CssFinder(this.fileUtils);
  scriptsFinder: finder.IFinder = new finder.TypeScriptFinder(this.fileUtils);

  logger: log.ILogger = new log.DefaultLogger();
}
