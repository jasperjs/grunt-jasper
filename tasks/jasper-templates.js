'use strict';
var JasperTemplates = function () {

  this.componentRegistration = function (component) {
    return this.registerByMethod('component', this.getDefinitionString(component));
  };

  this.decoratorRegistration = function (component) {
    return this.registerByMethod('decorator', this.getDefinitionString(component));
  };

  this.filterRegistration = function (component) {
    return this.registerByMethod('filter', this.getDefinitionString(component));
  };

  this.serviceRegistration = function (component) {
    return this.registerByMethod('service', this.getDefinitionString(component));
  };

  this.templateRegistration = function(url, content){
    return 'jsp.template(\'' + url + '\',\'' + content + '\');\n';
  };

  this.registerByMethod = function(methodName, componentJsonDef){
    return 'jsp.' + methodName + '(' + componentJsonDef + ');';
  };

  this.areasConfigScript = function (areasConfig) {
      return 'angular.module("jasperAreasConfig",["jasperAreas"]).value("$jasperAreasConfig",' + JSON.stringify(areasConfig) + ").run(['jasperAreasService', '$jasperAreasConfig', function(jasperAreasService, $jasperAreasConfig) { jasperAreasService.configure($jasperAreasConfig); }]);";
  };

  this.routesConfigScript = function(routesConfig) {
    return 'angular.module("jasperRouteConfig",[ "jasper" ]).config(["jasperRouteProvider", function(jasperRouteTable){ jasperRouteTable.setup( ' + JSON.stringify(routesConfig) + ' ); }]);';
  };

  this.valuesConfigScript = function(valuesConfig){
    var registrationScript = '';

    for(var propName in valuesConfig){
      registrationScript += 'v.register(\"' + propName + '\", ' + JSON.stringify(valuesConfig[propName]) + ');'
    }

    return 'angular.module("jasperValuesConfig",[ "jasper" ]).config(["jasperConstantProvider", function(v){ ' + registrationScript + '  }]);';
  };

  // custom format to javascript to pass ctrl object instrad of string
  this.getDefinitionString = function(component){
    var jsonDef = '{', delimeter = '';
    for(var prop in component){
      if(component.hasOwnProperty(prop)){
        var val = component[prop];
        if(prop === 'ctor' || prop ==='ctrl'){
          jsonDef += delimeter + '\"' + prop + '\"' + ':' + val + '';
        }else{
          jsonDef += delimeter + '\"' + prop + '\"' + ':' + JSON.stringify(val);
        }
        delimeter = ',';
      }
    }
    jsonDef +='}';
    return jsonDef;
  };

};

module.exports = new JasperTemplates();
