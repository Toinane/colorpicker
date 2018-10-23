const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const commonConfig = {
  mode: 'production',
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
      entry: { gui: './src/renderer/colorpicker.ts' },
      plugins: [
        new CopyWebpackPlugin([{
          from: 'src/**/*',
          to: '',
          flatten: true,
          ignore: ['*.ts']
        }], {})
      ]
    },
    commonConfig
  ),
];