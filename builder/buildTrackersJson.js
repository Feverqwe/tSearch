require("@babel/register")({
  "presets": ["@babel/preset-env"],
  cache: false
});

require('./defaultBuildEnv');

const fs = require('fs-extra');
const path = require('path');
const getTrackerCodeMeta = require('../src/tools/getTrackerCodeMeta').default;

const buildTrackersJson = () => {
  const place = path.join(__dirname, '../src/trackers');
  return fs.readdir(place).then(files => {
    const trackerIds = files.filter(filename => /.+\.js$/.test(filename)).map(filename => path.basename(filename, path.extname(filename)));
    return Promise.all(trackerIds.sort().map(id => {
      return fs.readFile(path.join(place, `${id}.js`)).then(code => {
        return {id, version: getTrackerCodeMeta(code.toString()).version};
      });
    })).then(results => {
      const result = {};
      results.forEach(({id, version}) => result[id] = version);
      return result;
    });
  }).then(trackers => {
    return fs.writeJson(path.join(__dirname, '../src/trackers.json'), trackers, {
      spaces: 2
    });
  });
};

buildTrackersJson();