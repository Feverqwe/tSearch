import getTrackerCodeMeta from "./src/js/tools/getTrackerCodeMeta";

const fs = require('fs-extra');
const path = require('path');

const buildTrackersJson = () => {
  const place = path.join(__dirname, 'src', 'trackers');
  return fs.readdir(place).then(files => {
    const trackerIds = files.filter(filename => /.+\.js$/.test(filename)).map(filename => path.basename(filename, path.extname(filename)));
    const trackers = {};
    return Promise.all(trackerIds.map(id => {
      return fs.readFile(path.join(place, `${id}.js`)).then(code => {
        trackers[id] = getTrackerCodeMeta(code.toString()).version;
      });
    })).then(() => trackers);
  }).then(trackers => {
    return fs.writeJson(path.join(__dirname, 'src', 'trackers.json'), trackers, {
      spaces: 2
    });
  });
};

buildTrackersJson();