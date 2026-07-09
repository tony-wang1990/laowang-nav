/**
 * LaoWang Nav is built using Vue (2). This is the main Vue and Webpack configuration
 *
 * User Configurable Options:
 * - NODE_ENV: Sets the app mode (production, development, test).
 * - BASE_URL: Root URL for the app deployment (defaults to '/').
 * - INTEGRITY: Enables SRI, set to 'true' to activate.
 * - USER_DATA_DIR: Sets an alternative dir for user data (defaults ./user-data).
 * - IS_DOCKER: Indicates if running in a Docker container.
 * - IS_SERVER: Indicates if running as a server (as opposed to static build).
 *
 * Documentation:
 * - Vue CLI Config options: https://cli.vuejs.org/config
 * - For LaoWang Nav docs, see the repo: https://github.com/tony-wang1990/laowang-nav
 *
 * Note: ES7 syntax is not supported in this configuration context.
 * Licensed under the MIT License, (C) Alicia Sykes 2024 (see LICENSE for details).
 */

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Get app mode: production, development, or test
const mode = process.env.NODE_ENV || 'production';

// Get current version
process.env.VUE_APP_VERSION = require('./package.json').version;

// Get default info for PWA
const { pwa } = require('./src/utils/defaults');

// Get base URL
const publicPath = process.env.BASE_URL || '/';

// Should enable Subresource Integrity (SRI) on link and script tags
const integrity = process.env.INTEGRITY === 'true';

// If neither env vars are set, then it's a static build
const isServer = process.env.IS_DOCKER || process.env.IS_SERVER || false;

// Use copy-webpack-plugin to copy user-data to dist IF not running as a server
const plugins = !isServer ? [
  new CopyWebpackPlugin({
    patterns: [
      { from: './user-data', to: './' },
    ],
  }),
] : [];

// Webpack Config
const configureWebpack = {
  devtool: mode === 'production' ? false : 'source-map',
  mode,
  plugins,
  resolve: {
    alias: {
      'js-yaml$': path.join(
        path.dirname(require.resolve('js-yaml/package.json')),
        'dist',
        'js-yaml.cjs.js',
      ),
    },
  },
  module: {
    rules: [
      { test: /.svg$/, loader: 'vue-svg-loader' },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: { appendTsSuffixTo: [/\.vue$/] },
      },
    ],
  },
  performance: {
    maxEntrypointSize: 10000000,
    maxAssetSize: 10000000,
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 10,
      maxAsyncRequests: 10,
      cacheGroups: {
        framework: {
          test: /[\\/]node_modules[\\/](vue|vue-router|vuex|vue-i18n)[\\/]/,
          name: 'chunk-framework',
          priority: 40,
          enforce: true,
        },
        editor: {
          test: /[\\/]node_modules[\\/](v-jsoneditor|jsoneditor|ace-builds)[\\/]/,
          name: 'chunk-editor',
          priority: 30,
          enforce: true,
        },
        charts: {
          test: /[\\/]node_modules[\\/](frappe-charts|chart.js|apexcharts)[\\/]/,
          name: 'chunk-charts',
          priority: 25,
          enforce: true,
        },
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'chunk-vendors',
          priority: 10,
          reuseExistingChunk: true,
        },
      },
    },
  },
};

// Development server config
const devServer = {
  contentBase: [
    path.join(__dirname, 'public'),
    path.join(__dirname, process.env.USER_DATA_DIR || 'user-data'),
  ],
  watchContentBase: true,
  publicPath: '/',
};

// Application pages
const pages = {
  laowang: {
    entry: 'src/main.js',
    filename: 'index.html',
  },
};

// Export the main Vue app config
module.exports = {
  lintOnSave: false,
  parallel: false,
  productionSourceMap: false,
  publicPath,
  pwa,
  integrity,
  configureWebpack,
  pages,
  devServer,
  chainWebpack: config => {
    config.module.rules.delete('svg');
    config.cache({
      type: 'filesystem',
    });
  },
};
