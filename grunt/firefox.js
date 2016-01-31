exports.run = function (grunt) {
    var monoParams = {
        useFf: 1,
        oneMode: 1
    };

    var replaceContent = function (content, sha1) {
        content = content.replace(/%extVersion%/g, grunt.config('pkg.extVersion'));

        content = content.replace(/%ffMinVersion%/g, grunt.config('pkg.ffMinVersion'));
        content = content.replace(/%ffMaxVersion%/g, grunt.config('pkg.ffMaxVersion'));

        content = content.replace(/%ffMMinVersion%/g, grunt.config('pkg.ffMinVersion'));
        content = content.replace(/%ffMMaxVersion%/g, grunt.config('pkg.ffMaxVersion'));

        content = content.replace(/%buildName%/g, grunt.config('buildName'));
        content = content.replace(/%sha1hash%/g, sha1);

        content = content.replace(/%buildName%/g, grunt.config('buildName'));
        content = content.replace(/%sha1hash%/g, sha1);

        return content;
    };

    grunt.registerTask('ffRePack', function() {
        "use strict";
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
        })).on('close', function() {
            var installRdfPath = unZipPath + 'install.rdf';
            var content = grunt.file.read(installRdfPath);

            var insert = function(text, target) {
                var insertPos = content.lastIndexOf(target) + target.length;

                var parts = [];
                parts.push(content.substr(0, insertPos));
                parts.push(text);
                parts.push(content.substr(insertPos));

                content = parts.join('');
            };

            insert([
                '\n', '<em:multiprocessCompatible>true</em:multiprocessCompatible>'
            ].join(''), '</em:optionsType>');

            grunt.file.write(installRdfPath, content);

            grunt.task.run('compress:ffZipBuild');

            done();
        });
    });

    grunt.registerTask('ffRenameBuild', function () {
        var vendor = grunt.template.process('<%= output %><%= vendor %>');
        var fileList = grunt.file.expand(vendor + '*.xpi');
        var path = fileList[0];
        grunt.file.copy(path, vendor + '../' + grunt.config('buildName') + '.xpi');
        grunt.file.delete(path);
    });

    grunt.registerTask('ffPackage', function() {
        var packagePath = grunt.template.process('<%= output %><%= vendor %>package.json');
        var content = grunt.file.readJSON('src/vendor/firefox/package.json');

        content.version = grunt.config('pkg.extVersion');

        var engines = {};
        engines.firefox = '>=' + grunt.config('pkg.ffMinVersion') + ' <=' + grunt.config('pkg.ffMaxVersion');
        engines.fennec = '>=' + grunt.config('pkg.ffMinVersion') + ' <=' + grunt.config('pkg.ffMaxVersion');
        content.engines = engines;

        grunt.file.write(packagePath, JSON.stringify(content));
    });

    grunt.registerTask('ffSetUpdateUrl', function() {
        "use strict";
        var vendor = grunt.template.process('<%= output %><%= vendor %>');
        var content = grunt.file.readJSON(vendor + 'package.json');

        content.updateURL = grunt.config('ffUpdateUrl');
        content.updateKey = grunt.config('ffUpdateKey');

        grunt.file.write(vendor + 'package.json', JSON.stringify(content));
    });

    grunt.config.merge({
        copy: {
            ffBase: {
                expand: true,
                cwd: 'src/vendor/firefox/',
                src: [
                    'locale/*',
                    'lib/*',
                    'data/**',
                    '*.png'
                ],
                dest: '<%= output %><%= vendor %>'
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
                command: 'cd <%= output %><%= vendor %> && jpm xpi'
            }
        }
    });

    grunt.registerTask('getHash', function () {
        var done = this.async();
        var vendor = grunt.template.process('<%= output %><%= vendor %>../');
        var buildPath = grunt.config('sigFile');

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

    grunt.registerTask('firefox-sig', function () {
        grunt.config('monoParams', monoParams);

        grunt.registerTask('copySsFigVersion', function() {
            "use strict";
            grunt.file.copy(
                grunt.template.process('<%= output %><%= vendor %>../<%= buildName %>.xpi'),
                grunt.template.process('<%= output %><%= vendor %>../<%= noSigBuildName %>.xpi')
            );
            grunt.file.copy(
                grunt.template.process('<%= sigFile %>'),
                grunt.template.process('<%= output %><%= vendor %>../<%= sigBuildName %>.xpi')
            );
        });

        grunt.config.merge({
            vendor: 'firefox-sig/src/',
            libFolder: 'lib/',
            dataJsFolder: 'data/js/',
            includesFolder: 'data/includes/',
            dataFolder: 'data/',
            ffUpdateUrl: '<%= pkg.ffUpdateUrl %>',
            ffUpdateKey: '<%= pkg.ffUpdateKey %>',
            buildName: 'build_firefox',
            noSigBuildName: 'build_firefox-no-sig',
            sigBuildName: 'build_firefox',
            sigFile: './build_firefox-sig.xpi',
            appId: 'firefoxExt',
            browser: 'firefox'
        });

        grunt.task.run([
            'extensionBase',
            'copy:ffBase',
            'buildJs',
            'ffPackage',
            'ffSetUpdateUrl',
            'json-format:ffPackage',
            'setAppInfo',
            'exec:buildFF',
            'ffRenameBuild',
            'ffRePack',
            'getHash',
            'copySsFigVersion'
        ]);
    });
};