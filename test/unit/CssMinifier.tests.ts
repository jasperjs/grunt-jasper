import f = require('./mocks/TestFileUtils');
import css = require('../../lib/tools/ICssMinifier');
import config = require('../../lib/IJasperBuildConfig');

var fUtils:f.TestFileUtils, minifier:css.CleanCssMinifier;

export function setUp(done:Function) {
  fUtils = new f.TestFileUtils();
  minifier = new css.CleanCssMinifier(fUtils);

  done();
}

export function testCorrentCssMinification(test:nodeunit.Test) {
  minifier.minifyCss(['test/testApp/base.css', 'test/testApp/bootstrap.css'], 'min.css');

  var minified = fUtils.readFile('min.css');
  test.equal(minified, 'p{color:#00f;bootstrap-css:true}');
  test.done();
}
