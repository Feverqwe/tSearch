const fs = require('fs-extra');
const path = require('path');

const buildTrackersJson = () => {
  return fs.readdir(path.join(__dirname, 'src', 'trackers')).then(files => {
    const trackers = files.filter(filename => /.+\.js$/.test(filename)).map(filename => path.basename(filename, path.extname(filename)));
    return fs.writeJson(path.join(__dirname, 'src', 'trackers.json'), trackers, {
      spaces: 2
    });
  });
};

buildTrackersJson();