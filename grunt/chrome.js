exports.run = function (grunt) {
    var monoParams = {
        useChrome: 1,
        oldChromeSupport: 1,
        useLocalStorage: 0,
        chromeForceDefineBgPage: 0,
        oneMode: 1
    };

    grunt.config.merge({
        'json-format': {
            chromeManifestFormat: {
                cwd: '<%= output %><%= vendor %>',
                expand: true,
                src: ['manifest.json'],
                dest: '<%= output %><%= vendor %>',
                options: {
                    indent: 4
                }
            }
        },
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

    grunt.registerTask('rmPopup', function() {
        grunt.file.delete(grunt.template.process('<%= output %><%= vendor %><%= dataJsFolder %>') + 'popup.js');
        grunt.file.delete(grunt.template.process('<%= output %><%= vendor %><%= dataFolder %>') + 'popup.html');
    });

    grunt.registerTask('chromeManifest', function() {
        var manifestPath = grunt.config('output') + grunt.config('vendor') + 'manifest.json';
        var content = grunt.file.readJSON('src/manifest.json');
        content.version = grunt.config('pkg.extVersion');
        grunt.file.write(manifestPath, JSON.stringify(content));
    });

    grunt.registerTask('chrome', function () {
        grunt.config('monoParams', monoParams);

        grunt.config.merge({
            vendor: 'chrome/src/',
            libFolder: 'js/',
            dataJsFolder: 'js/',
            includesFolder: 'includes/',
            dataFolder: '',
            buildName: 'tmsExt_<%= pkg.extVersion %>',
            appId: 'chromeExt',
            browser: 'chrome'
        });

        grunt.task.run([
            'extensionBase',
            'buildJs',
            'chromeManifest',
            'json-format:chromeManifestFormat',
            'setAppInfo',
            'compressJs',
            'compress:chrome'
        ]);
    });

    grunt.registerTask('opera', function () {
        grunt.config('monoParams', monoParams);

        grunt.config.merge({
            vendor: 'opera/src/',
            libFolder: 'js/',
            dataJsFolder: 'js/',
            includesFolder: 'includes/',
            dataFolder: '',
            buildName: 'tmsExt_opera_<%= pkg.extVersion %>',
            appId: 'operaExt',
            browser: 'chrome'
        });

        grunt.task.run([
            'extensionBase',
            'buildJs',
            'chromeManifest',
            'json-format:chromeManifestFormat',
            'setAppInfo',
            'compressJs',
            'compress:chrome'
        ]);
    });

    grunt.registerTask('chromeApp', function () {
        grunt.config('monoParams', monoParams);

        grunt.registerTask('chromeAppManifest', function() {
            var manifestPath = grunt.config('output') + grunt.config('vendor') + 'manifest.json';
            var content = grunt.file.readJSON('src/vendor/chromeApp/manifest.json');
            content.version = grunt.config('pkg.extVersion');
            grunt.file.write(manifestPath, JSON.stringify(content));
        });

        grunt.config.merge({
            vendor: 'chromeApp/src/',
            libFolder: 'js/',
            dataJsFolder: 'js/',
            includesFolder: 'includes/',
            dataFolder: '',
            buildName: 'tmsApp_<%= pkg.extVersion %>',
            appId: 'chromeApp',
            browser: 'chrome'
        });

        grunt.task.run([
            'extensionBase',
            'buildJs',
            'chromeAppManifest',
            'rmPopup',
            'json-format:chromeManifestFormat',
            'setAppInfo',
            'compressJs',
            'compress:chrome'
        ]);
    });
};