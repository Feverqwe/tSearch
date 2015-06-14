exports.run = function (grunt) {
    grunt.registerTask('opera12', function () {
        grunt.config.merge({
            copy: {
                vendorOpera12: {
                    expand: true,
                    cwd: 'src/vendor/opera/',
                    src: [
                        '**'
                    ],
                    dest: '<%= output %><%= vendor %>../',
                    options: {
                        process: function (content, src) {
                            if (src.indexOf('config.xml') !== -1) {
                                content = content.replace('%extVersion%', grunt.config('localExtVersion'));
                            }
                            return content;
                        }
                    }
                },
                oIcons: {
                    cwd: 'src/vendor/opera/',
                    expand: true,
                    src: [
                        'icons/**'
                    ],
                    dest: '<%= output %><%= vendor %>../'
                }
            },
            compress: {
                buildOpera12: {
                    options: {
                        mode: 'zip',
                        archive: '<%= output %><%= vendor %>../../<%= buildName %>.oex'
                    },
                    files: [
                        {
                            expand: true,
                            filter: 'isFile',
                            cwd: '<%= output %><%= vendor %>../',
                            src: '**',
                            dest: ''
                        }
                    ]
                }
            },
            vendor: 'opera12/src/build/',
            libFolder: 'js/',
            dataJsFolder: 'js/',
            includesFolder: 'includes/',
            dataFolder: '',
            localExtVersion: '<%= pkg.extVersion %>.1',
            buildName: 'tms_<%= localExtVersion %>',
            appId: 'opera12Ext',
            browser: 'opera'
        });
        grunt.task.run([
            'extensionBase',
            'copy:vendorOpera12',
            'buildJs',
            'setAppInfo',
            'compressJs',
            'copy:oIcons',
            'compress:buildOpera12'
        ]);
    });
};