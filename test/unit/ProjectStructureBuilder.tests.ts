import config = require('../../lib/IJasperBuildConfig');
import f = require('../../lib/IFileUtils');
import builder = require('../../lib/project/ProjectStructureBuilder');
import finder  = require('../../lib/IFinder');

var projectStructureBuilder: builder.IProjectStructureBuilder;

export function setUp(done: Function) {
  var buildConfig = new config.DefaultBuildConfig();
  buildConfig.appPath = 'test/testApp';

  var utils = new f.DefaultFileUtils(buildConfig);
  var scriptsFinder = new finder.TypeScriptFinder(utils);
  var stylesFinder = new finder.CssFinder(utils);
  projectStructureBuilder = new builder.ProjectStructureBuilder(utils, buildConfig, scriptsFinder,stylesFinder)

  done();
}

export function testStructure(test: nodeunit.Test){
  var projectStructure = projectStructureBuilder.buildStructure();
  test.equals(projectStructure.areas.length, 3);

  test.done();
}
