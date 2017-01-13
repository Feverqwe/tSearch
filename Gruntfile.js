/**
 * Created by Anton on 13.01.2017.
 */
module.exports = function(grunt) {
    "use strict";
    var path = require('path');
    var webpack = require("webpack");

    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('grunt-contrib-clean');
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
        }
    });

    var ccTrimOptions = {
        language_in: 'ECMASCRIPT5_STRICT',
        compilation_level: 'WHITESPACE_ONLY',
        formatting: 'pretty_print'
    };

    var ccCompressOptions = {
        language_in: 'ECMASCRIPT5_STRICT'
    };

    var getProvidePlugin = function (options) {
        Object.keys(options).forEach(function (key) {
            options[key] = path.resolve(options[key]);
        });
        return new webpack.ProvidePlugin(options);
    };

    var getDefaultWpOptions = function () {
        return {
            // webpack options
            entry: "",
            output: {
                path: "<%= output %><%= vendor %>",
                filename: 'bundle.js'
            },
            node: {
                setImmediate: false,
                global: false
            },
            progress: false, // Don't show progress
            // Defaults to true
            plugins: []
        };
    };

    grunt.registerTask('build', function () {
        grunt.config.set('vendor', 'chrome/');

        var main = getDefaultWpOptions();
        main.entry = {
            bg: './src/js/bg.js',
            editor: './src/js/editor.js',
            history: './src/js/history.js',
            index: './src/js/index.js',
            magic: './src/js/magic.js',
            options: './src/js/options.js',
            popup: './src/js/popup.js'
        };
        main.output = {
            path: '<%= output %><%= vendor %>/js/',
            filename: "[name].js"
        };
        /*indexjs.exclude = [
            './lib/promise.min'
        ];*/
        main.resolve = {
            alias: {
                jquery: path.resolve('./src/js/lib/jquery-3.1.1.min'),
                jqueryUi: path.resolve('./src/js/lib/jquery-ui.min.js'),
            }
        };
        main.plugins.push(getProvidePlugin({
            Promise: './src/js/lib/promise.min',
            EventEmitter: './src/js/lib/EventEmitter.min',
            $: './src/js/lib/jquery-3.1.1.min',
            JSZip: './src/js/lib/jszip.min',
            moment: './src/js/lib/moment-with-locales.min',
            exKit: './src/js/module/exKit'
        }));

        grunt.config.merge({
            webpack: {
                main: main
            },
            'closure-compiler': {
                main: {
                    files: {
                        '<%= output %><%= vendor %>/js/bg.js': '<%= output %><%= vendor %>/js/bg.js',
                        '<%= output %><%= vendor %>/js/editor.js': '<%= output %><%= vendor %>/js/editor.js',
                        '<%= output %><%= vendor %>/js/history.js': '<%= output %><%= vendor %>/js/history.js',
                        '<%= output %><%= vendor %>/js/index.js': '<%= output %><%= vendor %>/js/index.js',
                        '<%= output %><%= vendor %>/js/magic.js': '<%= output %><%= vendor %>/js/magic.js',
                        '<%= output %><%= vendor %>/js/options.js': '<%= output %><%= vendor %>/js/options.js',
                        '<%= output %><%= vendor %>/js/popup.js': '<%= output %><%= vendor %>/js/popup.js'
                    },
                    options: ccCompressOptions
                }
            }
        });

        grunt.task.run([
            // 'clean:vendor',
            'webpack:main',
            'closure-compiler:main'
        ]);
    });

    grunt.registerTask('default', [
        'build'
    ]);
};