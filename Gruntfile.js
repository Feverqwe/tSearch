/**
 * Created by Anton on 13.01.2017.
 */
module.exports = function(grunt) {
    "use strict";
    var path = require('path');

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    require('google-closure-compiler').grunt(grunt);

    grunt.initConfig({
        output: 'output/',
        vendor: '/',
        clean: {
            vendor: [
                '<%= output %><%= vendor %>*'
            ],
            output: [
                '<%= output %>*'
            ]
        },
        copy: {
            main: {
                cwd: 'src/',
                expand: true,
                src: [
                    '**'
                ],
                dest: '<%= output %><%= vendor %>'
            }
        }
    });

    var ccCompressOptions = {
        language_in: 'ECMASCRIPT5_STRICT'
    };

    grunt.registerTask('build', function () {
        grunt.config.set('vendor', 'chrome/');

        var files = grunt.file.expand({
            cwd: 'src/'
        }, ["./js/*.js", "./js/module/*.js"]).map(function (path) {
            var fullPath = '<%= output %><%= vendor %>' + path;
            var obj = {};
            obj[fullPath] = fullPath;
            return obj;
        });

        grunt.config.merge({
            'closure-compiler': {
                main: {
                    files: files,
                    options: ccCompressOptions
                }
            }
        });

        grunt.task.run([
            'clean:vendor',
            'copy:main',
            'closure-compiler:main'
        ]);
    });

    grunt.registerTask('default', [
        'build'
    ]);
};