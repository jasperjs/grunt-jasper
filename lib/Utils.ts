import fs = require('fs');
import path = require('path');
import structure = require('./project/Structure');
class Utils {

  /**
   * component-name --> componentName
   */
  camelCaseTagName(tagName:string):string {
    if (tagName.indexOf('-') < 0) {
      return this.camelCase(tagName);
    }

    return tagName.replace(/\-(\w)/g, function (match, letter) {
      return letter.toUpperCase();
    });
  }

  /**
   * ComponentName --> componentName
   */
  camelCase(name:string):string {
    var regex = /[A-Z]/g;
    return name.replace(regex, function (letter, pos) {
      return pos ? letter : letter.toLowerCase();
    });
  }

  /**
   *  C:\folder\file.exe --> folder
   */
  getParentFolderName(filepath:string):string {
    var path = this.convertPathClient(this.getPath(filepath));
    return path.match(/([^\/]*)\/*$/)[1];
  }

  /**
   *  C:\folder\file.exe --> C:\folder\
   */
  getPath(filepath:string):string {
    return path.dirname(filepath);
  }

  getFileExtension(filepath:string):string {
    return path.extname(filepath);
  }

  convertPathClient(filepath:string):string {
    var path = filepath.replace(/\\/g, '/');
    return path;
  }

  log(message:string) {
    console.log('grunt-jasper:', message);
  }

  getDirPath(filepath:string) {
    return path.dirname(filepath);
  }

  getFilename(filepath:string):string {
    return path.basename(filepath);
  }

  isArray(arr:any) {
    if (Array.isArray) {
      return Array.isArray(arr);
    } else {
      return arr instanceof Array;
    }
  }

  escapeContent(content) {
    var quotRegexp = /\'/g;
    var breaklineRegexp = /(?:\r\n|\r|\n)/g;
    var first = content.replace(/\\/g, '\\\\').replace(quotRegexp, '\\\'').replace(breaklineRegexp, ' ');
    return first;
  }

  minifyHtml(source) {
    // remove unnecessary spaces:
    var result = source.replace(/(^\s*)/gm, '');
    // remove html comments:
    result = result.replace(/<!--([\s,\S]+?)-->/g, '').trim();
    return this.escapeContent(result);
  }

  splitStringBySpace(props) {
    if (typeof (props) === 'string') {
      return props.split(' ').map(function (item) {
        var i = item.trim();
        return i ? i : null;
      }).filter(function (i) {
        return i;
      });
    }
    return props;
  }

  /**
   * Split attributes definition string by object for jasper client library usage
   * @param attrs                     string that represents attributes
   * @returns {name: '', type: ''}    collection of attributes
   */
  getJasperAttributes(attrs) {
    if (typeof (attrs) === 'string') {
      var resultAttrs = [];

      var attrsParts = attrs.split(' ');
      attrsParts.forEach(function (part) {
        var indx = part.indexOf(':');
        if (indx > -1) {
          // attr type specified
          var attrName = part.substring(0, indx);
          var attrType = part.substring(indx + 1, part.length);
          resultAttrs.push({name: attrName, type: attrType});
        } else {
          resultAttrs.push({name: part});
        }
      });

      return resultAttrs;
    }
    return attrs;
  }

  shakeCase(name) {
    var SNAKE_CASE_REGEXP = /[A-Z]/g;
    var separator = '-';
    return name.replace(SNAKE_CASE_REGEXP, function (letter, pos) {
      return (pos ? separator : '') + letter.toLowerCase();
    });
  }


  stringifyClientJson(def:structure.IProjectDefinition):string {
    // custom format to javascript to pass ctrl object instead of string
    var jsonDef = '{', delimeter = '';
    for (var prop in def) {
      if (prop.indexOf('__') === 0) continue; //private property
      if (def.hasOwnProperty(prop)) {
        var val = def[prop];
        if (prop === 'ctor' || prop === 'ctrl') {
          jsonDef += delimeter + '\"' + prop + '\"' + ':' + val + '';
        } else {
          jsonDef += delimeter + '\"' + prop + '\"' + ':' + JSON.stringify(val);
        }
        delimeter = ',';
      }
    }
    jsonDef += '}';
    return jsonDef;
  }

}

export =
new Utils();
