exports.run = function (grunt) {
    var monoParams = {
        useWebApp: 1,
        useLocalStorage: 1,
        oneMode: 1
    };

    grunt.registerTask('web', function () {
        grunt.config('monoParams', monoParams);

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