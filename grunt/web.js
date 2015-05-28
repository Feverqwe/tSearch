exports.run = function (grunt) {
    return;
    grunt.registerTask('web', function () {
        grunt.config.merge({
            copy: {
                vendorWeb: {
                    expand: true,
                    src: [
                        'src/vendor/web/**'
                    ],
                    dest: '<%= output %><%= vendor %>',
                    rename: function () {
                        return arguments[0] + arguments[1].substr('src/vendor/web/'.length);
                    }
                }
            },
            vendor: 'web/',
            libFolder: 'js/',
            dataJsFolder: 'js/',
            includesFolder: 'includes/',
            dataFolder: ''
        });

        grunt.task.run([
            'extensionBaseMin',
            'copy:vendorWeb',
            'rmMagic',
            'rmPopup'
        ]);
    });
};