exports.run = function (grunt) {
    grunt.config.merge({
        compress: {
            chrome: {
                options: {
                    mode: 'zip',
                    archive: '<%= output %><%= vendor %>../<%= buildName %>.zip'
                },
                files: [{
                    cwd: '<%= output %><%= vendor %>',
                    expand: true,
                    filter: 'isFile',
                    src: '**',
                    dest: ''
                }]
            }
        }
    });

    grunt.registerTask('chromeManifest', function() {
        var manifestPath = grunt.config('output') + grunt.config('vendor') + 'manifest.json';
        var content = grunt.file.readJSON('src/manifest.json');
        content.version = grunt.config('pkg.extVersion');
        grunt.file.write(manifestPath, JSON.stringify(content, null, 4));
    });

    grunt.registerTask('ffManifest', function() {
        var manifestPath = grunt.config('output') + grunt.config('vendor') + 'manifest.json';
        var content = grunt.file.readJSON('src/vendor/firefox/manifest.json');
        content.version = grunt.config('pkg.extVersion');
        grunt.file.write(manifestPath, JSON.stringify(content, null, 4));
    });

    grunt.registerTask('chrome', function () {
        grunt.config.merge({
            vendor: 'chrome/src/',
            libFolder: 'js/',
            dataJsFolder: 'js/',
            includesFolder: 'includes/',
            dataFolder: '',
            buildName: 'tmsExt_<%= pkg.extVersion %>',
            appId: 'chromeExt'
        });

        grunt.task.run([
            'extensionBase',
            'buildJs',
            'chromeManifest',
            'setAppInfo',
            'compressJs',
            'compress:chrome'
        ]);
    });

    grunt.registerTask('opera', function () {
        grunt.config.merge({
            vendor: 'opera/src/',
            libFolder: 'js/',
            dataJsFolder: 'js/',
            includesFolder: 'includes/',
            dataFolder: '',
            buildName: 'tmsExt_opera_<%= pkg.extVersion %>',
            appId: 'operaExt'
        });

        grunt.task.run([
            'extensionBase',
            'buildJs',
            'chromeManifest',
            'setAppInfo',
            'compressJs',
            'compress:chrome'
        ]);
    });

    grunt.registerTask('firefox', function () {
        grunt.config.merge({
            vendor: 'firefox/src/',
            libFolder: 'js/',
            dataJsFolder: 'js/',
            includesFolder: 'includes/',
            dataFolder: '',
            buildName: 'tmsExt_ff_<%= pkg.extVersion %>',
            appId: 'firefoxExt'
        });

        grunt.task.run([
            'extensionBase',
            'buildJs',
            'ffManifest',
            'setAppInfo',
            'compressJs',
            'compress:chrome'
        ]);
    });
};