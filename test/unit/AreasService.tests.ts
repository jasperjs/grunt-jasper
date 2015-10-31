import config = require('../../lib/IJasperBuildConfig');
import f = require('./mocks/TestFileUtils');
import builder = require('../../lib/project/ProjectStructureBuilder');
import finder  = require('../../lib/IFinder');
import areas  = require('../../lib/IAreaService');

var areasSvc:areas.IAreaService, fUtils:f.TestFileUtils, projectStructureBuilder:builder.ProjectStructureBuilder ;

export function setUp(done:Function) {
  var buildConfig = new config.DefaultBuildConfig();
  buildConfig.appPath = 'test/testApp';

  fUtils = new f.TestFileUtils();
  var scriptsFinder = new finder.TypeScriptFinder(fUtils);
  var stylesFinder = new finder.CssFinder(fUtils);
  projectStructureBuilder = new builder.ProjectStructureBuilder(fUtils, buildConfig, scriptsFinder, stylesFinder)
  areasSvc = new areas.AreaService(fUtils);

  done();
}

export function testCreationInitFiles(test:nodeunit.Test) {
  areasSvc.buildAllAreas(projectStructureBuilder.buildStructure());

  test.ok(fUtils.isWritten('test\\testApp\\app\\boot\\_init.js'));
  test.ok(fUtils.isWritten('test\\testApp\\app\\core\\_init.js'));
  test.ok(fUtils.isWritten('test\\testApp\\app\\feature\\_init.js'));

  test.ok(fUtils.checkFileContains('test\\testApp\\app\\boot\\_init.js', `jsp.component({"ctrl":spa.boot.components.BootTag,"name":"featureTag","templateUrl":"test/testApp/app/boot/components/feature-tag/boot-tag.html"});`));
  test.ok(fUtils.checkFileContains('test\\testApp\\app\\boot\\_init.js', `jsp.ready(function(){ jsp.areas.initArea("boot", function() {`));

  test.ok(fUtils.checkFileContains('test\\testApp\\app\\core\\_init.js', `jsp.template('template','<p>custom template</p>')`));
  test.ok(fUtils.checkFileContains('test\\testApp\\app\\core\\_init.js', `jsp.component({"ctrl":spa.core.components.SiteHeader,"properties":["myAttr"],"events":["click"],"name":"siteHeader","templateUrl":"test/testApp/app/core/components/site-header/site-header.html"})`));
  test.ok(fUtils.checkFileContains('test\\testApp\\app\\core\\_init.js', `jsp.template('#_page_homePage','<home-page></home-page>')`));
  test.ok(fUtils.checkFileContains('test\\testApp\\app\\core\\_init.js', `jsp.decorator({"ctrl":spa.core.decorators.FocusOnDefault,"name":"focusOnDefault"})`));
  //
  test.ok(fUtils.checkFileContains('test\\testApp\\app\\feature\\_init.js', `jsp.filter({"name":"currency","ctrl":spa.feature.filters.Currency})`));

  test.done();
}
