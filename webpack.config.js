const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const minify = require('html-minifier').minify;
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
          transform: content => cssMinifier(content)
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

const cssMinifier = function (css) {
  var startIndex = 0, 
      endIndex = 0,
      iemac = false,
      preserve = false,
      i = 0, max = 0,
      preservedTokens = [],
      token = '';

  css = css.toString();
  css = css.replace(/("([^\\"]|\\.|\\)*")|('([^\\']|\\.|\\)*')/g, function(match) {
    var quote = match[0];
    preservedTokens.push(match.slice(1, -1));
    return quote + "___PRESERVED_TOKEN_" + (preservedTokens.length - 1) + "___" + quote;
  });

  while ((startIndex = css.indexOf("/*", startIndex)) >= 0) {
    preserve = css.length > startIndex + 2 && css[startIndex + 2] === '!';
    endIndex = css.indexOf("*/", startIndex + 2);
    if (endIndex < 0) {
      if (!preserve) {
        css = css.slice(0, startIndex);
      }
    } else if (endIndex >= startIndex + 2) {
      if (css[endIndex - 1] === '\\') {
        css = css.slice(0, startIndex) + "/*\\*/" + css.slice(endIndex + 2);
        startIndex += 5;
        iemac = true;
      } else if (iemac && !preserve) {
        css = css.slice(0, startIndex) + "/**/" + css.slice(endIndex + 2);
        startIndex += 4;
        iemac = false;
      } else if (!preserve) {
        css = css.slice(0, startIndex) + css.slice(endIndex + 2);
      } else {
        token = css.slice(startIndex+3, endIndex); // 3 is "/*!".length
        preservedTokens.push(token);
        css = css.slice(0, startIndex+2) + "___PRESERVED_TOKEN_" + (preservedTokens.length - 1) + "___" + css.slice(endIndex);
        if (iemac) iemac = false;
        startIndex += 2;
      }
    }
  }

  css = css.replace(/\s+/g, " ");
  css = css.replace(/(^|\})(([^\{:])+:)+([^\{]*\{)/g, function(m) {
    return m.replace(":", "___PSEUDOCLASSCOLON___");
  });
  css = css.replace(/\s+([!{};:>+\(\)\],])/g, '$1');
  css = css.replace(/___PSEUDOCLASSCOLON___/g, ":");
  css = css.replace(/:first-(line|letter)({|,)/g, ":first-$1 $2");
  css = css.replace(/\*\/ /g, '*/'); 
  css = css.replace(/^(.*)(@charset "[^"]*";)/gi, '$2$1');
  css = css.replace(/^(\s*@charset [^;]+;\s*)+/gi, '$1');
  css = css.replace(/\band\(/gi, "and (");
  css = css.replace(/([!{}:;>+\(\[,])\s+/g, '$1');
  css = css.replace(/;+}/g, "}");
  css = css.replace(/([\s:])(0)(px|em|%|in|cm|mm|pc|pt|ex)/gi, "$1$2");
  css = css.replace(/:0 0 0 0;/g, ":0;");
  css = css.replace(/:0 0 0;/g, ":0;");
  css = css.replace(/:0 0;/g, ":0;");
  css = css.replace(/background-position:0;/gi, "background-position:0 0;");
  css = css.replace(/(:|\s)0+\.(\d+)/g, "$1.$2");
  css = css.replace(/rgb\s*\(\s*([0-9,\s]+)\s*\)/gi, function(){
    var rgbcolors = arguments[1].split(',');
    for (var i = 0; i < rgbcolors.length; i++) {
      rgbcolors[i] = parseInt(rgbcolors[i], 10).toString(16);
      if (rgbcolors[i].length === 1) rgbcolors[i] = '0' + rgbcolors[i];
    }
    return '#' + rgbcolors.join('');
  });

  css = css.replace(/([^"'=\s])(\s*)#([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])/gi, function(){ 
    var group = arguments;
    if (
      group[3].toLowerCase() === group[4].toLowerCase() &&
      group[5].toLowerCase() === group[6].toLowerCase() &&
      group[7].toLowerCase() === group[8].toLowerCase()
    ) {
      return (group[1] + group[2] + '#' + group[3] + group[5] + group[7]).toLowerCase();
    } else {
      return group[0].toLowerCase();
    }
  });

  css = css.replace(/[^\};\{\/]+\{\}/g, "");
  css = css.replace(/;;+/g, ";");

  for(i = 0, max = preservedTokens.length; i < max; i++) {
    css = css.replace("___PRESERVED_TOKEN_" + i + "___", preservedTokens[i]);
  }

  css = css.replace(/^\s+|\s+$/g, "");
  return css;
};