import cleanCss = require('clean-css');


export  interface ICssMinifier {

  minifyCss(sourceFiles: string[], outputFile: string[]);

}

export class CleanCssMinifier implements ICssMinifier{

  minifyCss(sourceFiles: string[], outputFile: string[]){

  }

}
