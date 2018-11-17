require("@babel/register")({
  "presets": ["@babel/preset-env"],
  cache: false
});

require('./defaultBuildEnv');

const fs = require('fs-extra');
const path = require('path');
const getExploreSectionCodeMeta = require('../src/tools/getExploreModuleCodeMeta').default;

const buildExplorersJson = () => {
  const place = path.join(__dirname, '../src/explorerModules');
  return fs.readdir(place).then(files => {
    const trackerIds = files.filter(filename => /.+\.js$/.test(filename)).map(filename => path.basename(filename, path.extname(filename)));
    return Promise.all(trackerIds.sort().map(id => {
      return fs.readFile(path.join(place, `${id}.js`)).then(code => {
        return {id, version: getExploreSectionCodeMeta(code.toString()).version};
      });
    })).then(results => {
      const result = {};
      results.forEach(({id, version}) => result[id] = version);
      return result;
    });
  }).then(trackers => {
    return fs.writeJson(path.join(__dirname, '../src/explorers.json'), trackers, {
      spaces: 2
    });
  });
};

buildExplorersJson();