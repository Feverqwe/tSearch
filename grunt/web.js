exports.run = function (grunt) {
    grunt.registerTask('web', function () {
        grunt.config.merge({
            copy: {
                vendorWeb: {
                    cwd: 'src/vendor/web/',
                    expand: true,
                    src: [
                        '**'
                    ],
                    dest: '<%= output %><%= vendor %>'
                }
            },
            vendor: 'web/',
            libFolder: 'js/',
            dataJsFolder: 'js/',
            includesFolder: 'includes/',
            dataFolder: ''

        });

        grunt.task.run([
            'extensionBase',
            'copy:vendorWeb',
            'buildJs',
            'clean:magic',
            'clean:popup',
            'setAppInfo',
            'compressJs'
        ]);
    });
};