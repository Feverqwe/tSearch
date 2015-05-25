module.exports = function (grunt) {
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
        'jquery-2.1.3.min.js',
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
        'src/js/engine.js',
        'src/js/counter.js'
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
            output: '<%= output %>'
        },
        concat: {
            options: {
                separator: '\n'
            },
            engine: {
                files: {
                    '<%= output %><%= vendor %><%= dataJsFolder %>engine.js': engineJsList
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
        insert: {
            mono: {
                cwd: 'src/js/',
                expand: true,
                src: monoJsList,
                dest: '<%= output %><%= vendor %><%= dataJsFolder %>'
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
                    "use strict";
                    return 'src/js/'+item
                }),
                tasks: ['insert:mono']
            },
            bgJs: {
                files: bgJsList.map(function(item) {
                    "use strict";
                    return 'src/js/'+item
                }),
                tasks: ['copy:bg']
            },
            engineJs: {
                files: engineJsList,
                tasks: ['concat:engine']
            },
            dataJs: {
                files: dataJsList.map(function(item) {
                    "use strict";
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
                    "use strict";
                    return 'src/'+item
                }),
                tasks: ['copy:baseData']
            }
        },
        root: process.cwd().replace(/\\/g, '/') + '/',
        output: '<%= pkg.outputDir %>'
    });

    grunt.registerTask('compressJs', function() {
        "use strict";
        if (devMode) {
            return;
        }
        var ccTask = {
            closurecompiler: {
                minify: {
                    files: null,
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

        var fs = require('fs');
        var jsFolder = grunt.template.process('<%= output %><%= vendor %><%= dataJsFolder %>');
        var files = fs.readdirSync(jsFolder);

        var jsList = grunt.file.match('*.js', files);

        for (var i = 0, jsFile; jsFile = jsList[i]; i++) {
            if (jsFile.indexOf('.min.js') !== -1) continue;
            ccTask.closurecompiler.minify.files['<%= output %><%= vendor %><%= dataJsFolder %>'+jsFile] = '<%= output %><%= vendor %><%= dataJsFolder %>'+jsFile;
        }

        grunt.config.merge(ccTask);
        grunt.task.run('closurecompiler:minify');
    });

    grunt.registerMultiTask('insert', 'Insert file in file, lik concat but in current position', function() {
        "use strict";
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

    grunt.registerTask('extensionBase', ['copy:baseData', 'copy:legacy', 'copy:dataJs', 'insert:mono', 'copy:bg', 'concat:engine', 'concat:trackerLib']);

    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-closurecompiler');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-json-format');

    require('./grunt/chrome.js').run(grunt);

    grunt.registerTask('devMode', function() {
        "use strict";
        devMode = true;
    });

    grunt.registerTask('dev', ['devMode', 'chrome', 'watch']);

    grunt.registerTask('default', [
        'clean:output',
        'chrome',
        'chromeApp'
    ]);
};