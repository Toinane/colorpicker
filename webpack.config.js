const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const minify = require('html-minifier').minify;
const csso = require('csso');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const imageminMozjpeg = require('imagemin-mozjpeg');

const commonConfig = {
  watch: true,
  mode: 'production',
  devtool: "inline-source-map",
  output: {
    path: path.resolve(__dirname , 'dist'),
    filename: '[name].js'
  },
  node: {
    __dirname: false
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        enforce: 'pre',
        loader: 'tslint-loader',
        options: {
          typeCheck: true,
          emitErrors: true
        }
      }, {
        test: /\.tsx?$/,
        loader: 'ts-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.ts', '.json']
  }
}

module.exports = [
  Object.assign({
      target: 'electron-main',
      entry: { main: './src/main/main.ts' }
    },
    commonConfig
  ),
  Object.assign({
      target: 'electron-renderer',
      entry: { colorpicker: './src/renderer/colorpicker/colorpicker.ts' },
      plugins: [
        new CopyWebpackPlugin([{
          from: 'src/**/*.html',
          to: '',
          flatten: true,
          transform: content => minify(content.toString(), {
            collapseBooleanAttributes: true,
            collapseWhitespace: true,
            removeAttributeQuotes: true,
            removeComments: true
          })
        }], {}),
        new CopyWebpackPlugin([{
          from: 'src/**/*.css',
          to: '',
          flatten: true,
          transform: content => csso.minify(content).css
        }], {}),
        new CopyWebpackPlugin([{
          from: 'src/assets',
          to: '',
          flatten: true,
        }], {}),
        new ImageminPlugin({
          test: /\.(jpe?g|png|gif|svg)$/i,
          optipng: { optimizationLevel: 10 },
          plugins: [
            imageminMozjpeg({
              quality: 40,
              progressive: true
            })
          ]
        })
      ]
    },
    commonConfig
  ),
];