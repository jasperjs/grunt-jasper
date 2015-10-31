import config = require('../../lib/IJasperBuildConfig');
import f = require('../../lib/IFileUtils');

var utils: f.IFileUtils;

export function setUp(done: Function) {
  utils = new f.DefaultFileUtils();
  done();
}

export function testFilesExpand(test: nodeunit.Test){
  var result = utils.expand('test/testApp/*.html');
  test.equals(result.length, 1);
  test.equals(result[0], 'test/testApp/index.html');

  result = utils.expand('test/testApp/**/debug.json');
  test.equals(result.length, 1);
  test.equals(result[0], 'test/testApp/config/debug.json');

  test.done();
}

export function testReadFile(test: nodeunit.Test){
  var content = utils.readFile('test/testApp/config/debug.json');
  test.ok(content.length > 0);
  test.done();
}

export function testReadJSON(test: nodeunit.Test){
  var result = utils.readJSON<any>('test/testApp/config/debug.json');
  test.equals(result.stringValue, "test string");
  test.done();
}

export function testFileExist(test: nodeunit.Test){
  var result = utils.fileExists('test/testApp/config/debug.json');
  test.ok(result);
  test.done();
}
