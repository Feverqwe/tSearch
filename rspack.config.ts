import path from 'node:path';
import {stripTypeScriptTypes} from 'node:module';
import {rspack, type Configuration} from '@rspack/core';

import manifest from './src/manifest.json' with {type: 'json'};
import {extensionDir} from './builder/paths.ts';

export default (
  _env: unknown,
  {mode = 'production'}: {mode?: Configuration['mode']},
): Configuration => {
  const isProduction = mode === 'production';

  return {
    context: import.meta.dirname,
    mode,
    target: `browserslist: Chrome >= ${manifest.minimum_chrome_version}`,
    devtool: isProduction ? false : 'source-map',
    watchOptions: {ignored: '**/node_modules/**'},
    entry: {
      background: './src/background',
      sandbox: './src/sandbox',
      popup: './src/Popup',
      'theme-bootstrap': './src/ui/themeBootstrap',
      index: './src/App',
      'tab-fetch': './src/tabFetch',
    },
    output: {
      path: extensionDir,
      filename: 'js/[name].js',
      chunkFilename: 'js/chunks/[name].js',
      cssFilename: 'css/[name].css',
      cssChunkFilename: 'css/chunks/[name].css',
      assetModuleFilename: 'assets/img/[name].[contenthash:8][ext]',
      publicPath: '/',
      clean: true,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json'],
      alias: {jszip$: 'jszip/dist/jszip.min.js'},
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          loader: 'builtin:swc-loader',
          options: {
            detectSyntax: 'auto',
            isModule: 'unknown',
            jsc: {
              transform: {
                useDefineForClassFields: false,
                react: {runtime: 'automatic', development: !isProduction},
              },
            },
          },
        },
        {
          test: /\.css$/,
          type: 'css/global',
        },
        {
          test: /\.less$/,
          type: 'css/global',
          use: 'less-loader',
        },
        {
          test: /\.(png|svg)$/,
          type: 'asset',
          parser: {dataUrlCondition: {maxSize: 8192}},
        },
      ],
    },
    optimization: {
      minimizer: [
        new rspack.SwcJsMinimizerRspackPlugin({exclude: /^(trackers|explorerModules)\//}),
        new rspack.LightningCssMinimizerRspackPlugin(),
      ],
      splitChunks: {
        cacheGroups: {
          default: false,
          defaultVendors: false,
          // The manifest and tabs.executeScript each load a standalone entry.
          ui: {
            name: 'commons-ui',
            chunks: ({name}) => name === 'index' || name === 'popup',
            minChunks: 2,
          },
        },
      },
    },
    plugins: [
      ...['index', 'popup', 'sandbox'].map(
        (name) =>
          new rspack.HtmlRspackPlugin({
            filename: `${name}.html`,
            template: path.join('src/templates', `${name}.html`),
            chunks: [name],
          }),
      ),
      new rspack.CopyRspackPlugin({
        patterns: [
          {from: 'src/manifest.json'},
          ...['assets/icons', '_locales'].map((folder) => ({
            from: `src/${folder}`,
            to: folder,
            toType: 'dir',
          })),
          ...['trackers', 'explorerModules'].map((folder) => ({
            from: `src/${folder}/*.ts`,
            to: `${folder}/[name].js`,
            toType: 'template' as const,
            transform: (source: Buffer) => stripTypeScriptTypes(source.toString()),
          })),
        ],
      }),
      new rspack.DefinePlugin({
        BUILD_ENV: {
          mode: JSON.stringify(mode),
          version: JSON.stringify(manifest.version),
          FLAG_ENABLE_LOGGER: 'true',
        },
      }),
    ],
    ignoreWarnings: [
      {module: /react-datepicker/, message: /request of a dependency is an expression/},
    ],
    performance: {hints: false},
  };
};
