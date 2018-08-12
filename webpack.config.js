require('./builder/defaultBuildEnv');
const {DefinePlugin} = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const isWatch = process.argv.some(function (arg) {
  return arg === '--watch';
});

const outputPath = path.resolve('./dist/');

const env = {
  targets: {
    browsers: ['Chrome >= 48']
  }
};

if (isWatch) {
  env.targets.browsers = ['Chrome >= 65'];
} else {
  BUILD_ENV.FLAG_ENABLE_LOGGER = false;
}

const config = {
  entry: {
    bg: './src/background',
    sandbox: './src/sandbox',
    popup: './src/Popup',
    index: './src/App',
    options: './src/Options',
    /*history: './src/js/history',
    editor: './src/js/editor',
    magic: './src/js/magic',*/
  },
  output: {
    path: outputPath,
    filename: '[name].js'
  },
  devtool: 'source-map',
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          name: "commons",
          chunks: chunk => ['bg', 'popup', 'index', 'options', 'history', 'editor', 'magic'].indexOf(chunk.name) !== -1,
          minChunks: 2,
          priority: -10
        },
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              'transform-decorators-legacy'
            ],
            presets: [
              'react',
              ['env', env]
            ]
          }
        }
      },
      {
        test: /\.(css|less)$/,
        use: [{
          loader: "style-loader"
        }, {
          loader: "css-loader"
        }, {
          loader: "clean-css-loader"
        }, {
          loader: "less-loader"
        }]
      },
      {
        test: /\.(png|svg)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 8192
          }
        }]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new CleanWebpackPlugin(outputPath),
    new CopyWebpackPlugin([
      {from: './src/manifest.json',},
      {from: './src/assets', to: './assets'},
      {from: './src/_locales', to: './_locales'},
    ]),
    new HtmlWebpackPlugin({
      filename: 'sandbox.html',
      template: './src/templates/sandbox.html',
      chunks: ['sandbox']
    }),
    new HtmlWebpackPlugin({
      filename: 'popup.html',
      template: './src/templates/popup.html',
      chunks: ['commons', 'popup']
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/templates/index.html',
      chunks: ['commons', 'index']
    }),
    new HtmlWebpackPlugin({
      filename: 'options.html',
      template: './src/templates/options.html',
      chunks: ['commons', 'options']
    }),
    /*new HtmlWebpackPlugin({
      filename: 'history.html',
      template: './src/history.html',
      chunks: ['commons', 'history']
    }),
    new HtmlWebpackPlugin({
      filename: 'editor.html',
      template: './src/editor.html',
      chunks: ['commons', 'editor']
    }),
    new HtmlWebpackPlugin({
      filename: 'magic.html',
      template: './src/magic.html',
      chunks: ['commons', 'magic']
    }),*/
    new DefinePlugin({
      'BUILD_ENV': Object.keys(BUILD_ENV).reduce((obj, key) => {
        obj[key] = JSON.stringify(BUILD_ENV[key]);
        return obj;
      }, {}),
    })
  ]
};

if (!isWatch) {
  Object.keys(config.entry).forEach(entryName => {
    let value = config.entry[entryName];
    if (!Array.isArray(value)) {
      value = [value];
    }
    value.unshift('babel-polyfill');

    config.entry[entryName] = value;
  });
}

module.exports = config;