exports.run = function (grunt) {
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
            'extensionBase',
            'chromeManifest',
            'json-format:chromeManifestFormat',
            'compress:chrome'
        ]);
    });

    grunt.registerTask('chromeApp', function () {
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
            'extensionBase',
            'chromeManifest',
            'json-format:chromeManifestFormat',
            'compress:chrome'
        ]);
    });
};