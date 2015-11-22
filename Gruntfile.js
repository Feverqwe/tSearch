module.exports = function (grunt) {
    "use strict";
    var devMode = false;
    var baseDataList = [
        '_locales/**',
        'css/**',
        'img/**',
        'index.html',
        'popup.html',
        'history.html',
        'options.html'
    ];
    var dataJsList = [
        'explore.js',
        'exKit.js',
        'history.js',
        'jquery-2.1.4.min.js',
        'jquery-ui.min.js',
        'notifer.js',
        'options.js',
        'popup.js',
        'profileManager.js',
        'rate.js',
        'selectBox.js',
        'view.js'
    ];
    var engineJsList = [
        'engine.js',
        'counter.js'
    ];
    var bgJsList = [
        'bg.js'
    ];
    var monoJsList = [
        'mono.js',
        'monoUtils.js'
    ];
    grunt.initConfig({
        env: grunt.file.exists('env.json') ? grunt.file.readJSON('env.json') : {},
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            output: [
                '<%= output %>/*',
                '!<%= output %>/hash'
            ],
            magic: '<%= output %><%= vendor %><%= dataFolder %>legacy',
            popup: [
                '<%= output %><%= vendor %>popup.html',
                '<%= output %><%= vendor %><%= dataJsFolder %>popup.js'
            ],
            bg: [
                '<%= output %><%= vendor %>js/bg.js'
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
            },
            mono: {
                files: {
                    '<%= output %><%= vendor %><%= dataJsFolder %>mono.js': monoJsList.map(function(item) {
                        return 'src/js/' + item;
                    })
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
            },

            legacy: {
                cwd: 'src/',
                expand: true,
                src: [
                    'legacy/**'
                ],
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
            monoJs: {
                files: monoJsList.map(function(item) {
                    return 'src/js/'+item
                }),
                tasks: ['concat:mono']
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
            legacy: {
                files: ['src/legacy/**'],
                tasks: ['copy:legacy']
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

    grunt.registerTask('compressJs', function() {
        var getHash = function(path, cb) {
            var fs = require('fs');
            var crypto = require('crypto');

            var fd = fs.createReadStream(path);
            var hash = crypto.createHash('sha256');
            hash.setEncoding('hex');

            fd.on('end', function () {
                hash.end();
                cb(hash.read());
            });

            fd.pipe(hash);
        };

        var done = this.async();
        if (devMode) {
            return done();
        }

        var gruntTask = {
            closurecompiler: {
                minify: {
                    files: {},
                    options: {
                        jscomp_warning: 'const',
                        language_in: 'ECMASCRIPT5',
                        max_processes: 2
                    }
                }
            }
        };
        grunt.config.merge({closurecompiler: {
            minify: ''
        }});

        var wait = 0;
        var ready = 0;
        var hashList = {};

        var fileList = grunt.file.expand(grunt.template.process('<%= output %><%= vendor %>') + '**/*.js');
        fileList = fileList.filter(function(path) {
            if (/\.min\.js$/.test(path)) {
                return false;
            }
            return true;
        });

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
                    gruntTask.closurecompiler.minify.files[hashFilePath] = pathList[0];
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

            grunt.task.run(['closurecompiler:minify', 'copyFromCache']);

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

    grunt.registerTask('monoPrepare', function() {
        "use strict";
        var path = grunt.template.process('<%= output %><%= vendor %><%= dataJsFolder %>');
        var fileName = 'mono.js';
        var content = grunt.file.read(path + fileName);
        var ifStrip = require('./grunt/ifStrip.js').ifStrip;
        content = ifStrip(content, grunt.config('monoParams') || {});
        content = content.replace(/\n[\t\s]*\n/g, '\n\n');
        grunt.file.write(path + fileName, content);
    });

    grunt.registerTask('extensionBase', ['copy:baseData', 'copy:legacy', 'copy:dataJs', 'copy:bg', 'concat:trackerLib']);
    grunt.registerTask('buildJs', ['concat:engine', 'concat:mono', 'monoPrepare']);

    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-closurecompiler');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-json-format');
    grunt.loadNpmTasks('grunt-exec');

    require('./grunt/chrome.js').run(grunt);
    require('./grunt/firefox.js').run(grunt);
    require('./grunt/web.js').run(grunt);

    grunt.registerTask('devMode', function() {
        devMode = true;
    });

    grunt.registerTask('dev', ['devMode', 'chrome', 'watch']);

    grunt.registerTask('default', [
        'clean:output',
        'chrome',
        'opera',
        'chromeApp',
        'firefox-sig',
        'web'
    ]);
};