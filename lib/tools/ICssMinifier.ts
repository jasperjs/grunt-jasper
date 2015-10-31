import CleanCss = require('clean-css');
import files = require('../IFileUtils');


export  interface ICssMinifier {

  minifyCss(sourceFiles: string[], outputFile: string);

}

export class CleanCssMinifier implements ICssMinifier{

  constructor(private fileUtils: files.IFileUtils) { }

  minifyCss(sourceFiles: string[], outputFile: string){
    var content = this.fileUtils.concat(sourceFiles);
    var minified = new CleanCss().minify(content).styles;
    this.fileUtils.writeFile(outputFile, minified);
  }

}
