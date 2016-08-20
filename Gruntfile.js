module.exports = function (grunt) {
    "use strict";
    var devMode = false;
    var baseDataList = [
        '_locales/**',
        'css/**',
        'img/**',
        'lib/**',
        'index.html',
        'popup.html',
        'history.html',
        'options.html',
        'magic.html'
    ];
    var dataJsList = [
        'mono.js',
        'explore.js',
        'exKit.js',
        'history.js',
        'notifer.js',
        'options.js',
        'popup.js',
        'profileManager.js',
        'rate.js',
        'selectBox.js',
        'view.js',
        'magic.js'
    ];
    var engineJsList = [
        'engine.js',
        'counter.js'
    ];
    var bgJsList = [
        'bg.js'
    ];
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            output: [
                '<%= output %>/*',
                '!<%= output %>/hash'
            ]
        },
        concat: {
            options: {
                separator: '\n'
            },
            engine: {
                files: {
                    '<%= output %><%= vendor %><%= dataJsFolder %>engine.js': engineJsList.map(function(item) {
                        return 'src/js/' + item;
                    })
                }
            },
            trackerLib: {
                files: {
                    '<%= output %><%= vendor %><%= dataJsFolder %>trackerLib.js': 'src/tracker/*.js'
                }
            }
        },
        copy: {
            bg: {
                cwd: 'src/js/',
                expand: true,
                src: bgJsList,
                dest: '<%= output %><%= vendor %><%= libFolder %>'
            },

            dataJs: {
                cwd: 'src/js/',
                expand: true,
                src: dataJsList,
                dest: '<%= output %><%= vendor %><%= dataJsFolder %>'
            },

            baseData: {
                cwd: 'src/',
                expand: true,
                src: baseDataList,
                dest: '<%= output %><%= vendor %><%= dataFolder %>'
            }
        },
        watch: {
            options: {
                spawn: false
            },
            trackerLib: {
                files: [
                    'src/tracker/*.js'
                ],
                tasks: ['concat:trackerLib']
            },
            bgJs: {
                files: bgJsList.map(function(item) {
                    return 'src/js/'+item
                }),
                tasks: ['copy:bg']
            },
            engineJs: {
                files: engineJsList.map(function(item) {
                    return 'src/js/' + item;
                }),
                tasks: ['concat:engine']
            },
            dataJs: {
                files: dataJsList.map(function(item) {
                    return 'src/js/'+item
                }),
                tasks: ['copy:dataJs']
            },
            baseData: {
                files: baseDataList.map(function(item) {
                    return 'src/'+item
                }),
                tasks: ['copy:baseData']
            }
        },
        root: process.cwd().replace(/\\/g, '/') + '/',
        output: '<%= pkg.outputDir %>'
    });

    grunt.registerTask('setAppInfo', function() {
        var enginePath = grunt.template.process('<%= output %><%= vendor %><%= dataJsFolder %>engine.js');
        var content = grunt.file.read(enginePath);
        content = content.replace(/\{appId\}/g, grunt.config('appId'));
        content = content.replace(/\{appVersion\}/g, grunt.config('pkg.extVersion'));
        grunt.file.write(enginePath, content);
    });

    require('google-closure-compiler').grunt(grunt);
    grunt.registerTask('compressJs', function() {
        var fs = require('fs');
        var crypto = require('crypto');

        var done = this.async();

        var getHash = function(path, cb) {
            var fd = fs.createReadStream(path);
            var hash = crypto.createHash('sha256');
            hash.setEncoding('hex');
            fd.on('end', function () {
                hash.end();
                cb(hash.read());
            });
            fd.pipe(hash);
        };

        var gruntTask = {
            'closure-compiler': {
                minify: {
                    files: {},
                    options: {
                        language_in: 'ECMASCRIPT5'
                    }
                }
            }
        };

        grunt.config.merge({'closure-compiler': {
            minify: ''
        }});

        var wait = 0;
        var ready = 0;
        var hashList = {};

        var fileList = grunt.file.expand(grunt.template.process('<%= output %><%= vendor %>') + '**/*.js');
        fileList = fileList.filter(function(path) {
            return !/\.min\.js$/.test(path);
        });

        var ccFiles = gruntTask['closure-compiler'].minify.files;
        var onReady = function() {
            ready++;
            if (wait !== ready) {
                return;
            }

            var copyFileList = [];
            var hashFolder = grunt.template.process('<%= output %>hash/');
            for (var hash in hashList) {
                var pathList = hashList[hash];
                var hashFilePath = hashFolder + hash + '.js';

                if (!grunt.file.exists(hashFilePath)) {
                    ccFiles[hashFilePath] = pathList[0];
                }

                pathList.forEach(function(path) {
                    copyFileList.push({src: hashFilePath, dest: path});
                });
            }

            grunt.config.merge(gruntTask);

            grunt.registerTask('copyFromCache', function() {
                copyFileList.forEach(function(item) {
                    grunt.file.copy(item.src, item.dest);
                });
            });

            var tasks = ['copyFromCache'];
            if (Object.keys(ccFiles).length) {
                tasks.unshift('closure-compiler:minify');
            }

            grunt.task.run(tasks);

            done();
        };

        fileList.forEach(function(path) {
            wait++;
            getHash(path, function(hash) {
                if (!hashList[hash]) {
                    hashList[hash] = [];
                }
                hashList[hash].push(path);
                onReady();
            });
        });
    });

    grunt.registerTask('extensionBase', ['copy:baseData', 'copy:dataJs', 'copy:bg', 'concat:trackerLib']);
    grunt.registerTask('buildJs', ['concat:engine']);

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-compress');

    require('./grunt/chrome.js').run(grunt);

    grunt.registerTask('devMode', function() {
        devMode = true;
    });

    grunt.registerTask('dev', ['devMode', 'chrome', 'watch']);

    grunt.registerTask('default', [
        'clean:output',
        'chrome',
        'opera'
    ]);
};