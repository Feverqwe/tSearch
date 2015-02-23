exports.run = function (grunt) {
    grunt.config.merge({
        'json-format': {
            chromeManifestFormat: {
                expand: true,
                src: '<%= output %><%= vendor %>manifest.json',
                dest: '<%= output %><%= vendor %>',
                rename: function () {
                    return arguments[0] + arguments[1].substr((grunt.config('output') + grunt.config('vendor')).length);
                },
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
                    expand: true,
                    filter: 'isFile',
                    src: '<%= output %><%= vendor %>/**',
                    dest: './',
                    rename: function () {
                        return arguments[0] + arguments[1].substr((grunt.config('output') + grunt.config('vendor')).length);
                    }
                }]
            }
        }
    });

    grunt.registerTask('chrome', function () {
        grunt.registerTask('chromeManifest', function() {
            var manifestPath = grunt.config('output') + grunt.config('vendor') + 'manifest.json';
            var content = grunt.file.readJSON('src/manifest.json');
            content.version = grunt.config('pkg.extVersion');
            grunt.file.write(manifestPath, JSON.stringify(content));
        });

        grunt.config.merge({
            vendor: 'chrome/src/',
            libFolder: 'js/',
            dataJsFolder: 'js/',
            includesFolder: 'includes/',
            dataFolder: '',
            buildName: 'tms_<%= pkg.extVersion %>'
        });

        grunt.task.run([
            'extensionBaseMin',
            'chromeManifest',
            'json-format:chromeManifestFormat',
            'compress:chrome'
        ]);
    });

    grunt.registerTask('chromeApp', function () {
        grunt.registerTask('chromeAppManifest', function() {
            var manifestPath = grunt.config('output') + grunt.config('vendor') + 'manifest.json';
            var manifest = grunt.file.readJSON('src/vendor/chromeApp/manifest.json');
            manifest.version = grunt.config('pkg.extVersion');
            grunt.file.write(manifestPath, JSON.stringify(manifest));
        });

        grunt.config.merge({
            vendor: 'chromeApp/src/',
            libFolder: 'js/',
            dataJsFolder: 'js/',
            includesFolder: 'includes/',
            dataFolder: '',
            buildName: 'tms_<%= pkg.extVersion %>'
        });

        grunt.task.run([
            'extensionBaseMin',
            'chromeAppManifest',
            'rmPopup',
            'json-format:chromeManifestFormat',
            'compress:chrome'
        ]);
    });
};