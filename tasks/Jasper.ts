import build = require('jasper-build');

function gruntJasper(grunt: IGrunt) {
  grunt.registerMultiTask('jasper', 'Build jasper application', function () {
    var options = this.options(build.BuildManager.createDefaultConfig());
    var buildManager = new build.BuildManager(options);
    if(!options.package){
      buildManager.buildProject();
    }else{
      buildManager.packageProject();
    }

  });
}

export = gruntJasper;
