require('./defaultBuildEnv');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

const compressDist = () => {
  const ext = 'zip';
  const dist = path.join(BUILD_ENV.outputPath, 'dist');
  const outputPath = BUILD_ENV.outputPath;

  const zipFolder = (srcFolder, zipFilePath, callback) => {
    const output = fs.createWriteStream(zipFilePath);
    const zipArchive = archiver('zip', {
      zlib: { level: 9 }
    });

    output.on('close', function() {
      callback();
    });

    zipArchive.pipe(output);

    zipArchive.glob('**/*', {
      cwd: srcFolder
    });

    zipArchive.finalize(function(err, bytes) {
      if(err) {
        callback(err);
      }
    });
  };

  return new Promise((resolve, reject) => {
    zipFolder(dist, path.join(outputPath, `${BUILD_ENV.distName}.${ext}`), err => {
      err ? reject(err) : resolve();
    })
  });
};

compressDist();