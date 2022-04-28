const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const ElectronReloadPlugin = require('../scripts/electron-reload-plugin');

module.exports = (_, config) => {
  const APP_MODE = config.mode;
  const isDevelopment = APP_MODE === 'development';

  console.log('Running in', APP_MODE, 'mode.');

  const electron = {
    name: 'back',
    mode: APP_MODE,
    target: 'electron-main',
    resolve: {
      extensions: ['.js', '.ts', '.json'],
    },
    entry: {
      main: './electron/main.ts',
    },
    output: {
      path: path.resolve(__dirname, '..', 'dist'),
      filename: '[name].js',
    },
    plugins: [new ESLintPlugin()],
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          loader: 'ts-loader',
        },
      ],
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserWebpackPlugin({
          parallel: true,
          extractComments: false,
        }),
      ],
    },
    devtool: isDevelopment ? 'inline-source-map' : false,
    externalsType: 'node-commonjs',
    externals: {
      // 'electron-acrylic-window': 'electron-acrylic-window',
    },
  };

  const preload = {
    name: 'preload',
    mode: APP_MODE,
    target: 'electron-main',
    entry: {
      main_preload: './electron/preload/main.ts',
    },
    output: {
      path: path.resolve(__dirname, '..', 'dist'),
      filename: '[name].js',
    },
    plugins: [new ESLintPlugin()],
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          loader: 'ts-loader',
        },
      ],
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserWebpackPlugin({
          parallel: true,
          extractComments: false,
        }),
      ],
    },
    devtool: false,
  };

  const preact = {
    name: 'front',
    mode: APP_MODE,
    target: 'web',
    resolve: {
      extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
      alias: {
        react: 'preact/compat',
        'react-dom/test-utils': 'preact/test-utils',
        'react-dom': 'preact/compat',
        'react/jsx-runtime': 'preact/jsx-runtime',
      },
    },
    entry: {
      renderer: './src/app.tsx',
    },
    output: {
      path: path.resolve(__dirname, '..', 'dist'),
      filename: '[name].js',
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          loader: 'ts-loader',
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        {
          test: /\.(bmp|ico|gif|jpe?g|png|svg|ttf|eot|woff?2?)$/,
          loader: 'url-loader',
        },
      ],
    },
    plugins: [
      new ESLintPlugin(),
      new MiniCssExtractPlugin(),
      new HtmlWebpackPlugin({
        template: './src/public/index.html',
      }),
    ],
    optimization: {
      minimizer: [new CssMinimizerPlugin(), new TerserWebpackPlugin()],
    },
    devtool: isDevelopment ? 'inline-source-map' : false,
  };

  if (isDevelopment) {
    electron.entry.main_preload = './electron/preload/main.ts';
    electron.plugins.push(new ElectronReloadPlugin());
    electron.watch = true;
    electron.watchOptions = {
      poll: 300,
      ignored: /node_modules/,
    };

    preact.devServer = {
      watchFiles: ['src/**/*'],
      compress: true,
      static: {
        directory: path.join(__dirname, 'src', 'public'),
      },
      port: 3030,
      hot: true,
      client: {
        overlay: true,
      },
    };
  }

  return [electron, preload, preact];
};
