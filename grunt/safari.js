exports.run = function(grunt) {
  grunt.registerTask('makeSafariUpdateFile', function() {
    var vendor = grunt.template.process('<%= output %><%= vendor %>../');
    var fileName = 'update.plist';
    var content = grunt.file.read('src/vendor/safari/' + fileName);
    content = content.replace('%buildName%', grunt.config('buildName'));
    content = content.replace('%extVersion%', grunt.config('pkg.extVersion'));
    content = content.replace('%extVersion%', grunt.config('pkg.extVersion'));
    grunt.file.write(vendor + fileName, content);
  });

  grunt.registerTask('safariChangeVersion', function() {
    var configPath = grunt.template.process('<%= output %><%= vendor %>Info.plist');
    var content = grunt.file.read(configPath);
    content = content.replace('%extVersion%', grunt.config('pkg.extVersion'));
    content = content.replace('%extVersion%', grunt.config('pkg.extVersion'));
    grunt.file.write(configPath, content);
  });

  grunt.registerTask('safari', function() {
    grunt.config.merge({
      copy: {
        vendorSafari: {
          cwd: 'src/vendor/safari/',
          expand: true,
          src: [
            'bg.html',
            '*.png',
            'Info.plist',
            'Settings.plist'
          ],
          dest: '<%= output %><%= vendor %>'
        }
      },
      buildName: 'build_safari',
      vendor: 'safari/<%= buildName %>.safariextension/',
      libFolder: 'js/',
      dataJsFolder: 'js/',
      includesFolder: 'includes/',
      dataFolder: '',
      appId: 'safariExt',
      browser: 'safari'
    });
    grunt.task.run([
      'extensionBase',
      'copy:vendorSafari',
      'buildJs',
      'setAppInfo',
      'compressJs',
      'safariChangeVersion',
      'makeSafariUpdateFile'
    ]);
  });
};