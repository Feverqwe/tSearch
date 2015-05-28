exports.run = function (grunt) {
    return;
    grunt.registerTask('opera12', function () {
        grunt.config.merge({
            copy: {
                vendorOpera12: {
                    expand: true,
                    flatten: true,
                    src: [
                        'src/vendor/opera/*'
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
                    expand: true,
                    src: [
                        'src/vendor/opera/icons/*'
                    ],
                    dest: '<%= output %><%= vendor %>../',
                    rename: function () {
                        return arguments[0] + arguments[1].substr('src/vendor/opera/'.length);
                    }
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
                            src: '<%= output %><%= vendor %>../**',
                            dest: './',
                            rename: function () {
                                return arguments[0] + arguments[1].substr((grunt.config('output') + grunt.config('vendor') + '../').length);
                            }
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
            buildName: 'tms_<%= localExtVersion %>'
        });
        grunt.task.run([
            'extensionBaseMin',
            'copy:vendorOpera12',
            'copy:oIcons',
            'rmBg',
            'compress:buildOpera12'
        ]);
    });
};