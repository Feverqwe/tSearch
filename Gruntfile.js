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
        var ccTask = {
            closurecompiler: {
                minify: {
                    files: 'empty',
                    options: {
                        jscomp_warning: 'const',
                        language_in: 'ECMASCRIPT5',
                        max_processes: 2
                    }
                }
            }
        };
        grunt.config.merge(ccTask);
        ccTask.closurecompiler.minify.files = {};

        var wait = 0;
        var ready = 0;
        var hashList = {};

        var fs = require('fs');
        var ddblFolderList = [];
        ['dataJsFolder', 'libFolder'].forEach(function(folder) {
            if (ddblFolderList.indexOf(grunt.config(folder)) !== -1) {
                return;
            }
            ddblFolderList.push(grunt.config(folder));

            var jsFolder = grunt.template.process('<%= output %><%= vendor %><%= ' + folder + ' %>');

            var files = fs.readdirSync(jsFolder);
            var jsList = grunt.file.match('*.js', files);
            files = null;

            var copyList = [];
            var onReady = function() {
                ready++;
                if (wait !== ready) {
                    return;
                }

                var hashFolder = grunt.template.process('<%= output %>hash/');
                for (var hash in hashList) {
                    var item = hashList[hash];
                    var jsFolder = grunt.template.process('<%= output %><%= vendor %><%= ' + item[0] + ' %>');
                    var hashName = hashFolder + hash + '.js';
                    if (!grunt.file.exists(hashName)) {
                        ccTask.closurecompiler.minify.files[hashName] = '<%= output %><%= vendor %><%= ' + item[0] + ' %>'+item[1];
                    }
                    copyList.push([hashName, jsFolder + item[1]]);
                }

                grunt.config.merge(ccTask);
                grunt.registerTask('copyFromCache', function() {
                    copyList.forEach(function(item) {
                        grunt.file.copy(item[0], item[1]);
                    });
                });

                grunt.task.run(['closurecompiler:minify', 'copyFromCache']);

                done();
            };

            jsList.forEach(function(jsFile) {
                if (jsFile.indexOf('.min.js') !== -1) {
                    return;
                }
                wait++;
                getHash(jsFolder + jsFile, function(hash) {
                    hashList[hash] = [folder, jsFile];
                    onReady();
                });
            });
        });
    });

    grunt.registerMultiTask('insert', 'Insert file in file, lik concat but in current position', function() {
        var options = this.options({
            word: '//@insert'
        });
        var baseFile = this.files.shift();

        var content = grunt.file.read(baseFile.src[0]);
        var pos = content.indexOf(options.word);
        var list = [content.substr(0, pos)];
        var end = content.substr(pos);

        this.files.forEach(function(filePair) {
            filePair.src.forEach(function(src) {
                list.push(grunt.file.read(src));
            });
        });

        list.push(end);

        grunt.file.write(baseFile.dest, list.join('\n'));
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
        'chromeApp',
        'firefox-sig',
        'web'
    ]);
};