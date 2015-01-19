'use strict';

module.exports = function (grunt) {

    var utils = require('./jasper-utils.js');

    grunt.registerTask('jasper-patch-page', 'Modify single page content, replace existing script and styles tags', function () {
        var jasperConfig = utils.getJasperConfig(grunt);
        if (!jasperConfig.singlePage) return;

        var isPackageBuild = grunt.config('package');

        var pageContent = grunt.file.read(jasperConfig.singlePage);

        /* patch scripts */
        var scripts = [];
        if (isPackageBuild) {
            scripts.push('scripts/_base.min.js');
        } else {
            scripts = utils.getBootstrapScripts(grunt);
        }

        var scriptsHtml = '';
        for (var i = 0; i < scripts.length; i++) {
            scriptsHtml += '\t<script src="' + scripts[i] + '"></script>\r\n';
        }
        var scriptsRegex = /<!-- SCRIPTS -->([\s\S]*)<!-- \/SCRIPTS -->/gim;
        pageContent = pageContent.replace(scriptsRegex, '<!-- SCRIPTS -->\r\n\r\n' + scriptsHtml + '\r\n\t<!-- /SCRIPTS -->');

        /* patch css */
        var styles = [];
        if (isPackageBuild) {
            styles.push('styles/all.min.css');
        } else {
            styles = utils.getAppStyles(grunt);
        }

        var stylesHtml = '';
        for (var i = 0; i < styles.length; i++) {
            stylesHtml += '\t<link rel="stylesheet" href="' + styles[i] + '"/>\r\n';
        }
        var stylesRegex = /<!-- STYLES -->([\s\S]*)<!-- \/STYLES -->/gim;
        pageContent = pageContent.replace(stylesRegex, '<!-- STYLES -->\r\n\r\n' + stylesHtml + '\r\n\t<!-- /STYLES -->');

        var pageToSave = isPackageBuild ? grunt.template.process('<%= dist %>/index.html') : jasperConfig.singlePage;

        utils.writeContent(grunt, pageToSave, pageContent);
    });

};
