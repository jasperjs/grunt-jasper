'use strict';

var JasperTemplates = function () {

  this.componentRegistration = function (component) {
    return this.registerByMethod('component', component);
  };

  this.decoratorRegistration = function (component) {
    return this.registerByMethod('decorator', component);
  };

  this.filterRegistration = function (component) {
    return this.registerByMethod('filter', component);
  };

  this.serviceRegistration = function (component) {
    return this.registerByMethod('service', component);
  };

  this.templateRegistration = function(url, content){
    return 'jsp.template(\'' + url + '\',\'' + content + '\');\n';
  };

  this.registerByMethod = function(methodName, component){
    return 'jsp.' + methodName + '(' + JSON.stringify(component) + ');';
  }

  this.areasConfigScript = function (areasConfig) {
      return 'angular.module("jasperAreasConfig",["jasperAreas"]).value("$jasperAreasConfig",' + JSON.stringify(areasConfig) + ").run(['jasperAreasService', '$jasperAreasConfig', function(jasperAreasService, $jasperAreasConfig) { jasperAreasService.configure($jasperAreasConfig); }]);";
  }

  this.routesConfigScript = function(routesConfig) {
    return 'angular.module("jasperRouteConfig",[ "jasper" ]).config(["jasperRouteProvider", function(jasperRouteTable){ jasperRouteTable.setup( ' + JSON.stringify(routesConfig) + ' ); }]);';
  }

};

module.exports = new JasperTemplates();
