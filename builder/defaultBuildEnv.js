const getArgvValue = require('./getArgvValue');
const path = require('path');

const mode = getArgvValue('--mode') || 'development';

global.BUILD_ENV = {
  outputPath: path.join(__dirname, '../dist/'),
  mode: mode,
  devtool: mode === 'development' ? 'source-map' : 'none',
  babelEnvOptions: {
    targets: {
      chrome: mode === 'development' ? '68' : '60'
    }
  },
  FLAG_ENABLE_LOGGER: mode === 'development',
};