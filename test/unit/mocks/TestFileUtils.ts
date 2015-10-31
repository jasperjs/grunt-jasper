import f = require('../../../lib/IFileUtils');

export class TestFileUtils extends f.DefaultFileUtils {
  // virtual files
  private files = [];


  writeFile(filename:string, data:string) {
    this.files[filename] = data;
  }

  isWritten(filename:string):boolean {
    return !!this.files[filename];
  }

  readFile(filename:string): string{
    var content = this.files[filename];
    if(!content){
      return super.readFile(filename);
    }
    return content;
  }

  checkFileContains(filename:string, content:string):boolean {
    if (!this.isWritten(filename)) {
      throw `File "${filename}" does not contain "${content}" part. File does not exist.`
    }
    var contains =  this.files[filename].indexOf(content) >= 0;
    if(!contains){
      throw `File "${filename}" does not contain "${content}" part. File content: "${this.files[filename]}"`;
    }
    return true;
  }

}
