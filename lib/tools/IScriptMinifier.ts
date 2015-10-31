import UglifyJS = require("uglify-js");
import files = require('../IFileUtils');

export interface IScriptMinifier{
  /**
   * Minify @sourceFiles to @outputFile
   */
  minify(source: string, outputFile: string);
}

export class UglifyJsMinifier implements IScriptMinifier{

  constructor(private fileUtils: files.IFileUtils){

  }

  minify(source: string, outputFile: string){
    var result = UglifyJS.minify(source,  {fromString: true});
    this.fileUtils.writeFile(outputFile, result.code);
  }

}
