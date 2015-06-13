exports.run = function (grunt) {
    grunt.registerTask('mxDef', function() {
        var packagePath = grunt.config('output') + grunt.config('vendor') + 'def.json';
        var content = grunt.file.readJSON(packagePath);
        content[0].version = grunt.config('pkg.extVersion');
        grunt.file.write(packagePath, JSON.stringify(content));
    });

    grunt.registerTask('maxthon', function () {
        grunt.config.merge({
            copy: {
                vendorMaxthon: {
                    cwd: 'src/vendor/maxthon/',
                    expand: true,
                    src: [
                        '**'
                    ],
                    dest: '<%= output %><%= vendor %>'
                }
            },
            'json-format': {
                mxDef: {
                    cwd: '<%= output %><%= vendor %>',
                    expand: true,
                    src: 'def.json',
                    dest: '<%= output %><%= vendor %>',
                    options: {
                        indent: 4
                    }
                }
            },
            vendor: 'maxthon/build_maxthon/',
            libFolder: 'js/',
            dataJsFolder: 'js/',
            includesFolder: 'includes/',
            dataFolder: ''
        });
        grunt.task.run([
            'extensionBase',
            'copy:vendorMaxthon',
            'buildJs',
            'clean:bg',
            'mxDef',
            'json-format:mxDef',
            'compressJs'
        ]);
    });
};