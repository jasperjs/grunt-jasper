var build = require('../../lib/BuildManager');
var config = require('../../lib/IJasperBuildConfig');
var file = require('../../lib/IFileUtils');
var path = require('path');
var fileUtils = new file.DefaultFileUtils();
var buildConfig = new config.DefaultBuildConfig();
buildConfig.appPath = 'test/testApp';
buildConfig.values = 'test/testApp/config/debug.json';
buildConfig.packageOutput = 'test/testApp/dist';
buildConfig.baseScripts = ['test/testApp/vendor/jquery.js', 'test/testApp/vendor/angular.js'];
buildConfig.startup = 'test/testApp/app/bootstrap.js';
buildConfig.baseHref = '/rootpath/';
buildConfig.baseCss = {
    'bootstrap.min.css': [
        'test/testApp/bootstrap.css'
    ],
    'all.min.css': [
        'test/testApp/base.css'
    ]
};
var buildManager = new build.BuildManager(buildConfig);
buildManager.packageProject();
function setUp(done) {
    done();
}
exports.setUp = setUp;
function testStylesCreation(test) {
    test.ok(fileExists('styles/bootstrap.min.css'));
    test.ok(fileExists('styles/all.min.css'));
    expectFileContent(test, 'styles/bootstrap.min.css', 'bootstrap-css:true');
    expectFileContent(test, 'styles/all.min.css', 'p{color:red}.b-site-header{font-size:18px;color:green}');
    test.done();
}
exports.testStylesCreation = testStylesCreation;
function testScriptsCreation(test) {
    var scripts = [
        '_base.*.min.js',
        '_startup.*.min.js',
        'boot.*.min.js',
        'core.*.min.js',
        'feature.*.min.js',
    ];
    scripts.forEach(function (script) {
        test.ok(fileExistsGlob('scripts/' + script));
    });
    test.done();
}
exports.testScriptsCreation = testScriptsCreation;
function testCorrectScriptCreation(test) {
    var baseContent = readFileGlob('scripts/_base.*.min.js');
    expectContent(test, baseContent, "console.log(\"jquery\"),console.log(\"angular\");");
    test.done();
}
exports.testCorrectScriptCreation = testCorrectScriptCreation;
function testCorrectStartupScript(test) {
    var content = readFileGlob('scripts/_startup.*.min.js');
    var configObject = parseAreasConfig(content);
    test.ok(configObject.core);
    test.ok(configObject.feature);
    test.ok(configObject.boot);
    // test external scripts:
    test.ok(configObject.core.scripts.length === 3, 'Core area must contains 3 scripts after package: 1 area script and 2 external scripts');
    test.ok(configObject.core.scripts[0] === 'http://another.path/to/external/script.js', 'Core area must contains external script');
    test.ok(configObject.core.scripts[1] === '//path/to/external/script.js', 'Core area must contains external script');
    test.ok(configObject.core.scripts[2].indexOf('/rootpath/scripts/core.') === 0, 'Core area must contains area script');
    test.deepEqual(configObject.boot.dependencies, []);
    test.ok(configObject.boot.scripts[0].indexOf('/rootpath/scripts/boot.') === 0);
    test.deepEqual(configObject.feature.dependencies, ['core']);
    test.ok(configObject.feature.scripts[0].indexOf('/rootpath/scripts/feature.') === 0);
    //ensure that bootstrap file appends to the end
    test.ok(/angular\.bootstrap\(document,"app"\);$/.test(content), 'bootstrap script must be referenced at the end of _startup script');
    //ensure that routes config is references in _startup
    test.ok(/angular\.module\("jasperRouteConfig",\["jasper"\]\)/.test(content), 'routes config must be referenced in _startup file');
    test.done();
}
exports.testCorrectStartupScript = testCorrectStartupScript;
function testHtmlCommentRemoving(test) {
    var coreFileContent = readFileGlob('scripts/core.*.min.js');
    test.ok(coreFileContent.indexOf('<!-- $$test comment$$ -->') < 0);
    test.done();
}
exports.testHtmlCommentRemoving = testHtmlCommentRemoving;
function fileExists(filename) {
    return fileUtils.fileExists(path.join('test/testApp/dist', filename));
}
function fileExistsGlob(mask) {
    mask = path.join('test/testApp/dist', mask);
    var files = fileUtils.expand(mask);
    return files.length === 1;
}
function readFileGlob(mask) {
    mask = path.join('test/testApp/dist', mask);
    var files = fileUtils.expand(mask);
    return fileUtils.readFile(files[0]);
}
function expectFileContent(test, filename, content) {
    var filepath = path.join('test/testApp/dist', filename);
    var fileContent = fileUtils.readFile(filepath);
    return test.ok(fileContent.indexOf(content) >= 0, "File content '" + content + "' not found in file '" + filepath + "'");
}
function expectContent(test, allContent, content) {
    return test.ok(allContent.indexOf(content) >= 0, "Content part '" + content + "' not found in '" + allContent + "'");
}
function parseAreasConfig(content) {
    var findConfigRegex = /value\("\$jasperAreasConfig",(.+)\)\s*\.run/g;
    var match = findConfigRegex.exec(content);
    eval("global.foo = " + match[1]);
    return global['foo'];
}
