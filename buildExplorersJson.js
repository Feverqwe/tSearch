import getExploreSectionCodeMeta from "./src/js/tools/getExploreSectionCodeMeta";

const fs = require('fs-extra');
const path = require('path');

const buildExplorersJson = () => {
  const place = path.join(__dirname, 'src', 'exploreSections');
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
    return fs.writeJson(path.join(__dirname, 'src', 'explorers.json'), trackers, {
      spaces: 2
    });
  });
};

buildExplorersJson();