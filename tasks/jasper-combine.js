'use strict';

module.exports = function (grunt) {

    var utils = require('./jasper-utils.js');

    grunt.registerTask('jasper-combine', 'Prepare concat config', function () {
        var areas = grunt.config('areas');

        var concatConf = grunt.config('concat') || {};
        var uglifyConf = grunt.config('uglify') || {};
        var cssMinConf = grunt.config('cssmin') || {};

        // Build bootstrap scripts first
        var bootstrapScripts = utils.getBootstrapScripts(grunt);

        var uglifyFiles = {};
        areas.forEach(function (area) {
            if (!area.bootstrap) {
                var dest = '<%= dist %>/scripts/' + area.name + '.js';
                var destMin = '<%= dist %>/scripts/' + area.name + '.min.js';
                concatConf[area.name] = {
                    src: area.__scripts,
                    dest: dest
                };

                uglifyFiles[destMin] = dest;

                //area.__contactPath = grunt.template.process(dest);
                //area.__minPath = grunt.template.process(destMin);
            } else {
                bootstrapScripts = bootstrapScripts.concat(area.__scripts);
            }
        });

        // constract base
        var baseDest = '<%= dist %>/scripts/_base.js';
        var baseMinDest = '<%= dist %>/scripts/_base.min.js';
        var stylesMinDest = '<%= dist %>/styles/all.min.css';
        concatConf['jasperbase'] = {
            src: bootstrapScripts,
            dest: baseDest
        }
        uglifyFiles[baseMinDest] = baseDest;

        uglifyConf.dest = {
            files: uglifyFiles
        }

        cssMinConf['release'] = {
            files: [{
                src: utils.getAppStyles(grunt),
                dest: stylesMinDest,
                ext: '.min.css'
            }]
        }

        grunt.config('uglify', uglifyConf);
        grunt.config('concat', concatConf);
        grunt.config('areas', areas);
        grunt.config('cssmin', cssMinConf);

        grunt.task.run(['concat', 'uglify', 'cssmin']);
    });

};
