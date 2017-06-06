/**
 * Created by Anton on 13.01.2017.
 */
module.exports = function(grunt) {
    "use strict";
    var path = require('path');

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.initConfig({
        output: 'output/',
        vendor: '/',
        clean: {
            vendor: [
                '<%= output %><%= vendor %>*'
            ],
            output: [
                '<%= output %>*'
            ]
        },
        copy: {
            main: {
                cwd: 'src/',
                expand: true,
                src: [
                    '**'
                ],
                dest: '<%= output %><%= vendor %>'
            }
        }
    });

    var compressJs = (function () {
        var ccVersion = require('google-closure-compiler/package.json').version;
        var version = ccVersion.replace(/[^\d]/, '_');
        var ClosureCompiler = require('google-closure-compiler').compiler;
        var crypto = require('crypto');
        var fs = require('fs');
        var getHash = function(filePath) {
            return new Promise(function (resolve) {
                var fd = fs.createReadStream(filePath);
                var hash = crypto.createHash('sha256');
                hash.setEncoding('hex');
                fd.on('end', function () {
                    hash.end();
                    resolve(hash.read());
                });
                fd.pipe(hash);
            });
        };
        var fileExists = function (filePath) {
            return new Promise(function (resolve) {
                fs.stat(filePath, function (err, stat) {
                    if (err) {
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                });
            })
        };
        var compressJs = function (filePath, minFilePath) {
            return new Promise(function (resolve, reject) {
                var compilerProcess = new ClosureCompiler({
                    js: filePath,
                    language_in: 'ECMASCRIPT5_STRICT',
                    compilation_level: 'SIMPLE_OPTIMIZATIONS'
                });
                compilerProcess.run(function(exitCode, stdOut, stdErr) {
                    if (exitCode === 0) {
                        if (stdErr) {
                            console.log(stdErr);
                        }
                        return fs.writeFile(minFilePath, stdOut, function (err) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                    } else {
                        reject(new Error(exitCode + ': ' + stdErr));
                    }
                });
            })
        };
        var mkdirSync = function (path) {
            try {
                fs.accessSync(path, fs.F_OK);
            } catch (e) {
                if (e.code === 'ENOENT') {
                    fs.mkdirSync(path);
                } else {
                    throw e;
                }
            }
        };

        return function (files) {
            var profileMinPath = path.join(__dirname, './output/cache');
            mkdirSync(profileMinPath);

            var promise = Promise.resolve();
            files.forEach(function (filePath) {
                promise = promise.then(function () {
                    return getHash(filePath).then(function (hash) {
                        var minFilename = hash + '-' + version + '.js';
                        var minFilePath = path.join(profileMinPath, minFilename);
                        return fileExists(minFilePath).then(function (minFileExists) {
                            var compressPromise;
                            if (minFileExists) {
                                compressPromise = Promise.resolve()
                            } else {
                                compressPromise = compressJs(filePath, minFilePath);
                            }
                            return compressPromise.then(function () {
                                return new Promise(function (resolve, reject) {
                                    var rd = fs.createReadStream(minFilePath);
                                    rd.on("error", function(err) {
                                        reject(err);
                                    });
                                    var wr = fs.createWriteStream(filePath);
                                    wr.on("error", function(err) {
                                        reject(err);
                                    });
                                    wr.on("close", function(ex) {
                                        resolve();
                                    });
                                    rd.pipe(wr);
                                });
                            });
                        });
                    });
                });
            });
            return promise;
        };
    })();

    grunt.registerTask('buildChrome', function () {
        grunt.config.set('vendor', 'chrome/');

        var files = grunt.file.expand({
            cwd: 'src/'
        }, ["./js/*.js", "./js/module/*.js"]).map(function (filepath) {
            return path.resolve(grunt.config('output') + grunt.config('vendor') + filepath);
        });

        grunt.registerTask('compressJs', function () {
            var async = this.async();
            compressJs(files).then(async);
        });

        grunt.task.run([
            'clean:vendor',
            'copy:main',
            'compressJs'
        ]);
    });

    grunt.registerTask('default', [
        'buildChrome'
    ]);
};