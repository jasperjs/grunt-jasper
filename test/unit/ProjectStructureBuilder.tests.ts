import config = require('../../lib/IJasperBuildConfig');
import f = require('../../lib/IFileUtils');
import builder = require('../../lib/project/ProjectStructureBuilder');
import finder  = require('../../lib/IFinder');

var projectStructureBuilder:builder.IProjectStructureBuilder;

export function setUp(done:Function) {
  var buildConfig = new config.DefaultBuildConfig();
  buildConfig.appPath = 'test/testApp';
  buildConfig.values = 'test/testApp/config/debug.json';

  var utils = new f.DefaultFileUtils();
  var scriptsFinder = new finder.TypeScriptFinder(utils);
  var stylesFinder = new finder.CssFinder(utils);
  projectStructureBuilder = new builder.ProjectStructureBuilder(utils, buildConfig, scriptsFinder, stylesFinder)

  done();
}

export function testStructure(test:nodeunit.Test) {
  var projectStructure = projectStructureBuilder.buildStructure();
  test.equals(projectStructure.areas.length, 3);
  //routes
  test.equals(projectStructure.routes.defaultRoutePath, '/');
  test.equals(projectStructure.routes.pages.length, 1);

  test.equals(projectStructure.routes.pages[0].area, 'core');
  test.equals(projectStructure.routes.pages[0].name, 'homePage');

  // values
  test.ok(projectStructure.values);

  test.equals(projectStructure.values.values.length, 4);
  test.equals(projectStructure.values.values[0].key, 'arrayValue');
  test.equals(projectStructure.values.values[1].key, 'numberValue');
  test.equals(projectStructure.values.values[2].key, 'stringValue');
  test.equals(projectStructure.values.values[3].key, 'objectValue');

  test.deepEqual(projectStructure.values.values[0].value, [{"prop1": "test"}, {"prop2": "test 2"}]);
  test.equals(projectStructure.values.values[1].value, 200);
  test.equals(projectStructure.values.values[2].value, "test string");
  test.deepEqual(projectStructure.values.values[3].value, {"title": "test"});

  test.done();

}
