exports.run = function (grunt) {
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
                    files: [{
                        expand: true,
                        filter: 'isFile',
                        cwd: '<%= output %><%= vendor %>../unzip/',
                        src: '**',
                        dest: ''
                    }]
                }
            },
            'json-format': {
                ffHarnessOptions: {
                    expand: true,
                    cwd: '<%= output %><%= vendor %>../unzip/',
                    src: 'harness-options.json',
                    dest: '<%= output %><%= vendor %>../unzip/',
                    options: {
                        indent: 2
                    }
                }
            }
        });

        var done = this.async();
        var vendor = grunt.template.process('<%= output %><%= vendor %>../');
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
        var vendor = grunt.template.process('<%= output %><%= vendor %>../');
        var path = vendor + 'torrents_multisearch.xpi';
        grunt.file.copy(path, vendor + grunt.config('buildName') + '.xpi');
        grunt.file.delete(path);
    });

    grunt.registerTask('ffPackage', function() {
        var packagePath = grunt.template.process('<%= output %><%= vendor %>package.json');
        var content = grunt.file.readJSON('src/vendor/firefox/package.json');
        content.version = grunt.config('pkg.extVersion');
        grunt.file.write(packagePath, JSON.stringify(content));
    });

    grunt.registerTask('setInstallRdf', function() {
        "use strict";
        var patch = grunt.template.process('<%= output %><%= vendor %>/../template/install.rdf');
        var content = grunt.file.read(patch);
        content = replaceContent(content);
        grunt.file.write(patch, content);
    });

    grunt.config.merge({
        copy: {
            ffBase: {
                expand: true,
                cwd: 'src/vendor/firefox/',
                src: [
                    'locale/*',
                    'lib/*',
                    'data/**'
                ],
                dest: '<%= output %><%= vendor %>'
            },

            ffTemplateDir: {
                expand: true,
                cwd: 'src/vendor/firefox_tools/template/',
                src: '**',
                dest: '<%= output %><%= vendor %>/../template/'
            }
        },
        'json-format': {
            ffPackage: {
                expand: true,
                cwd: '<%= output %><%= vendor %>',
                src: 'package.json',
                dest: '<%= output %><%= vendor %>',
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
            var installPath = grunt.template.process('<%= output %><%= vendor %>../template/install.rdf');
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
            buildName: 'tms_<%= pkg.extVersion %>_store',
            appId: 'firefoxStoreExt',
            browser: 'firefox'
        });
        grunt.task.run([
            'extensionBase',
            'copy:ffBase',
            'buildJs',
            'clean:magic',
            'ffPackage',
            'json-format:ffPackage',
            'setAppInfo',
            'copy:ffTemplateDir',
            'setInstallRdf',
            'ffRmUpdateKey',
            'exec:buildFF',
            'ffRenameBuild',
            'fixFfJsJs'
        ]);
    });

    grunt.registerTask('getHash', function () {
        var done = this.async();
        var vendor = grunt.template.process('<%= output %><%= vendor %>../');
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

        var oldId = '{d03fdff0-d3a0-11e0-baa5-14d64d08fdac}';
        var newId = '{0a06d1b2-08d1-11e5-b948-d1fe1c5d46b0}';
        var newTitle = 'Torrents MultiSearch webApp';

        grunt.registerTask('setPackageId', function() {
            "use strict";
            var patch = grunt.template.process('<%= output %><%= vendor %>package.json');
            var content = grunt.file.readJSON(patch);
            content.id = newId;
            content.title = newTitle;
            grunt.file.write(patch, JSON.stringify(content));
        });

        grunt.registerTask('setUpdateId', function() {
            "use strict";
            var patch = grunt.template.process('<%= output %><%= vendor %>../update.rdf');
            var content = grunt.file.read(patch);
            content = content.replace(oldId, newId);
            grunt.file.write(patch, content);
        });

        grunt.config.merge({
            copy: {
                ffCopyBuildToRoot: {
                    cwd: '<%= output %><%= vendor %>../',
                    expand: true,
                    src: '<%= buildName %>.xpi',
                    dest: ''
                }
            },
            vendor: 'firefox/src/',
            libFolder: 'lib/',
            dataJsFolder: 'data/js/',
            includesFolder: 'data/includes/',
            dataFolder: 'data/',
            ffUpdateUrl: '<%= pkg.ffUpdateUrl %>',
            buildName: 'build_firefox',
            appId: 'firefoxExt',
            browser: 'firefox'
        });

        grunt.task.run([
            'extensionBase',
            'copy:ffBase',
            'buildJs',
            'clean:magic',
            'ffPackage',
            'setPackageId',
            'json-format:ffPackage',
            'setAppInfo',
            // 'compressJs',
            'copy:ffTemplateDir',
            'setInstallRdf',
            'exec:buildFF',
            'ffRenameBuild',
            'fixFfJsJs',
            'getHash',
            'setUpdateId',
            'copy:ffCopyBuildToRoot'
        ]);
    });
};