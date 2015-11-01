import file = require('./IFileUtils');
import utils = require('./Utils');
import path = require('path');

export class SinglePagePatch {

  constructor(private fileUtils:file.IFileUtils) {

  }

  applyPatch(singlePagePath:string, baseHref: string, scripts:string[], styles:string[]) {

    var pageContent = this.fileUtils.readFile(singlePagePath);

    var scriptsHtml = '';
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i]) {
        var scriptPath = path.join(baseHref, scripts[i]);
        scriptsHtml += `\t<script src="${utils.convertPathClient(scriptPath)}"></script>\r\n`;
      }
    }

    var scriptsRegex = /<!-- SCRIPTS -->([\s\S]*)<!-- \/SCRIPTS -->/gim;
    pageContent = pageContent.replace(scriptsRegex, '<!-- SCRIPTS -->\r\n\r\n' + scriptsHtml + '\r\n\t<!-- /SCRIPTS -->');

    var stylesHtml = '';
    for (var i = 0; i < styles.length; i++) {
      var stylePath = path.join(baseHref, styles[i] );
      stylesHtml += `\t<link rel="stylesheet" href="${utils.convertPathClient(stylePath)}"/>\r\n`;
    }
    var stylesRegex = /<!-- STYLES -->([\s\S]*)<!-- \/STYLES -->/gim;
    pageContent = pageContent.replace(stylesRegex, '<!-- STYLES -->\r\n\r\n' + stylesHtml + '\r\n\t<!-- /STYLES -->');

    return pageContent;
  }

}
