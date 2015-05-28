exports.run = function (grunt) {
    return;
    var replaceContent = function (content, sha1) {
        content = content.replace('%extVersion%', grunt.config('pkg.extVersion'));

        content = content.replace('%ffMinVersion%', grunt.config('pkg.ffMinVersion'));
        content = content.replace('%ffMaxVersion%', grunt.config('pkg.ffMaxVersion'));

        content = content.replace('%ffMMinVersion%', grunt.config('pkg.ffMinVersion'));
        content = content.replace('%ffMMaxVersion%', grunt.config('pkg.ffMaxVersion'));

        if (sha1) {
            content = content.replace('%buildName%', grunt.config('buildName'));
            content = content.replace('%sha1hash%', sha1);

            content = content.replace('%buildName%', grunt.config('buildName'));
            content = content.replace('%sha1hash%', sha1);
        }
        return content;
    };

    grunt.registerTask('fixFfJsJs', function () {
        grunt.config.merge({
            compress: {
                ffZipBuild: {
                    options: {
                        mode: 'zip',
                        archive: '<%= output %><%= vendor %>../<%= buildName %>.xpi'
                    },
                    files: [
                        {
                            expand: true,
                            filter: 'isFile',
                            src: '<%= output %><%= vendor %>../unzip/**',
                            dest: './',
                            rename: function () {
                                return arguments[0] + arguments[1].substr((grunt.config('output') + grunt.config('vendor') + '../unzip/').length);
                            }
                        }
                    ]
                }
            },
            'json-format': {
                ffHarnessOptions: {
                    expand: true,
                    src: '<%= output %><%= vendor %>../unzip/harness-options.json',
                    dest: '<%= output %><%= vendor %>../unzip/',
                    rename: function () {
                        return arguments[0] + arguments[1].substr((grunt.config('output') + grunt.config('vendor') + '../unzip/').length);
                    },
                    options: {
                        indent: 2
                    }
                }
            }
        });

        var done = this.async();
        var vendor = grunt.config('output') + grunt.config('vendor') + '../';
        var buildPath = vendor + grunt.config('buildName') + '.xpi';
        var unZipPath = vendor + 'unzip/';

        var fs = require('fs');
        var unzip = require('unzip');

        fs.createReadStream(buildPath).pipe(unzip.Extract({
            path: unZipPath
        })).on('close', function () {
            var harnessOptionsPath = unZipPath + 'harness-options.json';
            var content = grunt.file.readJSON(harnessOptionsPath);
            for (var modulePath in content.manifest) {
                var module = content.manifest[modulePath];
                if (!module.moduleName || module.moduleName.slice(-3) !== '.js') continue;
                module.moduleName = module.moduleName.slice(0, -3);
            }
            grunt.file.write(harnessOptionsPath, JSON.stringify(content));

            grunt.task.run('json-format:ffHarnessOptions');

            grunt.task.run('compress:ffZipBuild');

            done();
        });
    });

    grunt.registerTask('ffRenameBuild', function () {
        var vendor = grunt.config('output') + grunt.config('vendor') + '../';
        var path = vendor + 'torrents_multisearch.xpi';
        grunt.file.copy(path, vendor + grunt.config('buildName') + '.xpi');
        grunt.file.delete(path);
    });

    grunt.registerTask('ffPackage', function() {
        var packagePath = grunt.config('output') + grunt.config('vendor') + 'package.json';
        var content = grunt.file.readJSON('src/vendor/firefox/package.json');
        content.version = grunt.config('pkg.extVersion');
        grunt.file.write(packagePath, JSON.stringify(content));
    });

    grunt.config.merge({
        copy: {
            ffBase: {
                expand: true,
                src: [
                    'src/vendor/firefox/locale/*',
                    'src/vendor/firefox/lib/*',
                    'src/vendor/firefox/data/**'
                ],
                dest: '<%= output %><%= vendor %>',
                rename: function () {
                    return arguments[0] + arguments[1].substr('src/vendor/firefox/'.length);
                }
            },

            ffTemplateDir: {
                expand: true,
                src: 'src/vendor/firefox_tools/template/**',
                dest: '<%= output %><%= vendor %>/../template/',
                rename: function () {
                    return arguments[0] + arguments[1].substr('src/vendor/firefox_tools/template/'.length);
                },
                options: {
                    process: function (content, src) {
                        if (src.indexOf('install.rdf') !== -1) {
                            content = replaceContent(content);
                        }
                        return content;
                    }
                }
            }
        },
        'json-format': {
            ffPackage: {
                expand: true,
                src: '<%= output %><%= vendor %>package.json',
                dest: '<%= output %><%= vendor %>',
                rename: function () {
                    return arguments[0] + arguments[1].substr((grunt.config('output') + grunt.config('vendor')).length);
                },
                options: {
                    indent: 4
                }
            }
        },
        exec: {
            buildFF: {
                command: 'cd <%= output %><%= vendor %> && call <%= env.addonSdkPath %>activate && cfx xpi --templatedir=../template --update-url "<%= ffUpdateUrl %>" && move *.xpi ../'
            }
        }
    });

    grunt.registerTask('firefoxStore', function () {
        if (!grunt.config('env.addonSdkPath')) {
            console.error("Add-on SDK is not found!");
            return;
        }

        grunt.registerTask('ffRmUpdateKey', function() {
            var installPath = grunt.config('output') + grunt.config('vendor') + '../template/install.rdf';
            var content = grunt.file.read(installPath);
            var p1 = content.indexOf('<em:updateKey>');
            var p2 = content.indexOf('</em:updateKey>');
            content = content.substr(0, p1) + content.substr(p2 + 15);
            grunt.file.write(installPath, content);
        });

        grunt.config.merge({
            vendor: 'firefoxStore/src/',
            libFolder: 'lib/',
            dataJsFolder: 'data/js/',
            includesFolder: 'data/includes/',
            dataFolder: 'data/',
            ffUpdateUrl: '',
            buildName: 'tms_<%= pkg.extVersion %>_store'
        });
        grunt.task.run([
            'extensionBase',
            'copy:ffBase',
            'rmMagic',
            'ffPackage',
            'json-format:ffPackage',
            'copy:ffTemplateDir',
            'ffRmUpdateKey',
            'exec:buildFF',
            'ffRenameBuild',
            'fixFfJsJs'
        ]);
    });

    grunt.registerTask('getHash', function () {
        var done = this.async();
        var vendor = grunt.config('output') + grunt.config('vendor') + '../';
        var buildPath = vendor + grunt.config('buildName') + '.xpi';

        var fs = require('fs');
        var crypto = require('crypto');

        var fd = fs.createReadStream(buildPath);
        var hash = crypto.createHash('sha1');
        hash.setEncoding('hex');

        fd.on('end', function () {
            hash.end();
            var hashSumm = hash.read();

            var content = grunt.file.read('src/vendor/firefox_tools/update.rdf');
            content = replaceContent(content, hashSumm);
            grunt.file.write(vendor + 'update.rdf', content);

            done(true);
        });

        fd.pipe(hash);
    });

    grunt.registerTask('firefox', function () {
        if (!grunt.config('env.addonSdkPath')) {
            console.error("Add-on SDK is not found!");
            return;
        }

        grunt.config.merge({
            copy: {
                ffCopyBuildToRoot: {
                    flatten: true,
                    src: '<%= output %><%= vendor %>../<%= buildName %>.xpi',
                    dest: './build_firefox.xpi'
                }
            },
            vendor: 'firefox/src/',
            libFolder: 'lib/',
            dataJsFolder: 'data/js/',
            includesFolder: 'data/includes/',
            dataFolder: 'data/',
            ffUpdateUrl: '<%= pkg.ffUpdateUrl %>',
            buildName: 'build_firefox'
        });

        grunt.task.run([
            'extensionBaseMin',
            'copy:ffBase',
            'rmMagic',
            'ffPackage',
            'json-format:ffPackage',
            'copy:ffTemplateDir',
            'exec:buildFF',
            'ffRenameBuild',
            'fixFfJsJs',
            'getHash',
            'copy:ffCopyBuildToRoot'
        ]);
    });
};