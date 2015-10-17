import f = require('./IFileUtils');
import path = require('path');

export interface IFinder {

  /**
   * Find all files in folder
   * @param folderpath    folder to search
   */
  find(folderpath:string): string[];

  /**
   * Find all files in folder includes all subfolders
   * @param folderpath    folder to search
   */
  findRecursive(folderpath:string): string[];

}

export class TypeScriptFinder implements IFinder {

  constructor(private fileUtils:f.IFileUtils) {

  }

  find(folderpath:string):string[] {
    return this.findInternal(folderpath, '*.ts');

  }

  findRecursive(folderpath:string):string[] {
    return this.findInternal(folderpath, '**/*.ts');
  }

  private findInternal(folderpath:string, mask:string):string[] {
    var tsScripts = this.fileUtils.expand(path.join(folderpath, mask));
    var jsScripts = [];

    for (var i = tsScripts.length - 1; i >= 0; i--) {
      var jsScript = tsScripts[i].replace(/\.ts$/, '.js');
      if (this.fileUtils.fileExists(jsScript)) {
        jsScripts.push(jsScript);
      }
    }

    return jsScripts;
  }

}

export class JavaScriptFinder implements IFinder {

  constructor(private fileUtils:f.IFileUtils) {

  }

  find(folderpath:string):string[] {
    return this.findInternal(folderpath, '*.js');

  }

  findRecursive(folderpath:string):string[] {
    return this.findInternal(folderpath, '**/*.js');
  }

  private findInternal(folderpath:string, mask:string):string[] {
    return this.fileUtils.expand(path.join(folderpath, mask));
  }

}

export class CssFinder implements IFinder {

  constructor(private fileUtils:f.IFileUtils) {

  }

  find(folderpath:string):string[] {
    return this.findInternal(folderpath, '*.css');
  }

  findRecursive(folderpath:string):string[] {
    return this.findInternal(folderpath, '**/*.css');
  }

  private findInternal(folderpath:string, mask:string):string[] {
    return this.fileUtils.expand(path.join(folderpath, mask));
  }

}
