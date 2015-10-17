import fs = require('fs');
import glob = require('glob');
import config = require('./IJasperBuildConfig');

export interface IFileUtils {

  readJSON<T>(filename:string): T;

  writeJSON(filename:string, data:any);

  readFile(filename:string): string;

  writeFile(filename:string, data:string);

  fileExists(filename:string): boolean;

  expand(pattern: string): string[];
}

export class DefaultFileUtils implements IFileUtils {

  constructor(private config: config.IJasperBuildConfig){

  }

  readJSON<T>(filename:string):T {
    var content = this.readFile(filename);
    if (!content) {
      return null;
    }
    return JSON.parse(content);
  }

  writeJSON(filename:string, data:any) {
    var content = JSON.stringify(data, null, 4);
    this.writeFile(filename, content);
  }

  readFile(filename:string):string {
    var content = fs.readFileSync(filename, {encoding: 'utf8'});
    content = content.replace(/^\uFEFF/, ''); //remove BOM
    return content;
  }

  writeFile(filename:string, data:string) {
    return fs.writeFileSync(filename, data, {encoding: 'utf8'});
  }

  fileExists(filename:string):boolean {
    try {
      return fs.statSync(filename).isFile();
    }
    catch (err) {
      return false;
    }
  }

  expand(pattern: string): string[]{
     return glob.sync(pattern, { cwd: this.config.cwd });
  }

}
