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
    browsers: ['Chrome >= 22']
  }
};

if (isWatch) {
  env.targets.browsers = ['Chrome >= 65'];
}

const config = {
  entry: {
    bg: './src/js/bg',
    popup: './src/js/Popup',
    index: './src/js/Index',
    options: './src/js/options',
    sandbox: './src/js/sandbox',
    history: './src/js/history',
    editor: './src/js/editor',
    magic: './src/js/magic',
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
        test: /.jsx?$/,
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
      {from: './src/trackers.json',},
      {from: './src/icons', to: './icons'},
      {from: './src/trackers', to: './trackers'},
      {from: './src/exploreSections', to: './exploreSections'},
      {from: './src/_locales', to: './_locales'},
    ]),
    new HtmlWebpackPlugin({
      filename: 'popup.html',
      template: './src/popup.html',
      chunks: ['commons', 'popup']
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/index.html',
      chunks: ['commons', 'index']
    }),
    new HtmlWebpackPlugin({
      filename: 'options.html',
      template: './src/options.html',
      chunks: ['commons', 'options']
    }),
    new HtmlWebpackPlugin({
      filename: 'sandbox.html',
      template: './src/sandbox.html',
      chunks: ['sandbox']
    }),
    new HtmlWebpackPlugin({
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
    }),
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

if (isWatch) {
  config.plugins.push(
    new DefinePlugin({
      'process.env': {
        'DEBUG': JSON.stringify('*')
      }
    })
  );
}

module.exports = config;