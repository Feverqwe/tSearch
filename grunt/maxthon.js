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
                    expand: true,
                    src: [
                        'src/vendor/maxthon/**'
                    ],
                    dest: '<%= output %><%= vendor %>',
                    rename: function () {
                        return arguments[0] + arguments[1].substr('src/vendor/maxthon/'.length);
                    }
                }
            },
            'json-format': {
                mxDef: {
                    expand: true,
                    src: '<%= output %><%= vendor %>def.json',
                    dest: '<%= output %><%= vendor %>',
                    rename: function () {
                        return arguments[0] + arguments[1].substr((grunt.config('output') + grunt.config('vendor')).length);
                    },
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
            'extensionBaseMin',
            'copy:vendorMaxthon',
            'rmBg',
            'mxDef',
            'json-format:mxDef'
        ]);
    });
};