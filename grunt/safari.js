exports.run = function(grunt) {
  return;
  grunt.registerTask('makeSafariUpdateFile', function() {
    var vendor = grunt.config('output') + grunt.config('vendor') + '../';
    var fileName = 'update.plist';
    var content = grunt.file.read('src/vendor/safari/' + fileName);
    content = content.replace('%buildName%', grunt.config('buildName'));
    content = content.replace('%extVersion%', grunt.config('pkg.extVersion'));
    content = content.replace('%extVersion%', grunt.config('pkg.extVersion'));
    grunt.file.write(vendor + fileName, content);
  });

  grunt.registerTask('safariChangeVersion', function() {
    var configPath = grunt.config('output') + grunt.config('vendor') + 'Info.plist';
    var content = grunt.file.read(configPath);
    content = content.replace('%extVersion%', grunt.config('pkg.extVersion'));
    content = content.replace('%extVersion%', grunt.config('pkg.extVersion'));
    grunt.file.write(configPath, content);
  });

  grunt.registerTask('safari', function() {
    grunt.config.merge({
      copy: {
        vendorSafari: {
          expand: true,
          src: [
            'src/vendor/safari/background.html',
            'src/vendor/safari/*.png',
            'src/vendor/safari/Info.plist',
            'src/vendor/safari/Settings.plist'
          ],
          dest: '<%= output %><%= vendor %>',
          rename: function() {
            return arguments[0] + arguments[1].substr('src/vendor/safari/'.length);
          }
        }
      },
      buildName: 'build_safari',
      vendor: 'safari/<%= buildName %>.safariextension/',
      libFolder: 'js/',
      dataJsFolder: 'js/',
      includesFolder: 'includes/',
      dataFolder: ''
    });
    grunt.task.run([
      'extensionBaseMin',
      'copy:vendorSafari',
      'safariChangeVersion',
      'makeSafariUpdateFile'
    ]);
  });
};