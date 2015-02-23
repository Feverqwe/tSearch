module.exports = function (grunt) {
    var bgJsList = [
        'src/js/background.js'
    ];
    var dataJsList = [
        'src/js/mono.js',
        'src/js/view.js',
        'src/js/rate.js',
        'src/js/explore.js',
        'src/js/notifer.js',
        'src/js/counter.js',
        'src/js/engine.js',
        'src/js/history.js',
        'src/js/magic.js',
        'src/js/options.js',
        'src/js/popup.js',
        'src/js/ex_kit.js',
        'src/js/torrent_lib.min.js',
        'src/js/jquery-2.1.1.min.js',
        'src/js/jquery-ui.min.js',
        'src/js/lz-string-1.3.3.js'
    ];
    grunt.initConfig({
        env: grunt.file.readJSON('env.json'),
        pkg: grunt.file.readJSON('package.json'),
        clean: ['<%= output %>'],
        copy: {
            background: {
                expand: true,
                flatten: true,
                src: bgJsList,
                dest: '<%= output %><%= vendor %><%= libFolder %>'
            },

            dataJs: {
                expand: true,
                flatten: true,
                src: dataJsList,
                dest: '<%= output %><%= vendor %><%= dataJsFolder %>'
            },

            locales: {
                expand: true,
                src: 'src/_locales/**',
                dest: '<%= output %><%= vendor %><%= dataFolder %>',
                rename: function () {
                    return arguments[0] + arguments[1].substr('src/'.length);
                }
            },

            baseData: {
                expand: true,
                src: [
                    'src/css/*',
                    'src/images/*',
                    'src/index.html',
                    'src/popup.html',
                    'src/history.html',
                    'src/options.html',
                    'src/magic.html'
                ],
                dest: '<%= output %><%= vendor %><%= dataFolder %>',
                rename: function () {
                    return arguments[0] + arguments[1].substr('src/'.length);
                }
            }
        },

        // vars
        root: process.cwd().replace(/\\/g, '/') + '/',
        output: '<%= pkg.outputDir %>'
    });

    grunt.registerTask('rmMagic', function () {
        grunt.file.delete(grunt.config('output') + grunt.config('vendor') + grunt.config('dataJsFolder') + 'magic.js');
        grunt.file.delete(grunt.config('output') + grunt.config('vendor') + grunt.config('dataFolder') + 'magic.html');
    });

    grunt.registerTask('rmBg', function() {
        grunt.file.delete(grunt.config('output') + grunt.config('vendor') + grunt.config('libFolder') + 'background.js');
    });


    grunt.registerTask('rmPopup', function() {
        grunt.file.delete(grunt.config('output') + grunt.config('dataJsFolder') + 'popup.js');
        grunt.file.delete(grunt.config('output') + grunt.config('vendor') + grunt.config('dataFolder') + 'popup.html');
    });

    var compressJsCopyTaskList = [];
    grunt.registerTask('compressJs', function() {
        if (compressJsCopyTaskList.length > 0) {
            grunt.task.run(compressJsCopyTaskList);
            return;
        }


        var jsList = Array.prototype.concat(dataJsList, bgJsList);
        var taskList = [];
        var taskListObj = {
            exec: {},
            copy: {}
        };

        for (var i = 0, item; item = jsList[i]; i++) {
            if (item.indexOf('jquery') !== -1) continue;

            var isBg = bgJsList.indexOf(item) !== -1;
            var jsFolderTemplate = ( isBg ? '<%= libFolder %>' : '<%= dataJsFolder %>' );
            var jsFolder = ( isBg ? grunt.config('libFolder') : grunt.config('dataJsFolder') );

            var cacheDir = grunt.config('output') + 'cache/' + jsFolder;
            if (!grunt.file.exists(cacheDir)) {
                grunt.file.mkdir(cacheDir);
            }

            var jsFile = item.replace('src/js/', '');
            var taskName = 'compressJs_file_'+jsFile;
            taskList.push('exec:'+taskName);

            compressJsCopyTaskList.push('copy:'+taskName);
            taskListObj.copy[taskName] = {
                flatten: true,
                src: '<%= output %>cache/'+jsFolder+jsFile,
                dest: '<%= output %><%= vendor %>'+jsFolderTemplate+jsFile
            };
            taskListObj.exec[taskName] = {
                command: 'java -jar compiler.jar --language_in ECMASCRIPT5 --js <%= output %><%= vendor %><%= dataJsFolder %>'+jsFile+' --js_output_file <%= output %>cache/'+jsFolder+jsFile
            };
        }
        grunt.config.merge(taskListObj);
        grunt.task.run(taskList);
        grunt.task.run(compressJsCopyTaskList);
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-json-format');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-contrib-compress');

    grunt.registerTask('extensionBase', ['copy:background', 'copy:dataJs', 'copy:baseData', 'copy:locales']);
    grunt.registerTask('extensionBaseMin', ['extensionBase', 'compressJs']);

    require('./grunt/chrome.js').run(grunt);
    require('./grunt/firefox.js').run(grunt);
    require('./grunt/opera12.js').run(grunt);
    require('./grunt/web.js').run(grunt);
    require('./grunt/safari.js').run(grunt);
    require('./grunt/maxthon.js').run(grunt);

    grunt.registerTask('default', [
        'clean',
        'chrome',
        'chromeApp',
        'firefox',
        'firefoxStore',
        'opera12',
        'safari',
        'maxthon',
        'web'
    ]);
};